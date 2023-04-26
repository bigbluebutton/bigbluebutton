import React, { PureComponent, useContext } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import Service from './service';
import { uniqueId } from '/imports/utils/string-utils';
import { Meteor } from 'meteor/meteor';
import { useSubscription } from '@apollo/client';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { User } from '/imports/ui/Types/user';
import VoiceUsers from '/imports/api/voice-users';
import {
  USER_IS_TALKING_SUBSCRIPTION,
} from '../queries';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users';
import Auth from '/imports/ui/services/auth';
import { debounce } from 'radash';
import TalkingIndicator from './component';
import { makeCall } from '/imports/ui/services/api';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { layoutSelectInput, layoutDispatch } from '../../layout/context';
import SpeechService from '/imports/ui/components/audio/captions/speech/service';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

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
  talkingUsers: Array<User>;
  amIModerator: boolean;
  isTalking: boolean;
  users: object;
  muted: boolean;
  transcribing: boolean,
  floor: number;
  color:number;
  Intl: object;
  error: string;
}
const NAVBAR_CONFIG = Meteor.settings.public.app;
const TALKIN_INDICATOR_ENABLED = NAVBAR_CONFIG.enableTalkingIndicator;
const MAX_NUMBER_OF_SPEAKERS = 8;

const TalkingIndicator:
React.FC<TalkingIndicatorProps> = ({
  talkingUsers,
  isTalking,
  Intl,
  error,
}) => {
  if (!isTalking || !talkingUsers) return null;

  const talkingUserElements = Object.keys(talkingUsers).map((id) => {
    const {
      isTalking,
      color,
      transcribing,
      floor,
      muted,
      callerName,
    } = talkingUsers[id];

    const user = users[id];
    
    const name =user?.name ?? callerName;

    const ariaLabel = intl.formatMessages(isTalking ? intlMessages.isTalking
      : intlMessages.wasTalking, {
        0: name,
      });

      let icon = isTalking ? 'unmute' : 'blank';
      icon = muted ? 'mute' : icon;

      return (
        <Styled.TalkingIndicatorWrapper
        key={user.id(name)}
        muted={muted}
        isTalking={isTalking}
        floor={floor}
        >
        {transcribing && (
          <Styled.CCIcon 
            iconName={muted ? 'closed_caption_stop' : 'closed_caption'}
            muted={muted}
            isTalking={isTalking}
            />
        )}
        <Styled.TalkingIndicatorButton
        $spoke={!isTalking || undefined}
        $mute={muted}
        $isViewer={!amIModerator || undefined}
        key={user.id(name)}
        onClick={() => this.handleMuteUser(id)}
        label={name}
        tooltipLabel={!muted && amIModerator
        ? `${intl.formatMessage(intlMessages.muteLabel)} ${name}`
        : null}
        data-test={isTalking ? 'isTalking' : 'wasTalking'}
        aria-label={ariaLabel}
        aria-describedby={isTalking? 'description' : null}
        color={'primary'}
        icon={icon}
        size="lg"
        style={{
          backgroundColor: color,
          border: `solid 2px ${color}`,
        }}
        >
          {isTalking ? (
            <Styled.Hidden id='description'>
              {`${intl.formatMessage(intlMessages.ariaMuteDesc)}`}
            </Styled.Hidden>
          ) : null}
          </Styled.TalkingIndicatorButton>   
        </Styled.TalkingIndicatorWrapper>
      );
  });

  const maxIndicator = () => {
    if (!moreThanMaxIndicators) return null;

    const nobodyTalking = Service.nobodyTaslking(talkingUsers);

    const { moreThanMaxIndicatorsTalking, moreThanMaxIndicatorsWereTalking } = intlMessages;

    const ariaLabel = intl.formatMessage(nobodyTalking
      ? moreThanMaxIndicatorsWereTalking : moreThanMaxIndicatorsTalking, {
      0: Object.keys(talkingUsers).length,
    });

    return (
      <Styled.TalkingIndicatorButton 
        $spoke={nobodyTalking}
        $muted={false}
        $isViewer={false}
        key={uniqueId('_has_More')}
        onClick={() => {}}
        label='...'
        tooltipLabel={ariaLabel}
        aria-label={ariaLabel}
        color='primary'
        size='sm'
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
        {talkingUserElements}
        {maxIndicator()}
      </Styled.Speaking>
    </Styled.IsTalkingWrapper>
  );
}

const TalkingIndicatorContainer: React.FC = ({ userId, IsTalkingIn, error }) => {
  const TalkingIndicatorContainer = () => {
    const usersContextHandler = useContext(UsersContext);
    const { users } = usersContextHandler;

    if (!TALKIN_INDICATOR_ENABLED) return null;

    const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
    const { sidebarContentPanel } = sidebarContent;
    const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
    const { sidebarNavPanel } = sidebarNavigation;
    const layoutContextDispatch = layoutDispatch();

  }

  const {
    data: talkingUsersData,
  } = useSubscription(USER_IS_TALKING_SUBSCRIPTION, {
    variables: {
      userId,
      chatId: IsTalkingIn,
    }
  });

  const talkingUsers = talkingUsersData?.user_talking_public || [];

  const talkingUsersArray = talkingUsers.map(user => user.user);

  return <TalkingIndicator
  talkingUsers={talkingUsersArray}
  indicatorEnabled={USER_IS_TALKING_SUBSCRIPTION}
  intl={Intl}
  error={error}
/>
return {
  moreThanMaxIndicators: talkingUsers.length > MAX_NUMBER_OF_SPEAKERS,

}
};
export default TalkingIndicatorContainer;

