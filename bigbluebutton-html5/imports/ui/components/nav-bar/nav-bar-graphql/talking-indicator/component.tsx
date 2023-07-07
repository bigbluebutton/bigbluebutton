import { useSubscription } from '@apollo/client';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  IsBreakoutSubscriptionData,
  MEETING_ISBREAKOUT_SUBSCRIPTION,
  TALKING_INDICATOR_SUBSCRIPTION,
  TalkingIndicatorSubscriptionData
} from './queries';
import { UserVoice } from '/imports/ui/Types/userVoice';
import { uniqueId } from '/imports/utils/string-utils';
import Styled from './styles';
import { User } from '/imports/ui/Types/user';
import { useCurrentUser } from '/imports/ui/core/hooks/useCurrentUser';
import { muteUser } from './service';

const APP_CONFIG = Meteor.settings.public.app;
const { enableTalkingIndicator } = APP_CONFIG;

const TALKING_INDICATORS_MAX = 8;

const intlMessages = defineMessages({
  wasTalking: {
    id: 'app.talkingIndicator.wasTalking',
    description: 'aria label for user who is not talking but still visible',
  },
  isTalking: {
    id: 'app.talkingIndicator.isTalking',
    description: 'aria label for user currently talking',
  },
  ariaMuteDesc: {
    id: 'app.talkingIndicator.ariaMuteDesc',
    description: 'aria description for muting a user',
  },
  muteLabel: {
    id: 'app.actionsBar.muteLabel',
    description: 'indicator mute label for moderators',
  },
  moreThanMaxIndicatorsTalking: {
    id: 'app.talkingIndicator.moreThanMaxIndicatorsTalking',
    description: 'indicator label for all users who is talking but not visible',
  },
  moreThanMaxIndicatorsWereTalking: {
    id: 'app.talkingIndicator.moreThanMaxIndicatorsWereTalking',
    description: 'indicator label for all users who is not talking but not visible',
  },
});


interface TalkingIndicatorProps {
  talkingUsers: Array<Partial<UserVoice>>;
  isBreakout: boolean;
  moreThanMaxIndicators: boolean;
  isModerator: boolean;
};

const TalkingIndicator: React.FC<TalkingIndicatorProps> = ({
  talkingUsers,
  isBreakout,
  moreThanMaxIndicators,
  isModerator,
}) => {
  const intl = useIntl();
  const talkingElements = useMemo(() => {
    return talkingUsers.map((user, index) => {
      const {
        talking,
        muted,
        userId,
        user: { color, speechLocale },
        // transcribing,
      } = user;

      const name = user.user?.name;
      const ariaLabel = intl.formatMessage(talking
        ? intlMessages.isTalking : intlMessages.wasTalking, {
        0: name,
      });
      let icon = talking ? 'unmute' : 'blank';
      icon = muted ? 'mute' : icon;
      return (
        <Styled.TalkingIndicatorWrapper
          key={uniqueId(`${name}-`)}
          talking={talking}
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
            $muted={muted}
            $isViewer={!isModerator || undefined}
            key={uniqueId(`${name}-`)}
            onClick={() => muteUser(userId, muted, isBreakout, isModerator)}
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
            style={{
              backgroundColor: color,
              border: `solid 2px ${color}`,
            }}
          >
            {talking ? (
              <Styled.Hidden id="description">
                {`${intl.formatMessage(intlMessages.ariaMuteDesc)}`}
              </Styled.Hidden>
            ) : null}
          </Styled.TalkingIndicatorButton>
        </Styled.TalkingIndicatorWrapper>
      );
    });
  }, [talkingUsers]);

  const maxIndicator = () => {
    if (!moreThanMaxIndicators) return null;

    const nobodyTalking = talkingUsers.every((user) => !user.talking);

    const { moreThanMaxIndicatorsTalking, moreThanMaxIndicatorsWereTalking } = intlMessages;

    const ariaLabel = intl.formatMessage(nobodyTalking
      ? moreThanMaxIndicatorsWereTalking : moreThanMaxIndicatorsTalking, {
      0: talkingUsers.length,
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
        style={{
          backgroundColor: '#4a148c',
          border: 'solid 2px #4a148c',
          cursor: 'default',
        }}
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



const TalkingIndicatorContainer: React.FC = (() => {
  if (!enableTalkingIndicator) return () => null;
  return () => {
    const curentUser: Partial<User> = useCurrentUser((u: Partial<User>) => {
      return {
        userId: u?.userId,
        isModerator: u?.isModerator,
      }
    });
    const {
      data: talkingIndicatorData,
      loading: talkingIndicatorLoading,
      error: talkingIndicatorError
    } = useSubscription<TalkingIndicatorSubscriptionData>(
      TALKING_INDICATOR_SUBSCRIPTION,
      {
        variables: {
          limit: TALKING_INDICATORS_MAX,
        }
      }
    );

    const {
      data: isBreakoutData,
      loading: isBreakoutLoading,
      error: isBreakoutError
    } = useSubscription<IsBreakoutSubscriptionData>(MEETING_ISBREAKOUT_SUBSCRIPTION);

    if (talkingIndicatorLoading) return null;
    if (talkingIndicatorError) return (<div>error: {JSON.stringify(talkingIndicatorError)}</div>);

    if (isBreakoutLoading) return null;
    if (isBreakoutError) return (<div>error: {JSON.stringify(talkingIndicatorError)}</div>);

    const talkingUsers = talkingIndicatorData?.user_voice ?? [];
    const isBreakout = isBreakoutData?.meeting[0]?.isBreakout ?? false;


    return (<TalkingIndicator
      talkingUsers={talkingUsers}
      isBreakout={isBreakout}
      moreThanMaxIndicators={talkingUsers.length >= TALKING_INDICATORS_MAX}
      isModerator={curentUser?.isModerator ?? false}
    />);
  }
})();

export default TalkingIndicatorContainer;