'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { doc, collection, addDoc, onSnapshot, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, PhoneOff, Copy, Video as VideoIcon, VideoOff, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// WebRTC STUN servers configuration
const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function VideoCallApp() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [callId, setCallId] = useState<string>('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize Peer Connection
  useEffect(() => {
    const peerConnection = new RTCPeerConnection(servers);
    setPc(peerConnection);
  }, []);
  
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


  const setupStreams = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      
      const remote = new MediaStream();
      setRemoteStream(remote);

      stream.getTracks().forEach((track) => {
        pc?.addTrack(track, stream);
      });

      pc!.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remote.addTrack(track);
        });
      };
      return stream;
    } catch(error) {
      console.error("Error accessing media devices.", error);
      toast({
        variant: "destructive",
        title: "Camera/Mic Error",
        description: "Could not access your camera or microphone. Please check permissions.",
      });
      return null;
    }
  };

  const createCall = async () => {
    if (!pc) {
      toast({ variant: "destructive", title: "Error", description: "Peer connection not available." });
      return;
    }

    const stream = await setupStreams();
    if (!stream) return;
    setIsCallActive(true);

    const callDocRef = collection(firestore, 'calls');
    const callDoc = await addDoc(callDocRef, {});
    setCallId(callDoc.id);

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
    await updateDoc(callDoc, { offer });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
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
      title: "Call Created!",
      description: "Share the Call ID with your friend to join.",
    });
  };

  const joinCall = async () => {
    if (!pc || !callId) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a Call ID." });
      return;
    }
    
    const stream = await setupStreams();
    if (!stream) return;
    setIsCallActive(true);

    const callDocRef = doc(firestore, 'calls', callId);
    const callDocSnapshot = await getDoc(callDocRef);
    if (!callDocSnapshot.exists()) {
        toast({ variant: "destructive", title: "Error", description: "Call ID not found." });
        setIsCallActive(false);
        return;
    }

    const answerCandidates = collection(callDocRef, 'calleeCandidates');
    const offerCandidates = collection(callDocRef, 'callerCandidates');

    pc.onicecandidate = (event) => {
      event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
    };

    const callData = callDocSnapshot.data();
    const offerDescription = new RTCSessionDescription(callData.offer);
    await pc.setRemoteDescription(offerDescription);

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };
    await updateDoc(callDocRef, { answer });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };
  
  const hangUp = async () => {
    if (pc) {
      pc.close();
    }
    
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    
    setLocalStream(null);
    setRemoteStream(null);
    setPc(new RTCPeerConnection(servers)); // Reset peer connection
    setIsCallActive(false);
    setCallId('');

    toast({
      title: "Call Ended",
    });
  };

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

  const copyCallId = () => {
    navigator.clipboard.writeText(callId);
    toast({
      title: "Copied!",
      description: "Call ID copied to clipboard.",
    });
  }

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
      
      {!isCallActive ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Start or Join a Call</CardTitle>
            <CardDescription>Create a new call or enter an ID to join an existing one.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Button onClick={createCall} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <Phone className="mr-2 h-4 w-4" /> Create Call
            </Button>
            <div className="flex flex-1 gap-2">
              <Input
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
                placeholder="Enter Call ID"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button onClick={joinCall} className="bg-blue-600 hover:bg-blue-700 text-white">Join</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                <span className="text-sm font-mono">{callId}</span>
                <Button size="icon" variant="ghost" onClick={copyCallId} className="h-7 w-7">
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-4">
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
      )}
    </div>
  );
}
