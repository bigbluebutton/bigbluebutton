import React, { useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import getSettingsSingletonInstance from '/imports/ui/services/settings';
import { EMOJI_BOOM_SUBSCRIPTION } from './queries';
import type { EmojiBoomStream } from './types';
import EmojiBoomComponent from './component';

const REACTIONS_BUTTON_ID = 'interactionsButton';

interface EmojiBoomContainerProps {
  /**
   * The source HTMLElement id from which the emojis will show up.
   * If not provided, defaults to the reactions button.
   */
  sourceId?: string;

  userId?: string;
}

const EmojiBoomContainer: React.FC<EmojiBoomContainerProps> = ({ sourceId = REACTIONS_BUTTON_ID, userId }) => {
  const [cursor, setCursor] = useState<string | null>(null);

  const Settings = getSettingsSingletonInstance();
  const { animations } = useReactiveVar(Settings.applicationVar) as { animations: boolean};

  useEffect(() => {
    if (animations) {
      setCursor(new Date().toISOString());
    }
  }, [animations]);

  const REACTION_CONFIG = window.meetingClientSettings.public.app.reactionsAnimation;
  const {
    emojiSize: EMOJI_SIZE,
    numberOfEmojis: NUMBER_OF_EMOJIS,
    enabled: ANIMATION_ENABLED,
  } = REACTION_CONFIG;

  const skip = !animations || !ANIMATION_ENABLED || !cursor;

  const { data, error } = useDeduplicatedSubscription<EmojiBoomStream>(EMOJI_BOOM_SUBSCRIPTION, {
    skip,
    variables: {
      initialCursor: cursor,
    },
  });

  if (error) {
    logger.warn({
      logCode: 'user_reaction_stream_error',
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, 'Streaming user reactions failed');
  }

  if (skip) return null;

  return (
    <EmojiBoomComponent
      reactions={data?.user_reaction_stream ?? null}
      userId={userId}
      emojiSize={EMOJI_SIZE}
      numberOfEmojis={NUMBER_OF_EMOJIS}
      sourceId={sourceId}
    />
  );
};

export default EmojiBoomContainer;
