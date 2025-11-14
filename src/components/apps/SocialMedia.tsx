'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Heart, MessageCircle, Share2, User, Home, Search, Bell, Menu, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  where,
  setDoc,
} from 'firebase/firestore';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

interface UserProfile {
    id: string;
    name: string;
    username: string;
    avatar: string;
    following?: string[];
}

interface Post {
    userId: string;
    userName: string;
    userUsername: string;
    userAvatar: string;
    content: string;
    likedBy: string[];
    createdAt: any; // Firestore timestamp
}


// New component to handle individual user card logic
const UserCard = ({ u, currentUserProfile, onFollow }: { u: UserProfile, currentUserProfile: UserProfile | null, onFollow: (targetUserId: string) => void }) => {
    const firestore = useFirestore();
    
    const userFollowersQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'users'), where('following', 'array-contains', u.id)) : null
    , [firestore, u.id]);
    const { data: userFollowers, isLoading: userFollowersLoading } = useCollection<UserProfile>(userFollowersQuery);

    return (
        <div key={u.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl">
                    {u.avatar}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{u.name}</h3>
                    <p className="text-sm text-gray-500">@{u.username}</p>
                    <div className="text-xs text-gray-400 mt-1 flex gap-4">
                        <span>Following {u.following?.length || 0}</span>
                        <span>Followers {userFollowersLoading ? '...' : userFollowers?.length || 0}</span>
                    </div>
                </div>
                <button
                    onClick={() => onFollow(u.id)}
                    className={`px-6 py-2 rounded-lg font-medium ${
                    currentUserProfile?.following?.includes(u.id)
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {currentUserProfile?.following?.includes(u.id) ? 'Following' : 'Follow'}
                </button>
            </div>
        </div>
    );
};


export default function SocialMediaApp() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // --- Firestore Data ---
  const postsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')) : null
  , [firestore]);
  const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

  const usersQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'users'), where('id', '!=', user?.uid || '')) : null
  , [firestore, user]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const currentUserDocRef = useMemoFirebase(() => 
    firestore && user ? doc(firestore, 'users', user.uid) : null
  , [firestore, user]);
  const { data: currentUserProfile, isLoading: profileLoading } = useDoc<UserProfile>(currentUserDocRef);
  
  const followersQuery = useMemoFirebase(() =>
    firestore && user ? query(collection(firestore, 'users'), where('following', 'array-contains', user.uid)) : null
  , [firestore, user]);
  const { data: followers, isLoading: followersLoading } = useCollection<UserProfile>(followersQuery);

  const [editedName, setEditedName] = useState('');
  const [editedUsername, setEditedUsername] = useState('');

  useEffect(() => {
    if (currentUserProfile) {
      setEditedName(currentUserProfile.name);
      setEditedUsername(currentUserProfile.username);
    }
  }, [currentUserProfile]);

  useEffect(() => {
    if (user && !profileLoading && !currentUserProfile && firestore) {
      const newUserProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || 'New User',
        username: user.email?.split('@')[0] || `user${Date.now()}`,
        avatar: '👤',
        following: [],
      };
      const userDoc = doc(firestore, 'users', user.uid);
      setDoc(userDoc, newUserProfile).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userDoc.path, operation: 'create', requestResourceData: newUserProfile }));
      });
    }
  }, [user, profileLoading, currentUserProfile, firestore]);

  const handleLike = async (postId: string) => {
    if (!user || !firestore) return;
    const postDoc = doc(firestore, 'posts', postId);
    const post = posts?.find(p => p.id === postId);
    if (!post) return;

    const isLiked = post.likedBy.includes(user.uid);
    const updatedLikedBy = isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid);
    
    updateDoc(postDoc, { likedBy: updatedLikedBy }).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postDoc.path, operation: 'update', requestResourceData: { likedBy: '...' } }));
    });
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user || !firestore || !currentUserProfile) return;

    const postPayload: Post = {
      userId: user.uid,
      userName: currentUserProfile.name,
      userUsername: currentUserProfile.username,
      userAvatar: currentUserProfile.avatar,
      content: newPost,
      likedBy: [],
      createdAt: serverTimestamp()
    };

    const postsCol = collection(firestore, 'posts');
    addDoc(postsCol, postPayload).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: postsCol.path, operation: 'create', requestResourceData: postPayload }));
    });
    
    setNewPost('');
    setShowNewPost(false);
  };

  const handleFollow = (targetUserId: string) => {
    if (!user || !firestore || !currentUserProfile) return;

    const currentUserRef = doc(firestore, 'users', user.uid);
    const isFollowing = currentUserProfile.following?.includes(targetUserId);
    const followUpdate = isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId);

    updateDoc(currentUserRef, { following: followUpdate })
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: currentUserRef.path, operation: 'update', requestResourceData: { following: '...' } }));
      });
    
    if (!isFollowing) {
        const notificationCol = collection(firestore, 'users', targetUserId, 'notifications');
        const notificationPayload = {
            applicationId: 'socialMedia',
            title: 'New Follower',
            message: `${currentUserProfile.name || 'Someone'} started following you.`,
            timestamp: serverTimestamp(),
            isRead: false,
        };
        addDoc(notificationCol, notificationPayload).catch(error => {
            console.error("Error creating notification:", error);
            // Optionally emit a permission error if needed for notifications
        });
    }
  };
  
  const handleSaveProfile = async () => {
    if (!editedName.trim() || !editedUsername.trim() || !currentUserDocRef) return;
    
    const updatedProfile = { name: editedName, username: editedUsername };
    updateDoc(currentUserDocRef, updatedProfile).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: currentUserDocRef.path, operation: 'update', requestResourceData: updatedProfile }));
    });

    setShowEditProfile(false);
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const userPosts = useMemo(() => {
    if (!posts || !user) return [];
    return posts.filter(p => p.userId === user.uid);
  }, [posts, user]);

  const renderHomePage = () => (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
            {currentUserProfile?.avatar || '👤'}
          </div>
          <button
            onClick={() => setShowNewPost(!showNewPost)}
            className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
          >
            What's on your mind?
          </button>
        </div>

        {showNewPost && (
          <div className="mt-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share something..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {postsLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : posts && posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm">
              <div className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl">
                  {post.userAvatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{post.userName}</h3>
                  <p className="text-sm text-gray-500">@{post.userUsername} · {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleTimeString() : 'Just now'}</p>
                </div>
                {user && post.userId !== user.uid && (
                  <button
                    onClick={() => handleFollow(post.userId)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                      currentUserProfile?.following?.includes(post.userId)
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {currentUserProfile?.following?.includes(post.userId) ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              <div className="px-4 pb-3">
                <p className="text-gray-800">{post.content}</p>
              </div>

              <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${user && post.likedBy.includes(user.uid) ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span className={user && post.likedBy.includes(user.uid) ? 'text-red-500' : ''}>{post.likedBy.length}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                  <MessageCircle className="w-5 h-5" />
                  <span>0</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-500">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold">No posts yet</h3>
            <p>Be the first to share something!</p>
          </div>
        )}
      </div>
    </>
  );

  const renderSearchPage = () => (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-800"
          />
        </div>
      </div>

      <div className="space-y-3">
        {usersLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold">No users found</h3>
            <p>Try a different search.</p>
          </div>
        ) : (
          filteredUsers.map(u => (
            <UserCard key={u.id} u={u} currentUserProfile={currentUserProfile} onFollow={handleFollow} />
          ))
        )}
      </div>
    </div>
  );

  const renderNotificationsPage = () => (
    <div className="space-y-3">
      <div className="text-center py-16 text-gray-500">
        <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold">No new notifications</h3>
        <p>You're all caught up!</p>
      </div>
    </div>
  );

  const renderProfilePage = () => (
    <div>
      {profileLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
      ) : currentUserProfile && (
        <>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl mb-4">
              {currentUserProfile.avatar}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{currentUserProfile.name}</h2>
            <p className="text-gray-500">@{currentUserProfile.username}</p>
            
            <div className="flex gap-8 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{userPosts.length}</p>
                <p className="text-sm text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{followersLoading ? '...' : followers?.length || 0}</p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{currentUserProfile.following?.length || 0}</p>
                <p className="text-sm text-gray-500">Following</p>
              </div>
            </div>

            <button onClick={() => setShowEditProfile(true)} className="mt-6 px-8 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold">No posts yet</h3>
              <p>Your posts will appear here.</p>
            </div>
          ) : (
            userPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl">
                    {post.userAvatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{post.userName}</h3>
                    <p className="text-sm text-gray-500">@{post.userUsername} · {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleTimeString() : 'Just now'}</p>
                  </div>
                </div>

                <div className="px-4 pb-3">
                  <p className="text-gray-800">{post.content}</p>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${user && post.likedBy.includes(user.uid) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className={user && post.likedBy.includes(user.uid) ? 'text-red-500' : ''}>{post.likedBy.length}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                    <MessageCircle className="w-5 h-5" />
                    <span>0</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-500">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Socialize</h1>
          <div className="flex items-center gap-4">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => setActiveTab('notifications')} />
            <Menu className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-600" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 w-full overflow-y-auto">
        {activeTab === 'home' && renderHomePage()}
        {activeTab === 'search' && renderSearchPage()}
        {activeTab === 'notifications' && renderNotificationsPage()}
        {activeTab === 'profile' && renderProfilePage()}
      </main>

      <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'search' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs">Search</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'notifications' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <Bell className="w-6 h-6" />
            <span className="text-xs">Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
      
      {currentUserProfile && <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={editedUsername} onChange={(e) => setEditedUsername(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>}
    </div>
  );
}
