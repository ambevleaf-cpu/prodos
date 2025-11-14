'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  getDoc,
  writeBatch,
  query,
  where,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, PhoneOff, Video as VideoIcon, VideoOff, Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

interface UserProfile {
    id: string;
    name: string;
    username: string;
    avatar: string;
}

interface VideoCallAppProps {
  callDetails: { callId: string | null; isCallActive: boolean };
  setCallDetails: (details: { callId: string | null; isCallActive: boolean }) => void;
}

export default function VideoCallApp({ callDetails, setCallDetails }: VideoCallAppProps) {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callListenerUnsubscribe = useRef<() => void | undefined>();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const { callId, isCallActive } = callDetails;

  const usersQuery = useMemoFirebase(() => 
    firestore && currentUser ? query(collection(firestore, 'users'), where('id', '!=', currentUser.uid)) : null
  , [firestore, currentUser]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const setupStreams = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setLocalStream(stream);
      if (!remoteStream) {
        setRemoteStream(new MediaStream());
      }
      return stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
      toast({
        variant: "destructive",
        title: "Camera/Mic Error",
        description: "Could not access camera or microphone.",
      });
      return null;
    }
  }, [toast, remoteStream]);
  
  useEffect(() => {
    if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
    }
    if (remoteStream && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);


  const hangUp = useCallback(async () => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    if (callListenerUnsubscribe.current) {
        callListenerUnsubscribe.current();
        callListenerUnsubscribe.current = undefined;
    }
    
    setLocalStream(null);
    setRemoteStream(null);

    if (callId && firestore) {
      const callDocRef = doc(firestore, 'calls', callId);
      const callSnapshot = await getDoc(callDocRef);
        if (callSnapshot.exists() && callSnapshot.data().status !== 'ended') {
            const updatePayload = { status: 'ended' };
            updateDoc(callDocRef, updatePayload).catch(err => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  path: callDocRef.path,
                  operation: 'update',
                  requestResourceData: updatePayload,
              }));
            });
        }
      
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const q = query(collection(firestore, 'calls'), where('status', '==', 'ended'), where('createdAt', '<', fiveMinutesAgo));
      
      const oldCalls = await getDocs(q).catch(err => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: 'calls',
              operation: 'list',
          }));
          return null;
      });

      if (oldCalls && !oldCalls.empty) {
        const batch = writeBatch(firestore);
        oldCalls.forEach(doc => {
            batch.delete(doc.ref);
        });
        batch.commit().catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: 'calls',
                operation: 'delete',
                requestResourceData: { note: `Batch delete of ${oldCalls.size} old call documents.` }
            }));
        });
      }
    }
    
    setCallDetails({ callId: null, isCallActive: false });
  }, [callId, firestore, localStream, setCallDetails]);

  const createCall = async (callee: UserProfile) => {
    if (!currentUser || !firestore) return;
    
    const stream = await setupStreams();
    if (!stream) return;
    
    setCallDetails({ callId: null, isCallActive: true });
    
    pc.current = new RTCPeerConnection(servers);

    stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));

    if (!remoteStream) {
        const newRemoteStream = new MediaStream();
        setRemoteStream(newRemoteStream);
    }
    
    pc.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream?.addTrack(track);
        });
    };

    const callCollectionRef = collection(firestore, 'calls');
    const callPayload = {
        callerId: currentUser.uid,
        callerName: currentUser.displayName || currentUser.email,
        calleeId: callee.id,
        calleeName: callee.name,
        status: 'offering',
        createdAt: serverTimestamp(),
    };
    
    try {
        const callDocRef = await addDoc(callCollectionRef, callPayload);
        setCallDetails({ callId: callDocRef.id, isCallActive: true });
        
        const callerCandidatesCollection = collection(callDocRef, 'callerCandidates');
        if (pc.current) {
            pc.current.onicecandidate = event => {
              if (event.candidate) {
                addDoc(callerCandidatesCollection, event.candidate.toJSON()).catch(err => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: callerCandidatesCollection.path,
                        operation: 'create',
                        requestResourceData: event.candidate.toJSON(),
                    }));
                });
              }
            };
        }

        const offerDescription = await pc.current.createOffer();
        await pc.current.setLocalDescription(offerDescription);

        const offer = { type: offerDescription.type, sdp: offerDescription.sdp };
        const updatePayload = { offer, status: 'ringing' };
        await updateDoc(callDocRef, updatePayload).catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: callDocRef.path,
                operation: 'update',
                requestResourceData: updatePayload,
            }));
        });

        callListenerUnsubscribe.current = onSnapshot(callDocRef, (snapshot) => {
          const data = snapshot.data();
          if (!pc.current?.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.current.setRemoteDescription(answerDescription);
          }
          if (data?.status === 'ended' || data?.status === 'rejected') {
            hangUp();
          }
        });

        const calleeCandidatesCollection = collection(callDocRef, 'calleeCandidates');
        onSnapshot(calleeCandidatesCollection, snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added' && pc.current?.connectionState !== "closed") {
              const candidate = new RTCIceCandidate(change.doc.data());
              pc.current?.addIceCandidate(candidate);
            }
          });
        });

    } catch (err) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: callCollectionRef.path,
            operation: 'create',
            requestResourceData: callPayload,
        }));
        hangUp();
        return;
    }
  };
  
  useEffect(() => {
    if (!isCallActive || !callId || !currentUser || !firestore || pc.current) return;

    const answerCall = async () => {
        const callDocRef = doc(firestore, 'calls', callId);
        const callSnapshot = await getDoc(callDocRef);
        
        // **Guard**: Only proceed if this user is the callee and the call is ringing
        if (!callSnapshot.exists() || callSnapshot.data().calleeId !== currentUser.uid || callSnapshot.data().status !== 'ringing') {
            return;
        }
        
        const stream = await setupStreams();
        if (!stream) {
            hangUp();
            return;
        };
        
        pc.current = new RTCPeerConnection(servers);

        stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));

        if (!remoteStream) {
            const newRemoteStream = new MediaStream();
            setRemoteStream(newRemoteStream);
        }

        pc.current.ontrack = (event) => {
            event.streams[0].getTracks().forEach(track => {
                remoteStream?.addTrack(track);
            });
        };

        const calleeCandidatesCollection = collection(callDocRef, 'calleeCandidates');
        pc.current.onicecandidate = event => {
            if (event.candidate) {
                addDoc(calleeCandidatesCollection, event.candidate.toJSON()).catch(err => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: calleeCandidatesCollection.path,
                        operation: 'create',
                        requestResourceData: event.candidate.toJSON(),
                    }));
                });
            }
        };

        const callData = callSnapshot.data();
        if(callData.offer) {
            await pc.current.setRemoteDescription(new RTCSessionDescription(callData.offer));

            const answerDescription = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answerDescription);

            const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
            const updatePayload = { answer, status: 'answered' };
            await updateDoc(callDocRef, updatePayload).catch(err => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: callDocRef.path,
                    operation: 'update',
                    requestResourceData: updatePayload,
                }));
            });
        }

        onSnapshot(collection(callDocRef, 'callerCandidates'), snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added' && pc.current?.connectionState !== "closed") {
                    pc.current?.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                }
            });
        });

        callListenerUnsubscribe.current = onSnapshot(callDocRef, (snapshot) => {
            const data = snapshot.data();
            if (data?.status === 'ended') {
                hangUp();
            }
        });
    };
    
    answerCall();

  }, [isCallActive, callId, currentUser, firestore, setupStreams, hangUp, remoteStream]);


  const toggleMute = () => {
    localStream?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  };

  const toggleVideo = () => {
    localStream?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsVideoOff(!track.enabled);
    });
  };
  

  if (isCallActive) {
    return (
        <div className="w-full h-full bg-gray-900 text-white flex flex-col p-4 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                <Card className="bg-black/30 border-gray-700 relative overflow-hidden">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                     {!localStream && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400">
                           <Loader2 className="animate-spin h-8 w-8 mb-2" />
                           <p>Starting camera...</p>
                       </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-xs">You</div>
                </Card>
                <Card className="bg-black/30 border-gray-700 relative overflow-hidden flex items-center justify-center">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    {!remoteStream?.active && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400">
                           <Loader2 className="animate-spin h-8 w-8 mb-2" />
                           <p>Connecting...</p>
                       </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-xs">Remote</div>
                </Card>
            </div>
            <div className="flex justify-center items-center gap-4">
                <Button onClick={toggleMute} variant="outline" size="icon" className={`rounded-full h-12 w-12 border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 ${isMuted ? 'text-red-500' : ''}`}>
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={toggleVideo} variant="outline" size="icon" className={`rounded-full h-12 w-12 border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 ${isVideoOff ? 'text-red-500' : ''}`}>
                    {isVideoOff ? <VideoOff /> : <VideoIcon />}
                </Button>
                <Button onClick={hangUp} className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700 text-white">
                    <PhoneOff />
                </Button>
            </div>
        </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-100 text-black flex flex-col p-4 gap-4">
       <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Start a Call</CardTitle>
            <CardDescription>Select a user to start a video call.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[450px] overflow-y-auto">
            {usersLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
            {users && users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                         <Avatar>
                            <AvatarFallback>{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                        </div>
                    </div>
                    <Button onClick={() => createCall(user)} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <Phone className="mr-2 h-4 w-4" /> Call
                    </Button>
                </div>
            ))}
          </CardContent>
        </Card>
    </div>
  );
}
