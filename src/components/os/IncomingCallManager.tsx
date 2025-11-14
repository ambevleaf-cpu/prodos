'use client';

import React, { useState, useEffect } from 'react';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
  pc: RTCPeerConnection | null;
  setRemoteStream: (stream: MediaStream) => void;
  setActiveCallId: (id: string) => void;
  setIsCallActive: (isActive: boolean) => void;
  openVideoCallApp: () => void;
}

export default function IncomingCallManager({ pc, setRemoteStream, setActiveCallId, setIsCallActive, openVideoCallApp }: IncomingCallManagerProps) {
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
          path: 'calls',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const answerCall = async () => {
    if (!pc || !incomingCall || !firestore) return;

    openVideoCallApp();
    setIsCallActive(true);
    setActiveCallId(incomingCall.id);

    const callDocRef = doc(firestore, 'calls', incomingCall.id);
    const answerCandidates = collection(callDocRef, 'calleeCandidates');
    const offerCandidates = collection(callDocRef, 'callerCandidates');

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(answerCandidates, event.candidate.toJSON()).catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: answerCandidates.path,
                operation: 'create',
                requestResourceData: event.candidate.toJSON(),
            }));
        });
      }
    };

    try {
        const callData = (await getDoc(callDocRef)).data();
        if (callData?.offer) {
            await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
        }
        
        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        };

        await updateDoc(callDocRef, { answer, status: 'answered' });

        onSnapshot(offerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data());
              pc.addIceCandidate(candidate);
            }
          });
        },
        (error) => {
            const contextualError = new FirestorePermissionError({
                path: offerCandidates.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', contextualError);
        });

    } catch (err) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: callDocRef.path,
            operation: 'get',
        }));
    }

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
