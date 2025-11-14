'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
} from 'firebase/firestore';
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Send, UserPlus } from 'lucide-react';

// Define types for Firestore documents
interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface Conversation {
  id?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTimestamp?: any;
}

interface Message {
  id?: string;
  senderId: string;
  text: string;
  timestamp: any;
}

const getConversationId = (uid1: string, uid2: string) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

export default function MessagesApp() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const [activeView, setActiveView] = useState<'conversations' | 'newMessage'>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // --- Data Fetching ---
  const conversationsQuery = useMemoFirebase(() =>
    firestore && currentUser
      ? query(
          collection(firestore, 'conversations'),
          where('participants', 'array-contains', currentUser.uid),
          orderBy('lastMessageTimestamp', 'desc')
        )
      : null,
  [firestore, currentUser]);
  const { data: conversations, isLoading: conversationsLoading } = useCollection<Conversation>(conversationsQuery);
  
  const messagesQuery = useMemoFirebase(() =>
    firestore && selectedConversation
      ? query(
          collection(firestore, 'conversations', selectedConversation.id!, 'messages'),
          orderBy('timestamp', 'asc')
        )
      : null,
  [firestore, selectedConversation]);
  const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
  
  const usersQuery = useMemoFirebase(() =>
    firestore && currentUser ? query(collection(firestore, 'users'), where('id', '!=', currentUser.uid)) : null
  , [firestore, currentUser]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const filteredUsers = useMemo(() => 
    users?.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())) || [],
  [users, searchTerm]);

  // --- Effects ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Handlers ---
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setActiveView('conversations');
  };

  const handleStartNewConversation = async (otherUser: UserProfile) => {
    if (!currentUser || !firestore) return;
    
    const conversationId = getConversationId(currentUser.uid, otherUser.id);
    const conversationRef = doc(firestore, 'conversations', conversationId);
    
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      handleSelectConversation({ id: conversationSnap.id, ...conversationSnap.data() } as Conversation);
    } else {
      const newConversation: Conversation = {
        participants: [currentUser.uid, otherUser.id],
      };
      await setDoc(conversationRef, newConversation).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: conversationRef.path, operation: 'create', requestResourceData: newConversation
        }));
      });
      handleSelectConversation({ id: conversationId, ...newConversation });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedConversation || !firestore) return;

    const messagesColRef = collection(firestore, 'conversations', selectedConversation.id!, 'messages');
    const messagePayload: Message = {
      senderId: currentUser.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
    };
    
    await addDoc(messagesColRef, messagePayload).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: messagesColRef.path, operation: 'create', requestResourceData: messagePayload
        }));
    });

    const conversationRef = doc(firestore, 'conversations', selectedConversation.id!);
    const conversationUpdatePayload = {
      lastMessage: newMessage,
      lastMessageTimestamp: serverTimestamp(),
    };
    await setDoc(conversationRef, conversationUpdatePayload, { merge: true }).catch(error => {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: conversationRef.path, operation: 'write', requestResourceData: conversationUpdatePayload
        }));
    });

    setNewMessage('');
  };

  const otherParticipants = useMemo(() => {
    const participantData: Record<string, UserProfile> = {};
    if (users) {
      users.forEach(u => participantData[u.id] = u);
    }
    return participantData;
  }, [users]);
  
  const getOtherParticipant = (participants: string[]) => {
      if(!currentUser) return null;
      const otherId = participants.find(p => p !== currentUser.uid);
      return otherId ? otherParticipants[otherId] : null;
  }

  return (
    <div className="w-full h-full flex bg-gray-100 rounded-b-lg">
      {/* Sidebar */}
      <aside className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Chats</h2>
          <Button variant="ghost" size="icon" onClick={() => setActiveView('newMessage')}>
            <UserPlus className="h-5 w-5" />
          </Button>
        </header>
        <ScrollArea className="flex-1">
            {conversationsLoading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
            ) : (
                conversations?.map(convo => {
                    const otherUser = getOtherParticipant(convo.participants);
                    return (
                        <button
                            key={convo.id}
                            onClick={() => handleSelectConversation(convo)}
                            className={`w-full text-left p-4 flex items-center gap-3 hover:bg-gray-100 ${selectedConversation?.id === convo.id ? 'bg-blue-50' : ''}`}
                        >
                            <Avatar>
                                <AvatarFallback>{otherUser?.avatar || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 truncate">
                                <p className="font-semibold">{otherUser?.name || 'Unknown User'}</p>
                                <p className="text-sm text-gray-500 truncate">{convo.lastMessage || 'No messages yet'}</p>
                            </div>
                        </button>
                    )
                })
            )}
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="w-2/3 flex flex-col bg-gray-50">
        {activeView === 'newMessage' ? (
          <div className="flex flex-col h-full">
            <header className="p-4 border-b border-gray-200 flex items-center gap-3">
               <h2 className="text-xl font-bold">New Message</h2>
            </header>
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search users..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
            <ScrollArea className="flex-1">
                 {usersLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
                 ) : (
                    filteredUsers.map(user => (
                        <button key={user.id} onClick={() => handleStartNewConversation(user)} className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-100">
                             <Avatar>
                                <AvatarFallback>{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-gray-500">@{user.username}</p>
                            </div>
                        </button>
                    ))
                 )}
            </ScrollArea>
          </div>
        ) : selectedConversation ? (
          <div className="flex flex-col h-full">
            <header className="p-4 border-b border-gray-200 flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getOtherParticipant(selectedConversation.participants)?.avatar || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold">{getOtherParticipant(selectedConversation.participants)?.name || 'Select a chat'}</h3>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </header>
            <ScrollArea className="flex-1 p-4 bg-gray-100">
              <div className="space-y-4">
                {messagesLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>
                ) : (
                    messages?.map(msg => (
                        <div key={msg.id} className={`flex ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${msg.senderId === currentUser?.uid ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))
                )}
                 <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <footer className="p-4 border-t bg-white">
              <div className="flex items-center gap-3">
                <Input 
                    placeholder="Type a message..." 
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </footer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a conversation or start a new one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
