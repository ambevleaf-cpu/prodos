'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Github, Linkedin, Twitter } from 'lucide-react';

export default function AboutApp() {
  return (
    <div className="w-full h-full overflow-y-auto" style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)' }}>
      <div className="p-8 text-white">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl rounded-2xl">
          <CardHeader className="text-center pb-4">
            <div className="inline-block mx-auto mb-4 p-3 rounded-full" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cpu"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M9 2v2"/><path d="M9 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/></svg>
            </div>
            <CardTitle className="text-4xl font-bold">Prod OS</CardTitle>
            <CardDescription className="text-white/70 text-lg">A Concept OS for the Modern Web</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-white/80 mb-10 leading-relaxed">
              Prod OS is a conceptual operating system built entirely with Next.js, Firebase, and cutting-edge AI. 
              It explores the future of user interfaces, multitasking, and human-computer interaction in a web-native environment.
            </p>
            
            <div className="flex flex-col items-center p-8 rounded-2xl mb-10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="relative w-40 h-40 rounded-full mb-6 overflow-hidden border-4 border-purple-400 shadow-lg">
                    <Image
                    src="https://i.pinimg.com/736x/54/81/40/548140e4219f867b9c903cd7a304a914.jpg"
                    alt="Ayush Kumar"
                    fill
                    className="object-cover"
                    />
                </div>
                <h3 className="text-3xl font-bold text-white">Ayush Kumar</h3>
                <p className="text-purple-300 font-medium text-lg">Founder & Lead Architect</p>
                <div className="flex gap-6 mt-6">
                    <a href="#" className="text-white/70 hover:text-white transition-colors"><Github size={28} /></a>
                    <a href="#" className="text-white/70 hover:text-white transition-colors"><Linkedin size={28} /></a>
                    <a href="#" className="text-white/70 hover:text-white transition-colors"><Twitter size={28} /></a>
                </div>
            </div>

             <div className="text-center">
                <h4 className="text-xl font-semibold mb-4 text-purple-300">Key Technologies</h4>
                <div className="flex justify-center flex-wrap gap-4 text-sm">
                    <span className="px-4 py-2 rounded-full bg-white/10">Next.js</span>
                    <span className="px-4 py-2 rounded-full bg-white/10">React</span>
                    <span className="px-4 py-2 rounded-full bg-white/10">Firebase</span>
                    <span className="px-4 py-2 rounded-full bg-white/10">Genkit</span>
                    <span className="px-4 py-2 rounded-full bg-white/10">Tailwind CSS</span>
                    <span className="px-4 py-2 rounded-full bg-white/10">ShadCN/UI</span>
                </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
