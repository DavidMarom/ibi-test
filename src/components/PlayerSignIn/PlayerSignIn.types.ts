import type { AuthedPlayer } from "@/types/player";

export type SlotStatus = "idle" | "loading" | "signed_in" | "error";

export interface SlotState {
  status: SlotStatus;
  player: AuthedPlayer | null;
  errorMessage: string | null;
}

export const IDLE_SLOT_STATE: SlotState = {
  status: "idle",
  player: null,
  errorMessage: null,
};
