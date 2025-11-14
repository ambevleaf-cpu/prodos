'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, onSnapshot, updateDoc, getDoc, writeBatch, query, where, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, PhoneOff, Video as VideoIcon, VideoOff, Mic, MicOff, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// WebRTC STUN servers configuration
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

export default function VideoCallApp({ callId: activeCallId, setCallId: setActiveCallId, hangUp: externalHangUp, isCallActive, setIsCallActive, localStream, remoteStream, pc }: any) {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => 
    firestore && currentUser ? query(collection(firestore, 'users'), where('id', '!=', currentUser.uid)) : null
  , [firestore, currentUser]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const createCall = async (callee: UserProfile) => {
    if (!pc || !currentUser) {
      toast({ variant: "destructive", title: "Error", description: "User or Peer connection not available." });
      return;
    }
    
    setIsCallActive(true);

    const callDocRef = collection(firestore, 'calls');
    const callDoc = await addDoc(callDocRef, {
        callerId: currentUser.uid,
        callerName: currentUser.displayName,
        calleeId: callee.id,
        calleeName: callee.name,
        status: 'offering',
        createdAt: serverTimestamp(),
    });
    
    setActiveCallId(callDoc.id);

    const offerCandidates = collection(callDoc, 'callerCandidates');
    const answerCandidates = collection(callDoc, 'calleeCandidates');

    pc.onicecandidate = (event) => {
      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    await updateDoc(callDoc, { offer, status: 'ringing' });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
       if (data?.status === 'rejected' || data?.status === 'ended') {
        toast({ title: 'Call Ended', description: `The call was ${data.status}.` });
        externalHangUp();
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });

     toast({
      title: "Calling...",
      description: `Calling ${callee.name}.`,
    });
  };

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => {
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
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-xs">You</div>
                </Card>
                <Card className="bg-black/30 border-gray-700 relative overflow-hidden">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-xs">Remote</div>
                </Card>
            </div>
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button onClick={toggleMute} variant="outline" size="icon" className={`rounded-full h-12 w-12 border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 ${isMuted ? 'text-red-500' : ''}`}>
                        {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                    <Button onClick={toggleVideo} variant="outline" size="icon" className={`rounded-full h-12 w-12 border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 ${isVideoOff ? 'text-red-500' : ''}`}>
                        {isVideoOff ? <VideoOff /> : <VideoIcon />}
                    </Button>
                    <Button onClick={externalHangUp} className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700 text-white">
                        <PhoneOff />
                    </Button>
                </div>
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
