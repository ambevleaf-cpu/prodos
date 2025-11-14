'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Search,
  Send,
  Smile,
  Paperclip,
  Mic,
  ArrowLeft,
  Check,
  CheckCheck,
  Users,
  Loader2,
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';

// --- Types ---
interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online?: boolean; // Let's assume this might come from a presence system
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTimestamp?: any;
  unreadCount?: { [userId: string]: number };
}

interface Message {
  id?: string;
  senderId: string;
  text: string;
  timestamp: any;
  read?: boolean;
}

const getConversationId = (uid1: string, uid2: string) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};


export default function MessagesApp() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // --- State Management ---
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'chats' | 'chat'>('chats');

  // --- Data Fetching from Firestore ---
  const conversationsQuery = useMemoFirebase(() =>
    firestore && currentUser
      ? query(collection(firestore, 'conversations'), where('participants', 'array-contains', currentUser.uid))
      : null,
  [firestore, currentUser]);
  const { data: rawConversations, isLoading: conversationsLoading } = useCollection<Conversation>(conversationsQuery);

  const messagesQuery = useMemoFirebase(() =>
    firestore && selectedChat
      ? query(collection(firestore, 'conversations', selectedChat.id, 'messages'), orderBy('timestamp', 'asc'))
      : null,
  [firestore, selectedChat]);
  const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
  
  const usersQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'users')) : null,
  [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  // --- Memos for derived data ---
  const userMap = useMemo<Record<string, UserProfile>>(() => {
    if (!users) return {};
    return users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, UserProfile>);
  }, [users]);
  
  const conversations = useMemo(() => {
    if (!rawConversations) return [];
    return [...rawConversations].sort((a, b) => 
        (b.lastMessageTimestamp?.toMillis() || 0) - (a.lastMessageTimestamp?.toMillis() || 0)
    );
  }, [rawConversations]);

  const filteredChats = useMemo(() => 
    conversations.filter(chat => {
      const otherUserId = chat.participants.find(p => p !== currentUser?.uid);
      const otherUser = otherUserId ? userMap[otherUserId] : null;
      return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
    }),
  [conversations, searchQuery, currentUser, userMap]);

  // --- Effects ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // --- Handlers ---
  const selectChat = (chat: Conversation) => {
    setSelectedChat(chat);
    setView('chat');

    // Here you would also mark messages as read if `unreadCount` was implemented
  };

  const handleStartNewConversation = async (otherUser: UserProfile) => {
    if (!currentUser || !firestore) return;

    const conversationId = getConversationId(currentUser.uid, otherUser.id);
    const conversationRef = doc(firestore, 'conversations', conversationId);

    getDoc(conversationRef).then(snap => {
        if (snap.exists()) {
            selectChat({ id: snap.id, ...snap.data() } as Conversation);
        } else {
            const newConversationData: Conversation = {
                id: conversationId,
                participants: [currentUser.uid, otherUser.id],
            };
            setDoc(conversationRef, newConversationData).then(() => {
                selectChat(newConversationData);
            }).catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: conversationRef.path, operation: 'create', requestResourceData: newConversationData
                }));
            });
        }
    }).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: conversationRef.path, operation: 'get'
        }));
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUser || !firestore) return;

    const messagesColRef = collection(firestore, 'conversations', selectedChat.id, 'messages');
    const messagePayload: Omit<Message, 'id'> = {
      senderId: currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
      read: false,
    };
    
    addDoc(messagesColRef, messagePayload).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: messagesColRef.path, operation: 'create', requestResourceData: messagePayload
      }));
    });

    const conversationRef = doc(firestore, 'conversations', selectedChat.id);
    const conversationUpdatePayload = {
      lastMessage: newMessage,
      lastMessageTimestamp: serverTimestamp(),
    };
    updateDoc(conversationRef, conversationUpdatePayload).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: conversationRef.path, operation: 'update', requestResourceData: conversationUpdatePayload
      }));
    });
    
    // Create notification for other user
    const otherUserId = selectedChat.participants.find(p => p !== currentUser.uid);
    if(otherUserId) {
        const notificationCol = collection(firestore, 'users', otherUserId, 'notifications');
        const notificationPayload = {
            applicationId: 'messages',
            title: `New message from ${currentUser.displayName || userMap[currentUser.uid]?.name || 'a user'}`,
            message: newMessage,
            timestamp: serverTimestamp(),
            isRead: false,
        };
        addDoc(notificationCol, notificationPayload).catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: notificationCol.path,
                operation: 'create',
                requestResourceData: notificationPayload
            }));
        });
    }

    setNewMessage('');
  };

  const getOtherParticipant = (participants: string[]) => {
      if(!currentUser) return null;
      const otherId = participants.find(p => p !== currentUser.uid);
      return otherId ? userMap[otherId] : null;
  }
  
  if (usersLoading) {
    return <div className="w-full h-full flex items-center justify-center bg-gray-100"><Loader2 className="animate-spin h-8 w-8" /></div>
  }

  return (
    <div className="flex h-full bg-gray-100 w-full">
      {/* Sidebar - Chats List */}
      <div className={`${view === 'chat' && 'hidden md:flex'} flex-col w-full md:w-[350px] lg:w-[400px] bg-white border-r`}>
        {/* Header */}
        <div className="bg-[#008069] text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Messenger</h1>
            <div className="flex gap-6">
              <Users className="w-6 h-6 cursor-pointer hover:opacity-80" />
              <MessageCircle className="w-6 h-6 cursor-pointer hover:opacity-80" />
              <MoreVertical className="w-6 h-6 cursor-pointer hover:opacity-80" />
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 rounded-lg bg-white text-gray-800 focus:outline-none h-10"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> : filteredChats.map(chat => {
            const otherUser = getOtherParticipant(chat.participants);
            if (!otherUser) return null;

            return (
                <div
                key={chat.id}
                onClick={() => selectChat(chat)}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${selectedChat?.id === chat.id ? 'bg-gray-100' : ''}`}
                >
                    <div className="relative">
                        <Avatar className="w-12 h-12">
                           <AvatarFallback>{otherUser.avatar}</AvatarFallback>
                        </Avatar>
                        {otherUser.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                        <h3 className="font-semibold text-gray-900 truncate">{otherUser.name}</h3>
                        <span className="text-xs text-gray-500">
                            {chat.lastMessageTimestamp ? new Date(chat.lastMessageTimestamp.toMillis()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        </div>
                        <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 truncate">{chat.lastMessage || 'No messages yet'}</p>
                        {/* Unread count UI can be added here if implemented */}
                        </div>
                    </div>
                </div>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${view === 'chats' ? 'hidden md:flex' : 'flex'} flex-col flex-1`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#008069] text-white p-3 flex items-center justify-between border-l border-white/10">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setView('chats');
                    setSelectedChat(null);
                  }}
                  className="text-white hover:text-white hover:bg-white/20 md:hidden"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="relative flex-shrink-0">
                  <Avatar>
                      <AvatarFallback>{getOtherParticipant(selectedChat.participants)?.avatar || '?'}</AvatarFallback>
                  </Avatar>
                  {getOtherParticipant(selectedChat.participants)?.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#008069]"></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white text-base truncate">{getOtherParticipant(selectedChat.participants)?.name || '...'}</h2>
                  <p className="text-xs text-white/80">{getOtherParticipant(selectedChat.participants)?.online ? 'online' : 'offline'}</p>
                </div>
              </div>
              
              <div className="flex gap-6 text-white">
                <Video className="w-5 h-5 cursor-pointer hover:opacity-80" />
                <Phone className="w-5 h-5 cursor-pointer hover:opacity-80" />
                <MoreVertical className="w-5 h-5 cursor-pointer hover:opacity-80" />
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAICAYAAADcT81VAAAAAXNSR0IArs4c6QAAADFJREFUGFcBLQAn/wFpADsADgELADsACgACQAAsAAsADgA6AAcACgBqAAsADgALAAkABgDSiAblFjWfGgAAAABJRU5ErkJggg==")',
                backgroundRepeat: 'repeat',
                backgroundColor: '#E5DDD5'
              }}
            >
              {messagesLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}
              {messages?.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg shadow-sm ${
                      message.senderId === currentUser?.uid
                        ? 'bg-[#D9FDD3] text-gray-900'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs text-gray-500">{message.timestamp ? new Date(message.timestamp.toMillis()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      {message.senderId === currentUser?.uid && (
                        message.read ? (
                          <CheckCheck className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Check className="w-4 h-4 text-gray-500" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-[#F0F2F5] p-3 flex items-center gap-3">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                  <Smile className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
                  <Paperclip className="w-6 h-6" />
                </Button>
              </div>
              
              <Input
                type="text"
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 px-4 py-2 rounded-lg focus:outline-none h-10"
              />
              
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className={`p-2 rounded-full transition-all ${
                  newMessage.trim()
                    ? 'bg-[#008069] text-white hover:bg-[#017561] shadow-md hover:shadow-lg'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#F0F2F5]">
            <div className="text-center">
              <div className="w-32 h-32 text-gray-400 flex items-center justify-center mx-auto mb-6">
                 <MessageCircle className="w-32 h-32" strokeWidth={0.5}/>
              </div>
              <h2 className="text-2xl font-light text-gray-600 mb-2">Prod OS Messenger</h2>
              <p className="text-sm text-gray-500 max-w-xs">
                Send and receive messages in real-time with other users on the platform.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
