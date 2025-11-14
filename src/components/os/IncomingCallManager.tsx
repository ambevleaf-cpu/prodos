'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
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
  
  useEffect(() => {
    if (!user || !firestore) return;

    const q = query(
      collection(firestore, 'calls'),
      where('calleeId', '==', user.uid),
      where('status', '==', 'ringing')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const callDoc = snapshot.docs[0];
        setIncomingCall({ id: callDoc.id, ...callDoc.data() });
      } else {
        setIncomingCall(null);
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
  }, [user, firestore]);

  const answerCall = () => {
    if (!incomingCall) return;
    
    setCallDetails({ callId: incomingCall.id, isCallActive: true });
    openVideoCallApp();
    
    setIncomingCall(null);
  };

  const rejectCall = async () => {
    if (!incomingCall || !firestore) return;
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
