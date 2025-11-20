
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Loader2, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { handleBuddyChat } from '@/app/actions';
import { handleTextToSpeech } from '@/app/actions';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

// Simple unique ID generator to prevent key collisions
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};


// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;

export default function BuddyChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateUniqueId(),
      text: 'Hey bhai! Main Buddy hoon. Mic pe click kar aur bol, kya help chahiye?',
      sender: 'bot',
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setError('Browser not supported. Please use Chrome for voice features.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');
      
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.sender === 'user') {
          const newMessages = [...prev.slice(0, -1), { ...lastMessage, text: transcript || '...' }];
          return newMessages;
        }
        return [...prev, { id: generateUniqueId(), text: transcript || '...', sender: 'user' }];
      });


      if (event.results[0].isFinal) {
        handleSpeechResult(transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
        if(event.error !== 'no-speech') {
            setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
    }

    recognitionRef.current = recognition;
    
    if(!audioRef.current){
        audioRef.current = new Audio();
        audioRef.current.onended = () => setIsBotSpeaking(false);
    }

  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setMessages(prev => [...prev, {id: generateUniqueId(), text: 'Suna raha hoon...', sender: 'user'}]);
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const handleSpeechResult = async (transcript: string) => {
    if (!transcript.trim()) {
        // If the final transcript is empty, remove the "Suna raha hoon..." message
        setMessages(prev => prev.filter(m => m.text !== 'Suna raha hoon...' && m.text !== '...'));
        return;
    }
    
    setIsProcessing(true);
    
    const response = await handleBuddyChat({ message: transcript });
    
    let botResponseText = 'Yaar, abhi thoda problem hai. Ek min baad try kar! 🤔';
    if(response.result?.reply) {
        botResponseText = response.result.reply;
    } else if (response.error) {
        botResponseText = response.error;
    }

    const botMessage: Message = { id: generateUniqueId(), text: botResponseText, sender: 'bot' };
    setMessages(prev => [...prev, botMessage]);

    const ttsResponse = await handleTextToSpeech({ text: botResponseText });
    setIsProcessing(false);

    if (ttsResponse.result?.audioUrl && audioRef.current) {
        setIsBotSpeaking(true);
        audioRef.current.src = ttsResponse.result.audioUrl;
        audioRef.current.play();
    } else if (ttsResponse.error) {
        setError('Could not generate audio for the response.');
    }
  };

  const getMicButtonState = () => {
    if (isListening) return 'listening';
    if (isBotSpeaking || isProcessing) return 'processing';
    return 'idle';
  };

  const micButtonState = getMicButtonState();

  const renderMicIcon = () => {
    switch (micButtonState) {
      case 'listening':
        return <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse" />;
      case 'processing':
        return <Loader2 size={32} className="animate-spin" />;
      case 'idle':
        return <Mic size={32} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)' }}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between text-white border-b border-white/10">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles size={24} className="text-purple-400" />
          Buddy AI
        </h1>
        <p className="text-sm text-purple-300">Your Voice Companion</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'bot' && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Volume2 size={20} className="text-white" />
              </div>
            )}
            <div
              className="max-w-[80%] p-4 rounded-2xl shadow-lg"
              style={{
                background:
                  message.sender === 'user'
                    ? 'rgba(255,255,255,0.1)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <p className="leading-relaxed">{message.text}</p>
            </div>
             {message.sender === 'user' && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white/10 shrink-0">
                <Mic size={20} className="text-white" />
              </div>
            )}
          </div>
        ))}
         {isProcessing && (
            <div className="flex items-start gap-4 justify-start">
               <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Loader2 size={20} className="text-white animate-spin" />
              </div>
              <div className="max-w-[80%] p-4 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <p>Soch raha hoon bhai...</p>
              </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mic Button and Error Display */}
      <div className="p-6 border-t border-white/10">
        {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 bg-red-500/10 rounded-lg">
                <AlertCircle size={16} />
                <p>{error}</p>
            </div>
        )}
        <div className="flex justify-center items-center">
          <button
            onClick={handleMicClick}
            disabled={micButtonState === 'processing' || !!error}
            className="w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `radial-gradient(circle, ${isListening ? '#ef4444' : '#764ba2'} 0%, ${isListening ? '#b91c1c' : '#667eea'} 100%)`,
              boxShadow: `0 0 40px ${isListening ? 'rgba(239, 68, 68, 0.6)' : 'rgba(102, 126, 234, 0.5)'}`
            }}
          >
            {renderMicIcon()}
          </button>
        </div>
      </div>
    </div>
  );
}
