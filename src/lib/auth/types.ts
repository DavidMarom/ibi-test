export interface PlayerProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
}

export interface AuthSuccess {
  ok: true;
  profile: PlayerProfile;
}

export interface AuthFailure {
  ok: false;
  status: 401;
  message: string;
}

export type AuthResult = AuthSuccess | AuthFailure;
