export interface AudioCaptionsSpeechSelectorContainerProps {
  speechChecked: boolean;
  speechVoices: string[];
  showJoinHint?: boolean;
}

export interface AudioCaptionsSpeechSelectorProps {
  speechLocale: string;
  speechVoices: string[];
  showJoinHint?: boolean;
  speechChecked: boolean;
}
