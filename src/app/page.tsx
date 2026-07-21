"use client";

import { useState } from "react";
import { GameBoard, PlayerSignIn } from "@/components";
import type { AuthedPlayer } from "@/types/player";

export default function HomePage() {
  const [players, setPlayers] = useState<[AuthedPlayer, AuthedPlayer] | null>(null);

  if (!players) {
    return (
      <main>
        <PlayerSignIn onReady={(player1, player2) => setPlayers([player1, player2])} />
      </main>
    );
  }

  return (
    <main>
      <GameBoard player1={players[0]} player2={players[1]} />
    </main>
  );
}
