import React from "react";
import { layoutSelect } from "/imports/ui/components/layout/context";
import { Layout } from "/imports/ui/components/layout/layoutTypes";
import useSpeechVoices from "/imports/ui/core/local-states/useSpeechVoices";
import { useCurrentUser } from '/imports/ui/core/hooks/useCurrentUser';
import { getSpeechVoices } from "./service";
import { User } from "/imports/ui/Types/user";


interface CaptionsButtonProps {
  isRTL: boolean;
  availableVoices: string[];
  currentSpeechLocale: string;
  isSUpported: boolean;
  isVoiceUser: boolean;
}

const CaptionsButton: React.FC<CaptionsButtonProps> = ({
  isRTL,
  availableVoices,
  currentSpeechLocale,
}) => {
  return (
    <div>
      <button>CC</button>
    </div>
  );
};

const CaptionsButtonContainer: React.FC = () => {
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const [voices] = useSpeechVoices();
  const availableVoices = getSpeechVoices(voices as string[]);
  const isSupported = availableVoices.length > 0;

  const currentUserData = useCurrentUser((user: Partial<User>) => {
    return {
      userId: user.userId,
      speechLocale: user.speechLocale,
      voice: user.voice,
    };
  });

  return (<CaptionsButton
    isRTL={isRTL}
    availableVoices={availableVoices}
    currentSpeechLocale={currentUserData?.speechLocale ?? ''}
    isSUpported={isSupported}
    isVoiceUser={!!currentUserData?.voice}
  />);
};

export default CaptionsButtonContainer;