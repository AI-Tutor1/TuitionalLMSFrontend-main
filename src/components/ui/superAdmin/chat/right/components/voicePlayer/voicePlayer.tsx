import React, { useState, useRef, useEffect } from "react";
import { IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import classes from "./voicePlayer.module.css";

interface VoicePlayerProps {
  url: string;
  duration?: number;
  isOwnMessage: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ url, duration, isOwnMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className={`${classes.playerContainer} ${isOwnMessage ? classes.ownPlayer : ""}`} onClick={(e) => e.stopPropagation()}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        preload="none"
      />
      
      <IconButton size="small" onClick={togglePlay} className={classes.playButton}>
        {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
      </IconButton>

      <div className={classes.scrubberContainer}>
        <input
          type="range"
          min="0"
          max={duration || (audioRef.current?.duration || 0)}
          value={currentTime}
          onChange={handleScrub}
          className={classes.scrubber}
        />
        <div className={classes.timeInfo}>
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : formatTime(audioRef.current?.duration || 0)}</span>
        </div>
      </div>

      <div className={classes.waveform}>
         {/* Waveform placeholder or visual bars */}
         <div className={classes.waveBar} style={{ height: '40%' }}></div>
         <div className={classes.waveBar} style={{ height: '70%', background: isPlaying ? 'var(--primary-color)' : '' }}></div>
         <div className={classes.waveBar} style={{ height: '50%' }}></div>
         <div className={classes.waveBar} style={{ height: '80%' }}></div>
         <div className={classes.waveBar} style={{ height: '30%' }}></div>
      </div>
    </div>
  );
};
