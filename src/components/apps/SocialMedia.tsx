'use client';
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, User, Home, Search, Bell, Menu, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SocialMediaApp() {
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'You',
    username: '@you',
    avatar: '👤'
  });

  const [posts, setPosts] = useState([
    {
      id: 1,
      user: { name: 'Sarah Chen', username: '@sarahc', avatar: '👩‍💻' },
      content: 'Just launched my new project! So excited to share it with everyone 🚀',
      image: null,
      likes: 24,
      comments: 5,
      timestamp: '2h ago',
      liked: false
    },
    {
      id: 2,
      user: { name: 'Mike Johnson', username: '@mikej', avatar: '👨‍🎨' },
      content: 'Beautiful sunset at the beach today 🌅',
      image: null,
      likes: 156,
      comments: 12,
      timestamp: '4h ago',
      liked: true
    },
    {
      id: 3,
      user: { name: 'Emily Park', username: '@emilyp', avatar: '👩‍🔬' },
      content: 'Coffee and coding - the perfect combination ☕💻',
      image: null,
      likes: 89,
      comments: 8,
      timestamp: '6h ago',
      liked: false
    }
  ]);

  const [users] = useState([
    { id: 2, name: 'Sarah Chen', username: '@sarahc', avatar: '👩‍💻', followers: 1234, following: false },
    { id: 3, name: 'Mike Johnson', username: '@mikej', avatar: '👨‍🎨', followers: 5678, following: true },
    { id: 4, name: 'Emily Park', username: '@emilyp', avatar: '👩‍🔬', followers: 890, following: false },
    { id: 5, name: 'Alex Rivera', username: '@alexr', avatar: '👨‍💼', followers: 2345, following: false },
    { id: 6, name: 'Lisa Wang', username: '@lisaw', avatar: '👩‍🎤', followers: 3456, following: true },
  ]);

  const [notifications] = useState([
    { id: 1, type: 'like', user: 'Sarah Chen', avatar: '👩‍💻', content: 'liked your post', time: '5m ago', read: false },
    { id: 2, type: 'comment', user: 'Mike Johnson', avatar: '👨‍🎨', content: 'commented on your post', time: '1h ago', read: false },
    { id: 3, type: 'follow', user: 'Emily Park', avatar: '👩‍🔬', content: 'started following you', time: '2h ago', read: true },
    { id: 4, type: 'like', user: 'Alex Rivera', avatar: '👨‍💼', content: 'liked your post', time: '3h ago', read: true },
    { id: 5, type: 'comment', user: 'Lisa Wang', avatar: '👩‍🎤', content: 'commented on your post', time: '5h ago', read: true },
  ]);

  const [userPosts, setUserPosts] = useState([
    {
      id: 101,
      content: 'Working on something exciting! 🎉',
      likes: 45,
      comments: 8,
      timestamp: '1d ago',
      liked: false
    },
    {
      id: 102,
      content: 'Just finished a great coding session 💻',
      likes: 32,
      comments: 4,
      timestamp: '2d ago',
      liked: true
    },
    {
      id: 103,
      content: 'Learning something new every day! 📚',
      likes: 28,
      comments: 6,
      timestamp: '3d ago',
      liked: false
    },
  ]);

  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingUsers, setFollowingUsers] = useState([3, 6]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedUsername, setEditedUsername] = useState(currentUser.username);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post = {
        id: Date.now(),
        user: { ...currentUser, avatar: '👤' },
        content: newPost,
        image: null,
        likes: 0,
        comments: 0,
        timestamp: 'Just now',
        liked: false
      };
      setPosts([post, ...posts]);
      setUserPosts(prevUserPosts => [post, ...prevUserPosts]);
      setNewPost('');
      setShowNewPost(false);
    }
  };

  const handleFollow = (userId: number) => {
    if (followingUsers.includes(userId)) {
      setFollowingUsers(followingUsers.filter(id => id !== userId));
    } else {
      setFollowingUsers([...followingUsers, userId]);
    }
  };
  
  const handleSaveProfile = () => {
    setCurrentUser({
        ...currentUser,
        name: editedName,
        username: editedUsername,
    });
    setShowEditProfile(false);
  };


  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHomePage = () => (
    <>
      {/* New Post Button */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
            {currentUser.avatar}
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

      {/* Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm">
            <div className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl">
                {post.user.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                <p className="text-sm text-gray-500">{post.user.username} · {post.timestamp}</p>
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
                <Heart
                  className={`w-5 h-5 ${post.liked ? 'fill-red-500 text-red-500' : ''}`}
                />
                <span className={post.liked ? 'text-red-500' : ''}>{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-green-500">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderSearchPage = () => (
    <div>
      {/* Search Bar */}
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

      {/* User Results */}
      <div className="space-y-3">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl">
                {user.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.username}</p>
                <p className="text-xs text-gray-400 mt-1">{user.followers} followers</p>
              </div>
              <button
                onClick={() => handleFollow(user.id)}
                className={`px-6 py-2 rounded-lg font-medium ${
                  followingUsers.includes(user.id)
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {followingUsers.includes(user.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationsPage = () => (
    <div className="space-y-3">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`bg-white rounded-lg shadow-sm p-4 ${
            !notif.read ? 'border-l-4 border-blue-600' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl">
              {notif.avatar}
            </div>
            <div className="flex-1">
              <p className="text-gray-800">
                <span className="font-semibold">{notif.user}</span>{' '}
                <span className="text-gray-600">{notif.content}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">{notif.time}</p>
            </div>
            {notif.type === 'like' && (
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            )}
            {notif.type === 'comment' && (
              <MessageCircle className="w-6 h-6 text-blue-500" />
            )}
            {notif.type === 'follow' && (
              <User className="w-6 h-6 text-green-500" />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderProfilePage = () => (
    <div>
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl mb-4">
            {currentUser.avatar}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
          <p className="text-gray-500">{currentUser.username}</p>
          
          <div className="flex gap-8 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userPosts.length}</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">1.2K</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{followingUsers.length}</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>

          <button onClick={() => setShowEditProfile(true)} className="mt-6 px-8 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
            Edit Profile
          </button>
        </div>
      </div>

      {/* User Posts */}
      <div className="space-y-4">
        {userPosts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm">
            <div className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl">
                {currentUser.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{currentUser.name}</h3>
                <p className="text-sm text-gray-500">{currentUser.username} · {post.timestamp}</p>
              </div>
            </div>

            <div className="px-4 pb-3">
              <p className="text-gray-800">{post.content}</p>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-500">
                <Heart className={`w-5 h-5 ${post.liked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className={post.liked ? 'text-red-500' : ''}>{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-green-500">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Socialize</h1>
          <div className="flex items-center gap-4">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-600" />
            <Menu className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-600" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 w-full overflow-y-auto">
        {activeTab === 'home' && renderHomePage()}
        {activeTab === 'search' && renderSearchPage()}
        {activeTab === 'notifications' && renderNotificationsPage()}
        {activeTab === 'profile' && renderProfilePage()}
      </main>

      {/* Bottom Navigation */}
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
      
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
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
      </Dialog>
    </div>
  );
}
