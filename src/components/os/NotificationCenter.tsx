'use client';
import { useState, useEffect } from 'react';
import { Bell, Loader2, Bot, MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  applicationId: string;
  title: string;
  message: string;
  timestamp: any;
  isRead: boolean;
}

const getIconForApp = (appId: string) => {
    switch (appId) {
        case 'socialMedia':
            return <UserPlus className="w-4 h-4 text-blue-500" />;
        case 'messages':
            return <MessageSquare className="w-4 h-4 text-green-500" />;
        case 'nexbro':
            return <Bot className="w-4 h-4 text-purple-500" />;
        default:
            return <Bell className="w-4 h-4 text-gray-500" />;
    }
};

export default function NotificationCenter() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'notifications'),
      orderBy('timestamp', 'desc')
    );
  }, [user, firestore]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);
  
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  useEffect(() => {
    if (isOpen && notifications && unreadCount > 0 && firestore && user) {
        const batch = [];
        for (const notification of notifications) {
            if (!notification.isRead) {
                const notifRef = doc(firestore, 'users', user.uid, 'notifications', notification.id);
                batch.push(updateDoc(notifRef, { isRead: true }).catch(err => {
                     errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: notifRef.path,
                        operation: 'update',
                        requestResourceData: { isRead: true },
                    }));
                }));
            }
        }
    }
  }, [isOpen, notifications, unreadCount, firestore, user]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <h4 className="font-medium leading-none">Notifications</h4>
        </div>
        <ScrollArea className="h-96">
            <div className="p-2">
                {isLoading && (
                    <div className="flex justify-center items-center h-full p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                )}
                {!isLoading && (!notifications || notifications.length === 0) && (
                    <div className="text-center p-8">
                        <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">You're all caught up!</p>
                    </div>
                )}
                {notifications?.map((notification) => (
                    <div
                        key={notification.id}
                        className={cn(
                            'p-3 rounded-lg flex items-start gap-3 transition-colors hover:bg-accent',
                            !notification.isRead && 'bg-blue-50'
                        )}
                        >
                        <div className="mt-1">
                            {getIconForApp(notification.applicationId)}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{notification.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                {notification.timestamp ? formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                            </p>
                        </div>
                        {!notification.isRead && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 self-center" />
                        )}
                    </div>
                ))}
            </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
