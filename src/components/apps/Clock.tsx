'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlarmClock, Timer, Watch, Globe } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [ringingAlarm, setRingingAlarm] = useState<{id: number, time: string, label: string, enabled: boolean} | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);


  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const playSound = () => {
    if (typeof window.AudioContext === 'undefined') return;
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext)();
    }
    const audioContext = audioContextRef.current;
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
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

  const startRinging = (alarm: {id: number, time: string, label: string, enabled: boolean}) => {
    setRingingAlarm(alarm);
    playSound(); // Play immediately
    audioIntervalRef.current = setInterval(playSound, 8000); // Repeat every 8 seconds
  };

  const stopRinging = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (ringingAlarm) {
        // Disable the alarm so it doesn't ring again
        setAlarms(alarms.map(a => 
            a.id === ringingAlarm.id ? { ...a, enabled: false } : a
        ));
    }
    setRingingAlarm(null);
  };

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerTimeLeft > 0) {
      interval = setInterval(() => {
        setTimerTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            startRinging({id: -1, time: '', label: 'Timer Finished', enabled: true});
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
    if (ringingAlarm) return;

    alarms.forEach(alarm => {
      if (alarm.enabled) {
        const now = new Date();
        const alarmTime = new Date();
        const [hours, minutes] = alarm.time.split(':');
        alarmTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (alarmTime.getHours() === now.getHours() && alarmTime.getMinutes() === now.getMinutes() && now.getSeconds() === 0) {
          startRinging(alarm);
        }
      }
    });
  }, [currentTime, alarms, ringingAlarm]);


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
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center">
              <div className="text-8xl font-bold text-gray-800 mb-4">
                {formatTime(currentTime)}
              </div>
              <div className="text-2xl text-gray-600 mb-8">
                {formatDate(currentTime)}
              </div>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600">Hour</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {currentTime.getHours().toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-sm text-gray-600">Minute</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {currentTime.getMinutes().toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl">
                  <div className="text-sm text-gray-600">Second</div>
                  <div className="text-2xl font-bold text-pink-600">
                    {currentTime.getSeconds().toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'alarm':
        return (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Alarms</h2>
              <button
                onClick={addAlarm}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                + Add Alarm
              </button>
            </div>
            <div className="space-y-4">
              {alarms.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <AlarmClock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No alarms set. Add one to get started!</p>
                </div>
              ) : (
                alarms.map(alarm => (
                  <div
                    key={alarm.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <Input
                        type="time"
                        value={alarm.time}
                        onChange={(e) => {
                          setAlarms(alarms.map(a => 
                            a.id === alarm.id ? { ...a, time: e.target.value } : a
                          ));
                        }}
                        className="text-3xl font-bold text-gray-800 bg-transparent border-none outline-none p-0 h-auto"
                      />
                      <Input
                        type="text"
                        value={alarm.label}
                        onChange={(e) => {
                          setAlarms(alarms.map(a => 
                            a.id === alarm.id ? { ...a, label: e.target.value } : a
                          ));
                        }}
                        className="text-lg text-gray-600 bg-transparent border-b border-gray-300 outline-none p-0 h-auto"
                        placeholder="Label"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={alarm.enabled} onCheckedChange={() => toggleAlarm(alarm.id)} />
                      <Button
                        onClick={() => deleteAlarm(alarm.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'timer':
        return (
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center">
              <div className="text-7xl font-bold text-gray-800 mb-8">
                {timerActive || timerTimeLeft > 0 ? formatTimerDisplay(timerTimeLeft) : `${timerHours.toString().padStart(2, '0')}:${timerMinutes.toString().padStart(2, '0')}:${timerSeconds.toString().padStart(2, '0')}`}
              </div>
              {(!timerActive && timerTimeLeft === 0) && (
                <div className="flex gap-4 justify-center mb-8">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Hours</label>
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={timerHours}
                      onChange={(e) => setTimerHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                      className="w-24 px-4 py-3 text-2xl font-bold text-center border-2 border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Minutes</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={timerMinutes}
                      onChange={(e) => setTimerMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-24 px-4 py-3 text-2xl font-bold text-center border-2 border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Seconds</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={timerSeconds}
                      onChange={(e) => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-24 px-4 py-3 text-2xl font-bold text-center border-2 border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                {timerActive ? (
                  <button onClick={() => setTimerActive(false)} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg">Pause</button>
                ) : (
                  <button onClick={timerTimeLeft > 0 ? () => setTimerActive(true) : startTimer} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg">
                    {timerTimeLeft > 0 ? 'Resume' : 'Start'}
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all shadow-lg"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        );
      case 'stopwatch':
        return (
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center">
              <div className="text-7xl font-bold text-gray-800 mb-8">
                {formatStopwatch(stopwatchTime)}
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={toggleStopwatch}
                  className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-all shadow-lg"
                >
                  {stopwatchActive ? 'Stop' : 'Start'}
                </button>
                <button
                  onClick={resetStopwatch}
                  className="px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all shadow-lg"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        );
      case 'world':
        return (
           <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">World Clocks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {worldClocks.map((clock, index) => {
                const time = new Date().toLocaleTimeString('en-US', {
                  timeZone: clock.timezone,
                  hour12: false
                });
                const [hours, minutes, seconds] = time.split(':');
                const date = new Date().toLocaleDateString('en-US', {
                  timeZone: clock.timezone,
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });
                const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
                const hour12 = parseInt(hours) % 12 || 12;
                
                return (
                  <div
                    key={index}
                    className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                          {clock.city}
                        </div>
                        <div className="text-sm text-gray-500">
                          {date}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl font-bold text-indigo-600">
                        {hour12.toString().padStart(2, '0')}:{minutes}
                      </div>
                      <div className="text-2xl font-semibold text-indigo-400">
                        :{seconds}
                      </div>
                      <div className="text-xl font-bold text-gray-600 ml-2">
                        {period}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-indigo-100">
                      <div className="text-xs text-gray-500">
                        Timezone: {clock.timezone}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  const tabs = [
    {id: 'clock', icon: Clock},
    {id: 'alarm', icon: AlarmClock},
    {id: 'timer', icon: Timer},
    {id: 'stopwatch', icon: Watch},
    {id: 'world', icon: Globe}
  ];

  return (
    <Card className="w-full h-full flex flex-col border-none shadow-none rounded-none bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <CardContent className="p-4 flex-grow flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-lg p-2">
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                            activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="hidden md:inline">{tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow overflow-auto rounded-3xl">
              {renderContent()}
            </div>
        </CardContent>
        <AlertDialog open={!!ringingAlarm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>⏰ {ringingAlarm?.label || 'Alarm'} ⏰</AlertDialogTitle>
              <AlertDialogDescription>
                It's {ringingAlarm?.time}. Time to wake up!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={stopRinging}>Stop</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </Card>
  );
}
