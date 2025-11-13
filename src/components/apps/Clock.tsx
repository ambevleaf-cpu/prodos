'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlarmClock, Timer, Watch, Globe } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';

export default function ClockApp() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('clock');
  const [alarms, setAlarms] = useState<{id: number, time: string, label: string, enabled: boolean}[]>([]);
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerTimeLeft, setTimerTimeLeft] = useState(0);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const [worldClocks, setWorldClocks] = useState([
    { city: 'New York', timezone: 'America/New_York' },
    { city: 'London', timezone: 'Europe/London' },
    { city: 'Tokyo', timezone: 'Asia/Tokyo' },
    { city: 'Dubai', timezone: 'Asia/Dubai' }
  ]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const playSound = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext)();
    }
    const audioContext = audioContextRef.current;
    
    const createTone = (frequency: number, startTime: number, duration: number, volume = 0.15) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'triangle'; 
      
      const endTime = startTime + duration;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.1);
      gainNode.gain.setValueAtTime(volume, endTime - 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
      
      oscillator.start(startTime);
      oscillator.stop(endTime);
    };
    
    const now = audioContext.currentTime;
    const pattern = [
      { f: 440, t: 0, d: 0.6 }, { f: 554, t: 0.7, d: 0.6 },
      { f: 659, t: 1.4, d: 0.6 }, { f: 880, t: 2.1, d: 0.8 },
      { f: 659, t: 3.0, d: 0.5 }, { f: 554, t: 3.6, d: 0.5 },
      { f: 440, t: 4.2, d: 0.7 },
    ];
    
    pattern.forEach(note => {
      createTone(note.f, now + note.t, note.d, 0.18);
      createTone(note.f * 2, now + note.t, note.d, 0.08);
      createTone(note.f * 0.5, now + note.t, note.d, 0.06);
    });
  };

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerTimeLeft > 0) {
      interval = setInterval(() => {
        setTimerTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            playSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerTimeLeft]);

  // Stopwatch
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stopwatchActive) {
      interval = setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [stopwatchActive]);

  // Check alarms
  useEffect(() => {
    alarms.forEach(alarm => {
      if (alarm.enabled) {
        const now = new Date();
        const alarmTime = new Date();
        const [hours, minutes] = alarm.time.split(':');
        alarmTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (alarmTime.getHours() === now.getHours() && alarmTime.getMinutes() === now.getMinutes() && now.getSeconds() === 0) {
          playSound();
          alert(`⏰ Alarm: ${alarm.label || 'Wake up!'}`);
        }
      }
    });
  }, [currentTime, alarms]);


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTimerDisplay = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (milliseconds: number) => {
    const mins = Math.floor(milliseconds / 60000);
    const secs = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const getTimeInTimezone = (timezone: string) => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const addAlarm = () => {
    const newAlarm = {
      id: Date.now(),
      time: '08:00',
      label: 'Wake up',
      enabled: true
    };
    setAlarms([...alarms, newAlarm]);
  };

  const toggleAlarm = (id: number) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const deleteAlarm = (id: number) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id));
  };

  const startTimer = () => {
    const totalSeconds = (timerHours * 3600) + (timerMinutes * 60) + timerSeconds;
    if (totalSeconds > 0) {
      setTimerTimeLeft(totalSeconds);
      setTimerActive(true);
    }
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerTimeLeft(0);
  };

  const toggleStopwatch = () => {
    setStopwatchActive(!stopwatchActive);
  };

  const resetStopwatch = () => {
    setStopwatchActive(false);
    setStopwatchTime(0);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'clock':
        return (
          <div className="text-center p-4 md:p-8">
            <div className="text-5xl md:text-7xl font-bold text-foreground mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg md:text-xl text-muted-foreground">
              {formatDate(currentTime)}
            </div>
          </div>
        );
      case 'alarm':
        return (
          <div className="p-4 space-y-4">
            <Button onClick={addAlarm} className="w-full">Add Alarm</Button>
            {alarms.map(alarm => (
              <div key={alarm.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <Input type="time" value={alarm.time} onChange={e => setAlarms(alarms.map(a => a.id === alarm.id ? {...a, time: e.target.value} : a))} className="text-xl font-bold bg-transparent border-none p-1"/>
                  <Input type="text" placeholder="Label" value={alarm.label} onChange={e => setAlarms(alarms.map(a => a.id === alarm.id ? {...a, label: e.target.value} : a))} className="bg-transparent border-none p-1" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={alarm.enabled} onCheckedChange={() => toggleAlarm(alarm.id)} />
                  <Button variant="destructive" size="sm" onClick={() => deleteAlarm(alarm.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'timer':
        return (
          <div className="text-center p-4">
            <div className="text-6xl font-mono font-bold my-4">
              {timerActive || timerTimeLeft > 0 ? formatTimerDisplay(timerTimeLeft) : 'Set Timer'}
            </div>
            {(!timerActive && timerTimeLeft === 0) && (
              <div className="flex justify-center gap-2 mb-4">
                <Input type="number" value={timerHours} onChange={e => setTimerHours(Number(e.target.value))} className="w-20 text-center" placeholder="HH" />
                <Input type="number" value={timerMinutes} onChange={e => setTimerMinutes(Number(e.target.value))} className="w-20 text-center" placeholder="MM" />
                <Input type="number" value={timerSeconds} onChange={e => setTimerSeconds(Number(e.target.value))} className="w-20 text-center" placeholder="SS" />
              </div>
            )}
            <div className="flex justify-center gap-2">
              {timerActive ? (
                <Button onClick={() => setTimerActive(false)}>Pause</Button>
              ) : (
                <Button onClick={timerTimeLeft > 0 ? () => setTimerActive(true) : startTimer}>
                  {timerTimeLeft > 0 ? 'Resume' : 'Start'}
                </Button>
              )}
              <Button variant="secondary" onClick={resetTimer}>Reset</Button>
            </div>
          </div>
        );
      case 'stopwatch':
        return (
          <div className="text-center p-4">
            <div className="text-6xl font-mono font-bold my-8">
              {formatStopwatch(stopwatchTime)}
            </div>
            <div className="flex justify-center gap-2">
              <Button onClick={toggleStopwatch}>{stopwatchActive ? 'Stop' : 'Start'}</Button>
              <Button variant="secondary" onClick={resetStopwatch}>Reset</Button>
            </div>
          </div>
        );
      case 'world':
        return (
          <div className="p-4 space-y-3">
            {worldClocks.map(clock => (
              <div key={clock.city} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-semibold">{clock.city}</span>
                <span className="font-mono text-lg">{getTimeInTimezone(clock.timezone)}</span>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <Card className="w-full h-full flex flex-col border-none shadow-none rounded-none bg-background">
      <CardContent className="p-0 flex-grow flex flex-col">
        <div className="flex border-b">
            {[
                {id: 'clock', icon: Clock},
                {id: 'alarm', icon: AlarmClock},
                {id: 'timer', icon: Timer},
                {id: 'stopwatch', icon: Watch},
                {id: 'world', icon: Globe}
            ].map(tab => (
                <Button key={tab.id} variant="ghost" onClick={() => setActiveTab(tab.id)} className={`flex-1 rounded-none capitalize ${activeTab === tab.id ? 'bg-muted font-bold' : ''}`}>
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.id}
                </Button>
            ))}
        </div>
        <div className="flex-grow overflow-auto">
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
}
