'use client';

import { useState } from 'react';
import { fileSystem, type FileSystemNode } from '@/lib/file-system';
import { File, Folder, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FileExplorer() {
  const [path, setPath] = useState<string[]>([]);
  
  const navigateTo = (folderName: string) => {
    setPath([...path, folderName]);
  };

  const navigateBack = () => {
    setPath(path.slice(0, -1));
  };
  
  const navigateHome = () => {
    setPath([]);
  }

  const getCurrentNode = () => {
    let currentNode: FileSystemNode | undefined = { type: 'folder', children: fileSystem };
    for (const part of path) {
      if (currentNode?.type === 'folder' && currentNode.children) {
        currentNode = currentNode.children[part];
      } else {
        return null;
      }
    }
    return currentNode;
  };

  const currentNode = getCurrentNode();
  
  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={navigateHome} disabled={path.length === 0}>
        <Home className="h-4 w-4" />
      </Button>
      <ChevronRight className="h-4 w-4" />
      {path.map((part, index) => (
        <div key={index} className="flex items-center gap-1">
          <Button 
            variant="link" 
            className="p-0 h-auto"
            onClick={() => setPath(path.slice(0, index + 1))}>
              {part}
          </Button>
          {index < path.length - 1 && <ChevronRight className="h-4 w-4" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-card p-2">
      <header className="flex items-center p-2 border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigateBack} disabled={path.length === 0}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="ml-2 flex-grow">{renderBreadcrumbs()}</div>
      </header>
      <div className="flex-grow overflow-auto p-2">
        {currentNode?.type === 'folder' && currentNode.children ? (
          <ul className="space-y-1">
            {Object.entries(currentNode.children).map(([name, node]) => (
              <li key={name}>
                <button
                  onClick={() => node.type === 'folder' && navigateTo(name)}
                  className={`w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors ${
                    node.type === 'folder' ? 'hover:bg-accent hover:text-accent-foreground cursor-pointer' : 'cursor-default'
                  }`}
                  disabled={node.type !== 'folder'}
                >
                  {node.type === 'folder' ? <Folder className="h-5 w-5 text-primary" /> : <File className="h-5 w-5 text-muted-foreground" />}
                  <span>{name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center p-8">Folder is empty or does not exist.</p>
        )}
      </div>
    </div>
  );
}
