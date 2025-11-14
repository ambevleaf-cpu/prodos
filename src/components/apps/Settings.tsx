
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
import { BellRing, Monitor, Volume2, Wifi, Palette, UserCircle, LogOut, Cpu, Bot, Sparkles, Wind, Code, Users, Github, Linkedin, Twitter, Info, Star, MessageSquare, Video, Folder, Music, CheckSquare, Brain, Camera, Languages, Clock as ClockIcon, Calculator, GalleryHorizontal, Youtube, Notebook, ShieldCheck, Database, Layers, Feather } from "lucide-react";
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
      { 
          icon: MessageSquare, 
          name: "Messenger", 
          description: "Engage in one-on-one, real-time conversations. This app leverages Firestore to sync messages instantly between users, creating a seamless and responsive chat experience. It features a full chat interface, user list, and new conversation capabilities." 
      },
      { 
          icon: Users, 
          name: "Social Media", 
          description: "A complete social platform where you can create posts, see a public feed, like content from others, and follow other users. All data is managed in real-time through Firestore, providing a dynamic and interactive social environment." 
      },
      { 
          icon: Video, 
          name: "Video Call", 
          description: "Make direct, peer-to-peer video calls to other users. This feature uses WebRTC for efficient, low-latency video streaming, with Firestore handling the call signaling (offer, answer, and ICE candidates)." 
      },
      { 
          icon: Bot, 
          name: "Nexbro", 
          description: "Chat with a friendly AI assistant that understands and replies in Hinglish. This app showcases the power of Genkit for creating engaging and culturally-aware conversational AI experiences." 
      },
      { 
          icon: Folder, 
          name: "File Explorer", 
          description: "A classic desktop feature allowing you to browse and navigate a virtual file system, demonstrating hierarchical data structures and UI state management within a familiar interface." 
      },
      { 
          icon: Music, 
          name: "Music Player", 
          description: "Listen to a dynamic playlist of tracks stored in Firestore. The app features standard playback controls, a progress bar, volume adjustment, and the ability for users to add new songs to the public playlist." 
      },
      { 
          icon: Camera, 
          name: "Camera", 
          description: "Use your device's hardware to capture photos and record videos. This app demonstrates browser Media API integration for a rich multimedia experience, complete with a live preview and capture controls." 
      },
      { 
          icon: GalleryHorizontal, 
          name: "Gallery", 
          description: "Browse your collection of photos and videos. This app includes a modal viewer with a video player and actions like sharing, downloading, or deleting items, managing a local state of media content." 
      },
      { 
          icon: CheckSquare, 
          name: "Task Manager", 
          description: "A comprehensive tool to organize your to-do list. Add tasks, set priorities and categories, specify due dates, and track your overall progress with a visual progress bar." 
      },
      { 
          icon: Brain, 
          name: "Mind Game", 
          description: "A fun and challenging memory game that tests your ability to recall and repeat increasingly complex color sequences, complete with levels and scoring to engage the user." 
      },
      { 
          icon: Languages, 
          name: "Translator", 
          description: "Translate text between English and Hindi. This app utilizes a simple dictionary for quick translations and integrates text-to-speech functionality using Genkit's TTS capabilities." 
      },
      { 
          icon: ClockIcon, 
          name: "Clock", 
          description: "A multi-functional timekeeping app. It includes a live clock, configurable alarms, a countdown timer, a stopwatch, and a world clock to view different timezones." 
      },
      { 
          icon: Calculator, 
          name: "Calculator", 
          description: "A sleek and standard calculator for performing basic arithmetic operations, an essential utility for any desktop environment, built with a simple and clean interface." 
      },
      { 
          icon: Youtube, 
          name: "YouTube", 
          description: "A simple web browser embedded in a window, configured to search and display video results from Google, demonstrating how web content can be integrated into the OS." 
      },
      { 
          icon: Notebook, 
          name: "Notes", 
          description: "An embedded web page that serves as a simple note-taking application, showcasing how third-party web apps can be framed within the OS for extended functionality." 
      },
  ];

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
                      Hello! I'm Ayush, and this is my vision for a modern, web-native operating system. I built Prod OS from the ground up using Next.js, Firebase, and cutting-edge AI to explore the future of user interfaces, multitasking, and human-computer interaction. My goal was to create a seamless and productive digital workspace that lives entirely in the browser.
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
                        <h4 className="text-2xl font-semibold mb-6 text-center text-purple-300">Application Suite: A Detailed Look</h4>
                        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
                            {appFeatures.map((app, index) => (
                                <div key={index} className="p-4 rounded-xl flex items-start gap-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <div className="p-2 bg-purple-900/50 rounded-lg mt-1">
                                        <app.icon className="w-6 h-6 text-purple-300 shrink-0"/>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-base">{app.name}</h5>
                                        <p className="text-xs text-white/70">{app.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-12">
                        <h4 className="text-2xl font-semibold mb-8 text-center text-purple-300">My Philosophy & Design</h4>
                         <div className="space-y-8">
                            <div className="flex items-start gap-6">
                                <div className="p-3 bg-purple-900/50 rounded-lg mt-1">
                                    <Layers className="w-8 h-8 text-purple-300" />
                                </div>
                                <div>
                                    <h5 className="text-xl font-bold mb-1">Component-Based Architecture</h5>
                                    <p className="text-white/80 leading-relaxed">
                                        I built Prod OS from the ground up using a modular, component-based approach with React. Every visual element, from a simple button in the Music Player to an entire application window, is an isolated and reusable component. This philosophy, powered by Next.js, not only makes the system highly maintainable but also incredibly fast, as I only render or update the necessary parts of the UI. This is my departure from monolithic applications, allowing for a dynamic and fluid user experience.
                                    </p>
                                </div>
                            </div>
                             <div className="flex items-start gap-6">
                                <div className="p-3 bg-purple-900/50 rounded-lg mt-1">
                                    <Database className="w-8 h-8 text-purple-300" />
                                </div>
                                <div>
                                    <h5 className="text-xl font-bold mb-1">Real-Time First Backend</h5>
                                    <p className="text-white/80 leading-relaxed">
                                        The entire backend is powered by Firebase, with a "real-time first" mindset. Instead of traditional request-response cycles, I use Firestore's real-time listeners (`onSnapshot`). This means that data changes in the database are pushed to your screen instantly. You can see this in action in the Messenger, where messages appear without a refresh, or in the Social Media feed, where new posts and likes update live. This is how I created a living, breathing digital environment.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6">
                                <div className="p-3 bg-purple-900/50 rounded-lg mt-1">
                                    <Bot className="w-8 h-8 text-purple-300" />
                                </div>
                                <div>
                                    <h5 className="text-xl font-bold mb-1">Pragmatic AI Integration</h5>
                                    <p className="text-white/80 leading-relaxed">
                                        For me, Artificial Intelligence isn't just a gimmick; it's a core utility. Using Google's Genkit, I integrated AI where it provides genuine value. The `Nexbro` chatbot offers a conversational interface, the search bar understands natural language, and the Translator uses TTS to bring text to life. I designed the architecture to make adding new AI "flows" simple and scalable, opening the door for future features like AI-assisted task creation or content summarization.
                                    </p>
                                </div>
                            </div>
                             <div className="flex items-start gap-6">
                                <div className="p-3 bg-purple-900/50 rounded-lg mt-1">
                                    <ShieldCheck className="w-8 h-8 text-purple-300" />
                                </div>
                                <div>
                                    <h5 className="text-xl font-bold mb-1">Secure By Design</h5>
                                    <p className="text-white/80 leading-relaxed">
                                        Security was not an afterthought. I leveraged Firebase Authentication for user management and Firestore Security Rules for data access control. I wrote the rules to enforce a strict user-ownership model: your data is your own. The `isOwner` function in the rules is a prime example, ensuring that a user can only ever access documents within their own data path (e.g., `/users/{'{userId}'}/...`). This path-based security is simple, powerful, and prevents data leaks between users.
                                    </p>
                                </div>
                            </div>
                              <div className="flex items-start gap-6">
                                <div className="p-3 bg-purple-900/50 rounded-lg mt-1">
                                    <Feather className="w-8 h-8 text-purple-300" />
                                </div>
                                <div>
                                    <h5 className="text-xl font-bold mb-1">Aesthetically Driven UI/UX</h5>
                                    <p className="text-white/80 leading-relaxed">
                                        I crafted the user interface using ShadCN/UI components and Tailwind CSS, adhering to modern design principles. My goal was a clean, aesthetically pleasing, and intuitive experience. The use of a consistent color palette (which I defined in `globals.css` with HSL variables), thoughtful animations, and a responsive layout ensures the OS is a pleasure to use. The animated wallpaper itself is a testament to this, creating an immersive and futuristic feel from the moment you log in.
                                    </p>
                                </div>
                            </div>
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
                        <h4 className="text-xl font-semibold mb-4 text-purple-300">Key Technologies I Used</h4>
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
