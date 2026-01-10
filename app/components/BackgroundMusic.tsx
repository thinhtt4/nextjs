'use client';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);

  // Cấu hình trình phát YouTube
  const opts: YouTubeProps['opts'] = {
    height: '0', // Ẩn hoàn toàn video
    width: '0',
    playerVars: {
      autoplay: 0,    // Không tự phát (trình duyệt sẽ chặn nếu để là 1)
      loop: 1,        // Lặp lại bài hát
      controls: 0,    // Ẩn các nút điều khiển của YouTube
      playlist: 'GqP24oXtBwg', // Bắt buộc có để tính năng loop hoạt động
    },
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(30); // Đặt âm lượng nhỏ vừa phải (0-100)
  };

  const togglePlay = () => {
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trình phát YouTube ẩn */}
      <YouTube videoId="GqP24oXtBwg" opts={opts} onReady={onReady} />

      {/* Nút điều khiển đẹp mắt */}
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-green-200 p-3 rounded-full shadow-lg hover:bg-green-50 transition-all text-green-600"
      >
        {isPlaying ? (
          <>
            <Volume2 size={20} className="animate-pulse" />
            <span className="text-xs font-medium">Đang phát nhạc nền</span>
          </>
        ) : (
          <>
            <VolumeX size={20} />
            <span className="text-xs font-medium">Bật nhạc chill</span>
          </>
        )}
      </button>
    </div>
  );
}