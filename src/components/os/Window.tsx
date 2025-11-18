'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minus, Move, CornerDownRight, Maximize, Minimize2 } from 'lucide-react';
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
  isMaximized: boolean;
  desktopRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
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
  isMaximized,
  desktopRef,
  children,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onDragStart,
  onResizeStart,
}: WindowProps) {

  const getWindowStyle = (): React.CSSProperties => {
    if (isMaximized && desktopRef.current) {
        const desktopRect = desktopRef.current.getBoundingClientRect();
        // Dock height is roughly 88px. (h-14 p-2 => 56+16=72, plus container p-2 => 72+16=88)
        const dockHeight = 88;
        
        return {
            transform: `translate(0px, 0px)`,
            width: `${desktopRect.width}px`,
            height: `${desktopRect.height - dockHeight}px`,
            zIndex: zIndex,
            transition: 'width 0.2s ease-in-out, height 0.2s ease-in-out, transform 0.2s ease-in-out',
        };
    }
    return {
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: zIndex,
        transition: 'none',
    };
};
  
  return (
    <div
      className="absolute"
      style={getWindowStyle()}
      onMouseDown={onFocus}
    >
      <Card
        className={cn(
          "w-full h-full flex flex-col shadow-2xl transition-shadow duration-300 overflow-hidden",
          isActive ? "shadow-blue-500/50" : "shadow-black/20",
          isMaximized && "rounded-none"
        )}
      >
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between p-2 h-10 bg-muted/50 border-b",
            isMaximized ? "rounded-t-none" : "rounded-t-lg",
            isMaximized ? "cursor-default" : "cursor-grab"
            )}
          onMouseDown={onDragStart}
          onDoubleClick={onMaximize}
        >
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMinimize}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMaximize}>
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-grow relative">
          {children}
        </CardContent>
        {!isMaximized && (
            <div 
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize text-muted-foreground hover:text-foreground"
                onMouseDown={onResizeStart}
                >
                <CornerDownRight className="w-full h-full p-0.5" />
            </div>
        )}
      </Card>
    </div>
  );
}
