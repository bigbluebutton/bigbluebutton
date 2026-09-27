import React, { useEffect, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { isEqual } from 'radash';
import Auth from '/imports/ui/services/auth/index';
import Styled from './styles';
import { User } from '/imports/ui/Types/user';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { muteUser } from './service';
import useToggleVoice from '../../../audio/audio-graphql/hooks/useToggleVoice';
import { setTalkingIndicatorList } from '/imports/ui/core/hooks/useTalkingIndicator';
import useTalkingUsers from '/imports/ui/core/hooks/useTalkingUsers';
import { partition } from '/imports/utils/array-utils';

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
  hiddenUser: {
    id: 'app.talkingIndicator.hiddenUser',
    description: 'stands in for the name of a speaker this viewer may not identify',
  },
});

interface TalkingIndicatorProps {
  talkingUsers: Omit<TalkingIndicatorItemProps, 'isModerator' | 'toggleVoice'>[];
  moreThanMaxIndicators: boolean;
  isModerator: boolean;
  toggleVoice: (userId: string, muted: boolean) => void;
}

interface TalkingIndicatorItemProps {
  talking: boolean;
  muted: boolean;
  color?: string;
  speechLocale?: string;
  name: string;
  role?: string;
  userId: string;
  isModerator: boolean;
  toggleVoice: (userId: string, muted: boolean) => void;
}

interface TalkingIndicatorOverflowProps {
  nobodyTalking: boolean;
  userCount: number;
}

const TalkingIndicatorItem: React.FC<TalkingIndicatorItemProps> = ({
  talking,
  muted,
  color,
  speechLocale,
  name,
  role,
  userId,
  isModerator,
  toggleVoice,
}) => {
  const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;
  const intl = useIntl();
  const isYou = userId === Auth.userID;
  const isTalkingUserMod = role === ROLE_MODERATOR;
  const isMuteActionAvailable = isModerator;

  const ariaLabel = intl.formatMessage(talking
    ? intlMessages.isTalking : intlMessages.wasTalking, {
    userName: name,
  });
  let icon = talking ? 'unmute' : 'blank';
  icon = muted ? 'mute' : icon;
  return (
    <Styled.TalkingIndicatorWrapper
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
        $isViewer={!isMuteActionAvailable || undefined}
        $talkingUserIsViewer={!isTalkingUserMod && !isYou}
        $you={isYou}
        $moderator={isTalkingUserMod}
        key={userId}
        onClick={() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - call signature is misse due the function being wrapped
          muteUser(userId, muted, isMuteActionAvailable, toggleVoice);
        }}
        label={name}
        tooltipLabel={!muted && isMuteActionAvailable
          ? `${intl.formatMessage(intlMessages.muteLabel)} ${name}`
          : null}
        data-test={talking ? 'isTalking' : 'wasTalking'}
        aria-label={ariaLabel}
        aria-describedby={talking ? 'description' : null}
        color="primary"
        icon={icon}
        size="lg"
        style={
          (isMuteActionAvailable && color)
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
};

// Memoized per user: the list re-renders on every talking change of anyone.
const MemoizedTalkingIndicatorItem = React.memo(TalkingIndicatorItem);

const TalkingIndicatorOverflow: React.FC<TalkingIndicatorOverflowProps> = ({
  nobodyTalking,
  userCount,
}) => {
  const intl = useIntl();
  const { moreThanMaxIndicatorsTalking, moreThanMaxIndicatorsWereTalking } = intlMessages;

  const ariaLabel = intl.formatMessage(nobodyTalking
    ? moreThanMaxIndicatorsWereTalking : moreThanMaxIndicatorsTalking, {
    userCount,
  });

  return (
    <Styled.TalkingIndicatorButton
      $spoke={nobodyTalking}
      $muted={false}
      $you={false}
      $talkingUserIsViewer
      onClick={() => { }} // maybe add a dropdown to show the rest of the users
      label="..."
      tooltipLabel={ariaLabel}
      aria-label={ariaLabel}
      color="primary"
      size="sm"
    />
  );
};

const MemoizedTalkingIndicatorOverflow = React.memo(TalkingIndicatorOverflow);

const TalkingIndicator: React.FC<TalkingIndicatorProps> = ({
  talkingUsers,
  moreThanMaxIndicators,
  isModerator,
  toggleVoice,
}) => {
  const talkingElements = talkingUsers.map((talkingUser) => (
    <MemoizedTalkingIndicatorItem
      key={talkingUser.userId}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...talkingUser}
      isModerator={isModerator}
      toggleVoice={toggleVoice}
    />
  ));

  return (
    <Styled.IsTalkingWrapper data-test="talkingIndicator">
      <Styled.Speaking>
        {talkingElements}
        {moreThanMaxIndicators ? (
          <MemoizedTalkingIndicatorOverflow
            key="_has__More_"
            nobodyTalking={talkingUsers.every((user) => !user.talking)}
            userCount={talkingUsers.length}
          />
        ) : null}
      </Styled.Speaking>
    </Styled.IsTalkingWrapper>
  );
};

// Deep-compared: the container rebuilds the list on every render, and most of
// those renders leave it unchanged.
const MemoizedTalkingIndicator = React.memo(TalkingIndicator, isEqual);

const TalkingIndicatorContainer: React.FC = () => {
  const intl = useIntl();
  const { data: currentUser } = useCurrentUser((u: Partial<User>) => ({
    userId: u?.userId,
    isModerator: u?.isModerator,
  }));

  const toggleVoice = useToggleVoice();
  const { data: talkingUsersData, loading: talkingUsersLoading } = useTalkingUsers();
  const talkingUsers = useMemo(() => {
    const [muted, unmuted] = partition(
      Object.values(talkingUsersData),
      (v) => v.muted,
    );
    const [talking, silent] = partition(
      unmuted,
      (v) => v.talking,
    );
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

  useEffect(() => {
    setTalkingIndicatorList(talkingUsersLoading
      ? []
      : talkingUsers.map(({ user, ...rest }) => ({ ...rest, ...user })));
  }, [talkingUsers, talkingUsersLoading]);

  useEffect(() => () => setTalkingIndicatorList([]), []);

  if (talkingUsersLoading) return null;

  const indicatorUsers = talkingUsers.map(({
    talking,
    muted,
    userId,
    user: {
      color,
      speechLocale,
      name,
      role,
      hidden,
    },
  }) => ({
    talking,
    muted,
    color,
    speechLocale,
    // A hidden user is one whose identity this viewer is not entitled to. The indicator
    // still shows that someone is speaking - they are audible either way - under a
    // placeholder that stands in for the name everywhere it would have been rendered.
    name: hidden ? intl.formatMessage(intlMessages.hiddenUser) : name,
    role,
    userId,
  }));

  return (
    <MemoizedTalkingIndicator
      talkingUsers={indicatorUsers}
      moreThanMaxIndicators={talkingUsers.length >= TALKING_INDICATORS_MAX}
      isModerator={currentUser?.isModerator ?? false}
      toggleVoice={toggleVoice}
    />
  );
};

export default TalkingIndicatorContainer;
