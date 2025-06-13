import React, { useEffect, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  IsBreakoutSubscriptionData,
  MEETING_ISBREAKOUT_SUBSCRIPTION,
} from './queries';
import { uniqueId } from '/imports/utils/string-utils';
import Styled from './styles';
import { User } from '/imports/ui/Types/user';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { muteUser } from './service';
import useToggleVoice from '../../../audio/audio-graphql/hooks/useToggleVoice';
import { setTalkingIndicatorList } from '/imports/ui/core/hooks/useTalkingIndicator';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { VoiceActivityResponse } from '/imports/ui/core/graphql/queries/whoIsTalking';
import useTalkingUsers from '/imports/ui/core/hooks/useTalkingUsers';
import { partition } from '/imports/utils/array-utils';
import logger from '/imports/startup/client/logger';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

const TALKING_INDICATORS_MAX = 8;

type VoiceItem = VoiceActivityResponse['user_voice_activity_stream'][number];

const intlMessages = defineMessages({
  wasTalking: {
    id: 'app.talkingIndicator.wasTalking',
    description: 'aria label for user who is not talking but still visible',
  },
  isTalking: {
    id: 'app.talkingIndicator.isTalking',
    description: 'aria label for user currently talking',
  },
  moreThanMaxIndicatorsTalking: {
    id: 'app.talkingIndicator.moreThanMaxIndicatorsTalking',
    description: 'aria label for more than max indicators talking',
  },
  moreThanMaxIndicatorsWereTalking: {
    id: 'app.talkingIndicator.moreThanMaxIndicatorsWereTalking',
    description: 'aria label for more than max indicators were talking',
  },
  muteLabel: {
    id: 'app.actionsBar.muteLabel',
    description: 'Label for mute action',
  },
  ariaMuteDesc: {
    id: 'app.talkingIndicator.ariaMuteDesc',
    description: 'Desc for mute action',
  },
});

interface TalkingIndicatorProps {
  talkingUsers: Array<VoiceActivityResponse['user_voice_activity_stream'][number]>;
  isBreakout: boolean;
  moreThanMaxIndicators: boolean;
  isModerator: boolean;
  toggleVoice: (userId: string, muted: boolean) => void;
}

const TalkingIndicator: React.FC<TalkingIndicatorProps> = ({
  talkingUsers,
  isBreakout,
  moreThanMaxIndicators,
  isModerator,
  toggleVoice,
}) => {
  const intl = useIntl();
  useEffect(() => {
    // component will unmount
    return () => {
      setTalkingIndicatorList([]);
    };
  }, []);

  const filteredTalkingUsers = talkingUsers.map((talkingUser) => {
    const {
      talking,
      muted,
      user: {
        color,
        speechLocale,
        name,
      },
      userId,
    } = talkingUser;
    return {
      talking,
      muted,
      color,
      speechLocale,
      name,
      userId,
    };
  });

  const talkingElements = useMemo(() => filteredTalkingUsers.map((talkingUser) => {
    const {
      talking,
      muted,
      color,
      speechLocale,
      name,
      userId,
    } = talkingUser;

    const ariaLabel = intl.formatMessage(talking
      ? intlMessages.isTalking : intlMessages.wasTalking, {
      userName: name,
    });
    let icon = talking ? 'unmute' : 'blank';
    icon = muted ? 'mute' : icon;
    return (
      <Styled.TalkingIndicatorWrapper
        key={userId}
        talking={talking}
        muted={muted}
      >
        {speechLocale && (
          <Styled.CCIcon
            iconName={muted ? 'closed_caption_stop' : 'closed_caption'}
            muted={muted}
            talking={talking}
          />
        )}
        <Styled.TalkingIndicatorButton
          $spoke={!talking || undefined}
          $muted={muted || undefined}
          $isViewer={!isModerator || undefined}
          key={userId}
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - call signature is misse due the function being wrapped
            muteUser(userId, muted, isBreakout, isModerator, toggleVoice);
          }}
          label={name}
          tooltipLabel={!muted && isModerator
            ? `${intl.formatMessage(intlMessages.muteLabel)} ${name}`
            : null}
          data-test={talking ? 'isTalking' : 'wasTalking'}
          aria-label={ariaLabel}
          aria-describedby={talking ? 'description' : null}
          color="primary"
          icon={icon}
          size="lg"
          style={
            isModerator
              ? {
                backgroundColor: color,
                border: `solid 2px ${color}`,
              }
              : undefined
          }
        >
          {talking ? (
            <Styled.Hidden id="description">
              {`${intl.formatMessage(intlMessages.ariaMuteDesc)}`}
            </Styled.Hidden>
          ) : null}
        </Styled.TalkingIndicatorButton>
      </Styled.TalkingIndicatorWrapper>
    );
  }), [filteredTalkingUsers]);

  const maxIndicator = () => {
    if (!moreThanMaxIndicators) return null;

    const nobodyTalking = filteredTalkingUsers.every((user) => !user.talking);

    const { moreThanMaxIndicatorsTalking, moreThanMaxIndicatorsWereTalking } = intlMessages;

    const ariaLabel = intl.formatMessage(nobodyTalking
      ? moreThanMaxIndicatorsWereTalking : moreThanMaxIndicatorsTalking, {
      userCount: filteredTalkingUsers.length,
    });

    return (
      <Styled.TalkingIndicatorButton
        $spoke={nobodyTalking}
        $muted={false}
        $isViewer={false}
        key={uniqueId('_has__More_')}
        onClick={() => { }} // maybe add a dropdown to show the rest of the users
        label="..."
        tooltipLabel={ariaLabel}
        aria-label={ariaLabel}
        color="primary"
        size="sm"
        style={
          isModerator ? {
            backgroundColor: '#4a148c',
            border: 'solid 2px #4a148c',
            cursor: 'default',
          } : undefined
        }
      />
    );
  };

  return (
    <Styled.IsTalkingWrapper data-test="talkingIndicator">
      <Styled.Speaking>
        {talkingElements}
        {maxIndicator()}
      </Styled.Speaking>
    </Styled.IsTalkingWrapper>
  );
};

const TalkingIndicatorContainer: React.FC = () => {
  const { data: currentUser } = useCurrentUser((u: Partial<User>) => ({
    userId: u?.userId,
    isModerator: u?.isModerator,
  }));

  const {
    data: isBreakoutData,
    loading: isBreakoutLoading,
    error: isBreakoutError,
  } = useDeduplicatedSubscription<IsBreakoutSubscriptionData>(MEETING_ISBREAKOUT_SUBSCRIPTION);

  const toggleVoice = useToggleVoice();
  const { data: talkingUsersData, loading: talkingUsersLoading } = useTalkingUsers();
  const talkingUsers = useMemo(() => {
    const [muted, unmuted] = partition(
      Object.values(talkingUsersData),
      (v: VoiceItem) => v.muted,
    ) as [VoiceItem[], VoiceItem[]];
    const [talking, silent] = partition(
      unmuted,
      (v: VoiceItem) => v.talking,
    ) as [VoiceItem[], VoiceItem[]];
    return [
      ...talking.sort((v1, v2) => {
        if (!v1.startTime && !v2.startTime) return 0;
        if (!v1.startTime) return 1;
        if (!v2.startTime) return -1;
        return v1.startTime - v2.startTime;
      }),
      ...silent.sort((v1, v2) => {
        if (!v1.endTime && !v2.endTime) return 0;
        if (!v1.endTime) return 1;
        if (!v2.endTime) return -1;
        return v2.endTime - v1.endTime;
      }),
      ...muted.sort((v1, v2) => {
        if (!v1.endTime && !v2.endTime) return 0;
        if (!v1.endTime) return 1;
        if (!v2.endTime) return -1;
        return v2.endTime - v1.endTime;
      }),
    ].slice(0, TALKING_INDICATORS_MAX);
  }, [talkingUsersData]);

  if (talkingUsersLoading || isBreakoutLoading) return null;

  if (isBreakoutError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: isBreakoutError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  const isBreakout = isBreakoutData?.meeting[0]?.isBreakout ?? false;
  setTalkingIndicatorList(talkingUsers.map(({ user, ...rest }) => ({ ...rest, ...user })));
  return (
    <TalkingIndicator
      talkingUsers={talkingUsers}
      isBreakout={isBreakout}
      moreThanMaxIndicators={talkingUsers.length >= TALKING_INDICATORS_MAX}
      isModerator={currentUser?.isModerator ?? false}
      toggleVoice={toggleVoice}
    />
  );
};

export default TalkingIndicatorContainer;
