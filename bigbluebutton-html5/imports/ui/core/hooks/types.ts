export type VoiceUserMetadata = {
  role?: string;
  color?: string;
  speechLocale?: string;
  name: string;
  // Set when the viewer is not entitled to this user's identity: the indicator is still
  // rendered, but `name` carries no identifying value and must not be displayed.
  hidden?: boolean;
};
