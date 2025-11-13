export interface GalleryPhoto {
    id: string;
    url: string;
    date: string;
    type: 'photo' | 'video';
    hint: string;
}
  
export const galleryPhotos: GalleryPhoto[] = [
    { id: '1', url: 'https://picsum.photos/seed/101/800/800', date: 'August 12, 2024', type: 'photo', hint: 'nature landscape' },
    { id: '2', url: 'https://picsum.photos/seed/102/800/800', date: 'August 12, 2024', type: 'photo', hint: 'city architecture' },
    { id: '3', url: 'https://picsum.photos/seed/103/800/800', date: 'August 12, 2024', type: 'video', hint: 'abstract art' },
    { id: '4', url: 'https://picsum.photos/seed/104/800/800', date: 'August 11, 2024', type: 'photo', hint: 'animal wildlife' },
    { id: '5', url: 'https://picsum.photos/seed/105/800/800', date: 'August 11, 2024', type: 'photo', hint: 'food delicious' },
    { id: '6', url: 'https://picsum.photos/seed/106/800/800', date: 'August 10, 2024', type: 'photo', hint: 'mountain travel' },
    { id: '7', url: 'https://picsum.photos/seed/107/800/800', date: 'August 10, 2024', type: 'video', hint: 'ocean waves' },
    { id: '8', url: 'https://picsum.photos/seed/108/800/800', date: 'August 10, 2024', type: 'photo', hint: 'portrait person' },
    { id: '9', url: 'https://picsum.photos/seed/109/800/800', date: 'August 09, 2024', type: 'photo', hint: 'night sky' },
];
