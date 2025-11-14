'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Smile, MoreVertical, Sparkles, Zap, Heart, Menu, X, Loader2 } from 'lucide-react';
import { handleNexbroChat } from '@/app/actions';

export default function NexbroChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Arre bhai! Kya haal chaal? Main Nexbro hoon, tera personal AI bro! 🎉 Bata kya help chahiye?",
      sender: 'bot',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      const newMessage = {
        id: Date.now(),
        text: input,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newMessage]);
      const userInput = input;
      setInput('');
      setIsTyping(true);

      const response = await handleNexbroChat({ message: userInput });

      let botResponseText = "Yaar, abhi thodi problem hai. Ek min baad try kar! 🤔";
      if(response.result?.reply) {
        botResponseText = response.result.reply;
      } else if (response.error) {
        botResponseText = response.error;
      }

      const botResponse = {
        id: Date.now() + 1,
        text: botResponseText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }
  };

  const quickReplies = ['Joke sunao yaar 😄', 'Kuch naya sikhao bhai 📚', 'Mast fact batao! 🌟', 'Motivate karo boss 💡'];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite', animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)', backdropFilter: 'blur(20px)' }}>
        <div className="relative p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg text-white" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="relative">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)' }}>
                🤖
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Nexbro
                <Sparkles size={18} className="text-yellow-300" />
              </h1>
              <p className="text-sm text-white/80">Hamesha tere saath hoon bhai</p>
            </div>
          </div>
          <button className="p-3 rounded-full text-white" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Side Menu */}
      {menuOpen && (
        <div className="absolute top-20 left-0 w-64 z-50 p-4 rounded-r-3xl" style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.98) 0%, rgba(118, 75, 162, 0.98) 100%)', backdropFilter: 'blur(20px)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
          <div className="space-y-3">
            <button className="w-full p-4 rounded-2xl text-white text-left font-semibold flex items-center gap-3" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Zap size={20} /> Nayi Baatein
            </button>
            <button className="w-full p-4 rounded-2xl text-white text-left font-semibold flex items-center gap-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Heart size={20} /> Saved Chats
            </button>
            <button className="w-full p-4 rounded-2xl text-white text-left font-semibold flex items-center gap-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Sparkles size={20} /> Settings
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className="p-4 rounded-3xl shadow-xl"
                style={{
                  background: message.sender === 'user'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255,255,255,0.95)',
                  color: message.sender === 'user' ? 'white' : '#1f2937',
                  backdropFilter: 'blur(20px)',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
              </div>
              <p className={`text-xs mt-1 px-2 ${message.sender === 'user' ? 'text-right text-white/60' : 'text-left text-white/60'}`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="p-4 rounded-3xl shadow-xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <Loader2 size={20} className="text-purple-600 animate-spin" />
              <p className="text-gray-600">Nexbro soch raha hai...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-6 pb-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(reply);
                // Optionally auto-send
                // setInput(reply);
                // handleSend(); // this would require `handleSend` to use the `reply` text
              }}
              className="px-5 py-2.5 rounded-full text-white font-medium whitespace-nowrap shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 pt-0">
        <div className="flex items-center gap-3 p-4 rounded-3xl shadow-2xl" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
          <button className="p-2 rounded-full text-gray-600" style={{ backgroundColor: 'rgba(102,126,234,0.1)' }}>
            <Paperclip size={20} />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Likh bhai kuch..."
            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base"
            disabled={isTyping}
          />

          <button className="p-2 rounded-full text-gray-600" style={{ backgroundColor: 'rgba(102,126,234,0.1)' }}>
            <Smile size={20} />
          </button>

          {input.trim() ? (
            <button
              onClick={handleSend}
              disabled={isTyping}
              className="p-3 rounded-full text-white shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                animation: 'pulse 2s ease-in-out infinite',
                opacity: isTyping ? 0.5 : 1
              }}
            >
              <Send size={20} />
            </button>
          ) : (
            <button className="p-3 rounded-full text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Mic size={20} />
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(102, 126, 234, 0.5); }
          50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(102, 126, 234, 0.8); }
        }
      `}</style>
    </div>
  );
}
