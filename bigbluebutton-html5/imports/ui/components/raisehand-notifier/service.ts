export const getRaiseHandSoundUrl = () => {
  const { cdn, basename } = window.meetingClientSettings.public.app;
  return `${cdn + basename}/resources/sounds/bbb-handRaise.mp3`;
};

export default {
  getRaiseHandSoundUrl,
};
