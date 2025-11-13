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
import { BellRing, Monitor, Volume2, Wifi, Palette, UserCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { galleryPhotos, type GalleryPhoto } from '@/lib/gallery-data';
import NextImage from 'next/image';

interface SettingsProps {
  onSetWallpaper?: (photo: { url: string; hint: string; description: string; }) => void;
  onSignOut?: () => void;
}

export default function Settings({ onSetWallpaper, onSignOut }: SettingsProps) {
  const { toast } = useToast();
  const [volume, setVolume] = useState([50]);
  const [wifi, setWifi] = useState(true);

  return (
    <div className="h-full overflow-y-auto bg-background p-4">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your system preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Palette className="w-5 h-5" /> Personalization
            </h3>
            <div className="rounded-lg border p-4">
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
            <div className="flex items-center justify-between rounded-lg border p-4">
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
            <div className="flex items-center justify-between rounded-lg border p-4">
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
             <div className="flex items-center justify-between rounded-lg border p-4">
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
            <div className="flex items-center justify-between rounded-lg border p-4">
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

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <UserCircle className="w-5 h-5" /> Account
            </h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Session</Label>
                <p className="text-sm text-muted-foreground">
                  End your current session and sign out.
                </p>
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
        </CardContent>
      </Card>
    </div>
  );
}
