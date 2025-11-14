'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IncomingCallManagerProps {
  setCallDetails: (details: { callId: string | null; isCallActive: boolean }) => void;
  openVideoCallApp: () => void;
}

export default function IncomingCallManager({ setCallDetails, openVideoCallApp }: IncomingCallManagerProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const { toast } = useToast();
  const callListenerUnsubscribe = useRef<() => void | undefined>();

  // Effect to listen for new ringing calls
  useEffect(() => {
    if (!user || !firestore) return;

    // We only want to set up this listener if there isn't already an active call pop-up
    if (incomingCall) return;

    const q = query(
      collection(firestore, 'calls'),
      where('calleeId', '==', user.uid),
      where('status', '==', 'ringing')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty && !incomingCall) {
        const callDoc = snapshot.docs[0];
        setIncomingCall({ id: callDoc.id, ...callDoc.data() });
      }
    },
    (error) => {
        const contextualError = new FirestorePermissionError({
          path: `calls`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
    });

    return () => unsubscribe();
  }, [user, firestore, incomingCall]);

  // Effect to listen to the *specific* active incoming call for status changes
  useEffect(() => {
    if (incomingCall && firestore) {
      const callDocRef = doc(firestore, 'calls', incomingCall.id);
      
      callListenerUnsubscribe.current = onSnapshot(callDocRef, (doc) => {
        const data = doc.data();
        // If call is no longer ringing (e.g., caller hung up), close the dialog
        if (data?.status !== 'ringing') {
          setIncomingCall(null);
        }
      });

      return () => {
        if (callListenerUnsubscribe.current) {
          callListenerUnsubscribe.current();
          callListenerUnsubscribe.current = undefined;
        }
      };
    }
  }, [incomingCall, firestore]);

  const answerCall = () => {
    if (!incomingCall) return;
    
    // Stop listening to this call document
    if (callListenerUnsubscribe.current) {
      callListenerUnsubscribe.current();
      callListenerUnsubscribe.current = undefined;
    }

    setCallDetails({ callId: incomingCall.id, isCallActive: true });
    openVideoCallApp();
    
    setIncomingCall(null);
  };

  const rejectCall = async () => {
    if (!incomingCall || !firestore) return;

    // Stop listening to this call document
    if (callListenerUnsubscribe.current) {
      callListenerUnsubscribe.current();
      callListenerUnsubscribe.current = undefined;
    }

    const callDocRef = doc(firestore, 'calls', incomingCall.id);
    await updateDoc(callDocRef, { status: 'rejected' }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: callDocRef.path,
            operation: 'update',
            requestResourceData: { status: 'rejected' },
        }));
    });

    setIncomingCall(null);
    toast({
      title: 'Call Rejected',
    });
  };

  return (
    <AlertDialog open={!!incomingCall}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Incoming Call</AlertDialogTitle>
          <AlertDialogDescription>
            You have an incoming call from {incomingCall?.callerName || 'Unknown'}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={rejectCall} variant="destructive">
            <PhoneOff className="mr-2 h-4 w-4" />
            Decline
          </Button>
          <Button onClick={answerCall} className="bg-green-600 hover:bg-green-700">
            <Phone className="mr-2 h-4 w-4" />
            Accept
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
