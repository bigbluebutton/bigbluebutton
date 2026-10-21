import React from 'react';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import Styled from './styles';

/**
 * The design's room illustration, shown until a mode is picked. Decorative: the
 * empty state's text says the same. An image cannot read the theme's tokens, so
 * the dark theme gets its own file rather than a filter (the native theme never
 * filters).
 */
const RoomIllustration: React.FC = () => {
  const { darkTheme } = useSettings(SETTINGS.APPLICATION) as { darkTheme?: boolean };
  const { basename } = window.meetingClientSettings.public.app;
  const file = darkTheme ? 'room_mode_illustration_dark.svg' : 'room_mode_illustration.svg';

  return (
    // The intrinsic size reserves the space before the file loads, so the text
    // under it does not jump.
    <Styled.Illustration
      src={`${basename}/resources/images/${file}`}
      width={277}
      height={156}
      alt=""
      aria-hidden
      data-test="preFlightRoomModeIllustration"
    />
  );
};

export default RoomIllustration;
