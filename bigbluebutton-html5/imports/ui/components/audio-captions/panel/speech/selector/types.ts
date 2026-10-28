export interface AudioCaptionsSpeechSelectorContainerProps {
  speechChecked: boolean;
  speechVoices: string[];
  inAudioModal?: boolean;
}

export interface AudioCaptionsSpeechSelectorProps {
  speechLocale: string;
  speechVoices: string[];
  inAudioModal?: boolean;
  speechChecked: boolean;
}
