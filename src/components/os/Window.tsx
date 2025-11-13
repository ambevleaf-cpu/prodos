'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minus, Move, CornerDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WindowProps {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isActive: boolean;
  children: React.ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
}

export default function Window({
  id,
  title,
  x,
  y,
  width,
  height,
  zIndex,
  isActive,
  children,
  onFocus,
  onClose,
  onMinimize,
  onDragStart,
  onResizeStart,
}: WindowProps) {
  return (
    <div
      className="absolute transition-all duration-100 ease-out"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: zIndex,
      }}
      onMouseDown={onFocus}
    >
      <Card
        className={cn(
          "w-full h-full flex flex-col shadow-2xl transition-shadow duration-300",
          isActive ? "shadow-blue-500/50" : "shadow-black/20"
        )}
      >
        <CardHeader
          className="flex flex-row items-center justify-between p-2 h-10 bg-muted/50 rounded-t-lg border-b cursor-grab"
          onMouseDown={onDragStart}
        >
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMinimize}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-grow overflow-auto">
          {children}
        </CardContent>
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize text-muted-foreground hover:text-foreground"
          onMouseDown={onResizeStart}
        >
          <CornerDownRight className="w-full h-full p-0.5" />
        </div>
      </Card>
    </div>
  );
}
