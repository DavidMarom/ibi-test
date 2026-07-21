"use client";

import { useEffect, useState } from "react";
import { VolumeOffIcon, VolumeOnIcon } from "@/components/icons";
import { isSoundMuted, setSoundMuted } from "@/lib/sound";
import styles from "./SoundToggle.module.css";
import { MUTE_LABEL, UNMUTE_LABEL } from "./SoundToggle.constants";

export function SoundToggle() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(isSoundMuted());
  }, []);

  function handleToggle() {
    const next = !isMuted;
    setSoundMuted(next);
    setIsMuted(next);
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={handleToggle}
      aria-pressed={isMuted}
      aria-label={isMuted ? UNMUTE_LABEL : MUTE_LABEL}
    >
      {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
    </button>
  );
}
