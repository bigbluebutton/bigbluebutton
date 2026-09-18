export type VoiceItem = {
  startTime?: number;
  endTime?: number;
  muted: boolean;
  talking: boolean;
  userId: string;
  user: VoiceUserMetadata;
};

export type VoiceUserMetadata = {
  role?: string;
  color?: string;
  speechLocale?: string;
  name: string;
  // Set when the viewer is not entitled to this user's identity: the indicator is still
  // rendered, but `name` carries no identifying value and must not be displayed.
  hidden?: boolean;
};

/**
 * Return type for the useWhoIsUnmuted hook.
 */
export type UnmutedUsersState = {
  data: Record<string, boolean>;
  loading: boolean;
};

/**
 * Return type for the useWhoIsTalking hook.
 */
export type TalkingUsersState = {
  data: Record<string, boolean>;
  loading: boolean;
};

/**
 * Return type for the useTalkingUsers hook.
 */
export type TalkingUsersHookResult = {
  error: undefined;
  loading: boolean;
  data: Record<string, VoiceItem>;
};
