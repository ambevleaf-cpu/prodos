export interface Track {
    id: number;
    title: string;
    artist: string;
    url: string;
    coverArt: string;
}

export const playlist: Track[] = [
    {
        id: 1,
        title: "Forest Lullaby",
        artist: "Lesfm",
        url: "https://cdn.pixabay.com/audio/2022/10/26/audio_d167232a2f.mp3",
        coverArt: "https://picsum.photos/seed/music1/500/500",
    },
    {
        id: 2,
        title: "Just Relax",
        artist: "Lesfm",
        url: "https://cdn.pixabay.com/audio/2022/05/22/audio_18ae76a3ae.mp3",
        coverArt: "https://picsum.photos/seed/music2/500/500",
    },
    {
        id: 3,
        title: "The Beat of Nature",
        artist: "Olexy",
        url: "https://cdn.pixabay.com/audio/2022/11/11/audio_1e912f7129.mp3",
        coverArt: "https://picsum.photos/seed/music3/500/500",
    },
    {
        id: 4,
        title: "Good Night",
        artist: "FASSounds",
        url: "https://cdn.pixabay.com/audio/2024/02/06/audio_1165a6435c.mp3",
        coverArt: "https://picsum.photos/seed/music4/500/500",
    },
    {
        id: 5,
        title: "Spirit Blossom",
        artist: "RomanBelov",
        url: "https://cdn.pixabay.com/audio/2022/11/17/audio_84f97d5162.mp3",
        coverArt: "https://picsum.photos/seed/music5/500/500",
    },
];
    