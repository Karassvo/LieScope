// src/components/AudioPlayer.tsx

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'; // Предполагаем, что вы используете lucide-react для иконок

interface AudioPlayerProps {
  audioUrl: string; // audioUrl здесь всегда должен быть строкой (URL)
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, className = '' }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // От 0 до 1
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Сбрасываем состояние плеера при изменении audioUrl
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      audio.load(); // Перезагружаем элемент audio для нового источника

      // Обработчики событий
      const setAudioData = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) { // Проверка на валидную длительность
          setDuration(audio.duration);
        } else {
          setDuration(0);
        }
      };
      const setAudioTime = () => setCurrentTime(audio.currentTime);
      const togglePlayState = () => setIsPlaying(!audio.paused);
      const handleEnded = () => setIsPlaying(false);

      audio.addEventListener('loadeddata', setAudioData);
      audio.addEventListener('timeupdate', setAudioTime);
      audio.addEventListener('play', togglePlayState);
      audio.addEventListener('pause', togglePlayState);
      audio.addEventListener('ended', handleEnded);

      // Функция очистки: удаляем слушателей событий
      return () => {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('play', togglePlayState);
        audio.removeEventListener('pause', togglePlayState);
        audio.removeEventListener('ended', handleEnded);
        // Если аудио играло, останавливаем его при размонтировании
        if (!audio.paused) {
          audio.pause();
        }
        // Важно: освобождаем Object URL, если он был создан
        if (audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }
      };
    }
  }, [audioUrl]); // Зависимость от audioUrl

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => console.error("Ошибка воспроизведения аудио:", e));
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false); // Размутируем, если громкость увеличивается
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isMuted) {
        audio.volume = volume; // Восстанавливаем предыдущую громкость
      } else {
        audio.volume = 0; // Мутируем
      }
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={`flex items-center space-x-2 bg-gray-700 p-2 rounded-lg ${className}`}>
      {/* preload="auto" позволяет браузеру загружать аудио сразу после получения URL */}
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      <button onClick={togglePlay} className="text-white hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>

      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={handleSeek}
        className="flex-grow h-1 rounded-lg appearance-none cursor-pointer bg-gray-500 accent-indigo-500"
      />
      <div className="text-white text-xs whitespace-nowrap">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <button onClick={toggleMute} className="text-white hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-gray-500 accent-indigo-500"
      />
    </div>
  );
};

export default AudioPlayer;