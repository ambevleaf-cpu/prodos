'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BellRing, Monitor, Volume2, Wifi, Palette, UserCircle, LogOut, Cpu, Bot, Sparkles, Wind, Code, Users, Github, Linkedin, Twitter, Info, Star, MessageSquare, Video, Folder, Music, CheckSquare, Brain, Camera, Languages, Clock as ClockIcon, Calculator } from "lucide-react";
import { useState } from "react";
import { galleryPhotos } from '@/lib/gallery-data';
import NextImage from 'next/image';
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface SettingsProps {
  onSetWallpaper?: (photo: { url: string; hint: string; description: string; }) => void;
  onSignOut?: () => void;
}

export default function Settings({ onSetWallpaper, onSignOut }: SettingsProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [volume, setVolume] = useState([50]);
  const [wifi, setWifi] = useState(true);

  const features = [
    { 
        icon: Wind, 
        title: "Multitasking Desktop Environment", 
        description: "A dynamic and familiar desktop UI with a draggable and resizable window manager. Run multiple apps simultaneously, minimize them to the dock, or maximize for a focused view." 
    },
    { 
        icon: Users, 
        title: "Real-Time Social & Communication Suite", 
        description: "Connect with others through a full-featured Social Media feed, a real-time Messenger app, and make direct calls with WebRTC-powered Video Calling." 
    },
    { 
        icon: Bot, 
        title: "AI-Powered Intelligence", 
        description: "Experience the future with Genkit integration. Chat with Nexbro, a Hinglish-speaking AI assistant, and use the natural language search to find anything on the web." 
    },
    { 
        icon: Sparkles, 
        title: "Rich Application Ecosystem", 
        description: "Explore a variety of built-in apps, including a Camera, a multimedia Gallery for photos and videos, a Music Player, a Task Manager, and even a mind-bending memory game." 
    },
    { 
        icon: Code, 
        title: "Modern & Scalable Tech Stack", 
        description: "Built with Next.js, React, and TypeScript on the frontend, and powered by a real-time Firebase backend (Firestore and Auth) for a high-performance, scalable experience." 
    },
    { 
        icon: Star, 
        title: "Persistent & Personalized Experience", 
        description: "Your session is secure with Firebase Authentication. User profiles, conversations, posts, and music playlists are all stored in Firestore, ensuring your data persists across sessions." 
    },
  ];
  
  const appFeatures = [
      { icon: MessageSquare, name: "Messenger", description: "Real-time chat with other users, powered by Firestore." },
      { icon: Users, name: "Social Media", description: "A feed to create posts, follow users, and like content." },
      { icon: Video, name: "Video Call", description: "Make peer-to-peer video calls using WebRTC." },
      { icon: Bot, name: "Nexbro", description: "An AI chatbot that speaks Hinglish, powered by Genkit." },
      { icon: Folder, name: "File Explorer", description: "Navigate a virtual file system structure." },
      { icon: Music, name: "Music Player", description: "Listen to a playlist of tracks with metadata stored in Firestore." },
      { icon: Camera, name: "Camera", description: "Capture photos and record videos using your device's camera." },
      { icon: CheckSquare, name: "Task Manager", description: "Organize your to-do list with priorities and categories." },
      { icon: Brain, name: "Mind Game", description: "Test your memory with a fun, challenging sequence game." },
      { icon: Languages, name: "Translator", description: "Translate text between English and Hindi." },
      { icon: ClockIcon, name: "Clock", description: "A multi-functional clock with alarms, timer, and world clocks." },
      { icon: Calculator, name: "Calculator", description: "A standard calculator for basic arithmetic." },
  ]

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your system preferences and learn about Prod OS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <UserCircle className="w-5 h-5" /> Account
            </h3>
            <div className="rounded-lg border bg-background p-4 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                    <AvatarFallback>
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <h4 className="font-semibold text-lg">{user?.displayName || 'User'}</h4>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Button
                    variant="destructive"
                    onClick={onSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
          </div>
        
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Palette className="w-5 h-5" /> Personalization
            </h3>
            <div className="rounded-lg border bg-background p-4">
              <div className="space-y-0.5 mb-4">
                <Label htmlFor="wallpaper">Wallpaper</Label>
                <p className="text-sm text-muted-foreground">
                  Choose a wallpaper from your gallery.
                </p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                {galleryPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    className="relative rounded-md overflow-hidden group aspect-square focus:ring-2 focus:ring-ring focus:outline-none"
                    onClick={() => onSetWallpaper && onSetWallpaper({url: photo.url, hint: photo.hint, description: photo.id})}
                  >
                    <NextImage
                      src={photo.url}
                      alt={photo.id}
                      fill
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Monitor className="w-5 h-5" /> Display
            </h3>
            <div className="flex items-center justify-between rounded-lg border bg-background p-4">
              <div className="space-y-0.5">
                <Label htmlFor="resolution">Resolution</Label>
                <p className="text-sm text-muted-foreground">
                  Set the display resolution for your workspace.
                </p>
              </div>
              <Select defaultValue="1920">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1920">1920 x 1080</SelectItem>
                  <SelectItem value="2560">2560 x 1440</SelectItem>
                  <SelectItem value="3840">3840 x 2160</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Volume2 className="w-5 h-5" /> Sound
            </h3>
            <div className="flex items-center justify-between rounded-lg border bg-background p-4">
              <div className="space-y-0.5">
                <Label htmlFor="volume">Master Volume</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust the overall system volume.
                </p>
              </div>
              <div className="w-[180px] flex items-center gap-2">
                <Slider id="volume" value={volume} onValueChange={setVolume} max={100} step={1} />
                <span className="text-sm font-medium w-10 text-right">{volume[0]}%</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Wifi className="w-5 h-5" /> Network
            </h3>
             <div className="flex items-center justify-between rounded-lg border bg-background p-4">
              <div className="space-y-0.5">
                <Label htmlFor="wifi-switch">Wi-Fi</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable wireless networking.
                </p>
              </div>
              <Switch id="wifi-switch" checked={wifi} onCheckedChange={setWifi} />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <BellRing className="w-5 h-5" /> Notifications
            </h3>
            <div className="flex items-center justify-between rounded-lg border bg-background p-4">
              <div className="space-y-0.5">
                <Label>System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Check for new application and system updates.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "System is up to date",
                    description: "No new updates are available at this time.",
                  });
                }}
              >
                Check for Updates
              </Button>
            </div>
          </div>
          
          <Separator />
            
             <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Info className="w-5 h-5" /> About Prod OS
                </h3>
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl rounded-2xl" style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)' }}>
                  <CardHeader className="text-center pb-4">
                    <div className="inline-block mx-auto mb-4 p-3 rounded-full" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                       <Cpu size={32} />
                    </div>
                    <CardTitle className="text-4xl font-bold">Prod OS</CardTitle>
                    <CardDescription className="text-white/70 text-lg">A Concept OS for the Modern Web</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <p className="text-center text-white/80 mb-10 leading-relaxed max-w-3xl mx-auto">
                      Prod OS is a conceptual operating system built entirely with Next.js, Firebase, and cutting-edge AI. 
                      It explores the future of user interfaces, multitasking, and human-computer interaction in a web-native environment, creating a seamless and productive digital workspace.
                    </p>
                    
                    <div className="mb-12">
                        <h4 className="text-2xl font-semibold mb-6 text-center text-purple-300">Core Architecture</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <div key={index} className="p-6 rounded-2xl flex flex-col" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <feature.icon className="w-8 h-8 mb-4 text-purple-400"/>
                                    <h5 className="text-lg font-bold mb-2">{feature.title}</h5>
                                    <p className="text-sm text-white/70 flex-grow">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-12">
                        <h4 className="text-2xl font-semibold mb-6 text-center text-purple-300">Application Suite</h4>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {appFeatures.map((app, index) => (
                                <div key={index} className="p-4 rounded-xl flex items-start gap-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <app.icon className="w-6 h-6 mt-1 text-purple-400 shrink-0"/>
                                    <div>
                                        <h5 className="font-bold text-base">{app.name}</h5>
                                        <p className="text-xs text-white/70">{app.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center p-8 rounded-2xl mb-10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="relative w-40 h-40 rounded-full mb-6 overflow-hidden border-4 border-purple-400 shadow-lg">
                            <NextImage
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


        </CardContent>
      </Card>
    </div>
  );
}
