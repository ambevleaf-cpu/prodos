export interface FileSystemNode {
  type: 'file' | 'folder';
  children?: { [key: string]: FileSystemNode };
}

export const fileSystem: { [key: string]: FileSystemNode } = {
  'Documents': {
    type: 'folder',
    children: {
      'Project Alpha': {
        type: 'folder',
        children: {
          'presentation_v1.pptx': { type: 'file' },
          'report_final.docx': { type: 'file' },
        },
      },
      'Meeting Notes': {
        type: 'folder',
        children: {
          '2024-07-29_notes.txt': { type: 'file' },
        },
      },
      'resume.pdf': { type: 'file' },
    },
  },
  'Pictures': {
    type: 'folder',
    children: {
      'Vacation 2024': {
        type: 'folder',
        children: {
          'IMG_001.jpg': { type: 'file' },
          'IMG_002.jpg': { type: 'file' },
        },
      },
      'logo.png': { type: 'file' },
    },
  },
  'Applications': {
    type: 'folder',
    children: {
      'VisionOS Explorer': { type: 'file' },
    },
  },
  'system_config.json': { type: 'file' },
};
