import { useMutation, useSubscription } from '@apollo/client';
import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { BreakoutRoom, GetBreakoutDataResponse, getBreakoutData } from './queries';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Header from '/imports/ui/components/common/control-header/component';
import Styled from './styles';
import { layoutDispatch, layoutSelect } from '../../../layout/context';
import { ACTIONS, PANELS } from '../../../layout/enums';
import { Layout } from '../../../layout/layoutTypes';
import BreakoutDropdown from '../breakout-room-dropdown/component';
import { BREAKOUT_ROOM_END_ALL } from '../../mutations';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import TimeRemaingPanel from './components/timeRemaining';

interface BreakoutRoomProps {
  breakouts: BreakoutRoom[];
  isModerator: boolean;
  presenter: boolean;
  durationInSeconds: number;
}

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
  breakoutAriaTitle: {
    id: 'app.createBreakoutRoom.ariaTitle',
    description: 'breakout aria title',
  },
  breakoutDuration: {
    id: 'app.createBreakoutRoom.duration',
    description: 'breakout duration time',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  breakoutJoin: {
    id: 'app.createBreakoutRoom.join',
    description: 'label for join breakout room',
  },
  breakoutJoinAudio: {
    id: 'app.createBreakoutRoom.joinAudio',
    description: 'label for option to transfer audio',
  },
  breakoutReturnAudio: {
    id: 'app.createBreakoutRoom.returnAudio',
    description: 'label for option to return audio',
  },
  askToJoin: {
    id: 'app.createBreakoutRoom.askToJoin',
    description: 'label for generate breakout room url',
  },
  generatingURL: {
    id: 'app.createBreakoutRoom.generatingURL',
    description: 'label for generating breakout room url',
  },
  endAllBreakouts: {
    id: 'app.createBreakoutRoom.endAllBreakouts',
    description: 'Button label to end all breakout rooms',
  },
  chatTitleMsgAllRooms: {
    id: 'app.createBreakoutRoom.chatTitleMsgAllRooms',
    description: 'chat title for send message to all rooms',
  },
  alreadyConnected: {
    id: 'app.createBreakoutRoom.alreadyConnected',
    description: 'label for the user that is already connected to breakout room',
  },
  setTimeInMinutes: {
    id: 'app.createBreakoutRoom.setTimeInMinutes',
    description: 'Label for input to set time (minutes)',
  },
  setTimeLabel: {
    id: 'app.createBreakoutRoom.setTimeLabel',
    description: 'Button label to set breakout rooms time',
  },
  setTimeCancel: {
    id: 'app.createBreakoutRoom.setTimeCancel',
    description: 'Button label to cancel set breakout rooms time',
  },
  setTimeHigherThanMeetingTimeError: {
    id: 'app.createBreakoutRoom.setTimeHigherThanMeetingTimeError',
    description: 'Label for error when new breakout rooms time would be higher than remaining time in parent meeting',
  },
});

const BreakoutRoom: React.FC<BreakoutRoomProps> = ({
  breakouts,
  isModerator,
  presenter,
  durationInSeconds,
}) => {
  const [breakoutRoomEndAll] = useMutation(BREAKOUT_ROOM_END_ALL);

  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const intl = useIntl();

  const panelRef = React.useRef<HTMLDivElement>(null);
  const [showChangeTimeForm, setShowChangeTimeForm] = React.useState(false);


  const closePanel = useCallback(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  }, []);

  return (
    <Styled.Panel
      ref={panelRef}
      onCopy={(e) => {
        e.preventDefault();
      }}
    >
      <Header
        leftButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.breakoutAriaTitle),
          label: intl.formatMessage(intlMessages.breakoutTitle),
          onClick: closePanel,
        }}
        customRightButton={isModerator && (
          <BreakoutDropdown
            openBreakoutTimeManager={() => setShowChangeTimeForm(true)}
            endAllBreakouts={() => {
              closePanel();
              breakoutRoomEndAll();
            }}
            isMeteorConnected
            amIModerator={isModerator}
            isRTL={isRTL}
          />
        )}
      />
      <TimeRemaingPanel
        showChangeTimeForm={showChangeTimeForm}
        isModerator={isModerator}
        breakout={breakouts[0]}
        durationInSeconds={durationInSeconds}
        toggleShowChangeTimeForm={setShowChangeTimeForm}
      />
    </Styled.Panel>
  );
};

const BreakoutRoomContainer: React.FC = () => {
  const {
    data: meetingData,
    loading: meetingLoading,
  } = useMeeting((m) => ({
    durationInSeconds: m.durationInSeconds,
  }));

  const {
    data: currentUserData,
    loading: currentUserLoading,
  } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
    presenter: u.presenter,
  }));

  const {
    data: breakoutData,
    loading: breakoutLoading,
    error: breakoutError,
  } = useSubscription<GetBreakoutDataResponse>(getBreakoutData);
  if (breakoutLoading || currentUserLoading) return null;

  if (breakoutError) {
    logger.error(breakoutError);
    return (
      <div>
        Error:
        {JSON.stringify(breakoutError)}
      </div>
    );
  }

  if (!currentUserData || !breakoutData || !meetingData) return null; // or loading spinner or error
  return (
    <BreakoutRoom
      breakouts={breakoutData.breakoutRoom || []}
      isModerator={currentUserData.isModerator ?? false}
      presenter={currentUserData.presenter ?? false}
      durationInSeconds={meetingData.durationInSeconds ?? 0}
    />
  );
};

export default BreakoutRoomContainer;
