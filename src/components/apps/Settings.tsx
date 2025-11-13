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
import { BellRing, Monitor, Volume2, Wifi } from "lucide-react";
import { useState } from "react";

export default function Settings() {
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
        </CardContent>
      </Card>
    </div>
  );
}
