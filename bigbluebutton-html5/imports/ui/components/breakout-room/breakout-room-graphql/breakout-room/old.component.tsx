import React, { useCallback, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { layoutDispatch, layoutSelect } from '../../../layout/context';
import { PANELS, ACTIONS } from '../../../layout/enums';
import { Layout } from '../../../layout/layoutTypes';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Header from '/imports/ui/components/common/control-header/component';
import Styled from './style';
import {
  endAllBreakouts,
  finishScreenShare,
  forceExitAudio,
  getIsConnected,
  getIsMicrophoneUser,
} from './service';
import BreakoutDropdown from '../breakout-room-dropdown/component';
import BreakoutRoomMessageForm from '../breakout-room-message-form/component';
import { useSubscription } from '@apollo/client';
import { BreakoutRoom, GetBreakoutDataResponse, getBreakoutData } from './queries';
import logger from '/imports/startup/client/logger';

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

interface BreakoutRoomPanelProps {
  layoutContextDispatch: (params:{
    type: string,
    value: string | boolean,
  }) => void;
  isModerator: boolean;
  isPresenter: boolean;
  isRTL: boolean;
  breakouts: BreakoutRoom[];
}

const BreakoutRoomPanel: React.FC<BreakoutRoomPanelProps> = ({
  layoutContextDispatch,
  isModerator,
  isPresenter,
  isRTL,
  breakouts,
}) => {
  const intl = useIntl();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [openBreakoutTimeManager, setOpenBreakoutTimeManager] = React.useState(false);
  const [waiting, setWaiting] = React.useState(false);
  const [requestedBreakoutId, setRequestedBreakoutId] = React.useState('');
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

  const renderUserActions = useCallback((
    breakoutRoomId: string,
    participants: Array<{
      userId: string,
      name: string,
      nameSortable: string,
    }>,
    shortName: string,
  ) => {
    const breakout = breakouts.find((b) => b.breakoutRoomId === breakoutRoomId);
    const dataTest = `${breakout?.joinURL ? 'join' : 'askToJoin'}${shortName.replace(' ', '')}`;
    return (
      <Styled.BreakoutActions
        id="tainan"
        data-test="felipe"
      >
        {
          breakouts
            .filter((a) => a.currentRoomJoined)
            .length > 0 ?
            (
              <Styled.AlreadyConnected

              data-test="alreadyConnected">
                {intl.formatMessage(intlMessages.alreadyConnected)}
              </Styled.AlreadyConnected>
            ) : (
              <Styled.JoinButton
                label={breakout?.joinURL
                  ? intl.formatMessage(intlMessages.breakoutJoin)
                  : intl.formatMessage(intlMessages.askToJoin)}
                data-test={dataTest}
                aria-label={`${
                  breakout?.joinURL
                    ? intl.formatMessage(intlMessages.breakoutJoin)
                    : intl.formatMessage(intlMessages.askToJoin)} ${shortName}`}
                onClick={() => {
                  forceExitAudio();
                  logger.info({
                    logCode: 'breakoutroom_join',
                    extraInfo: { logType: 'user_action' },
                  }, 'joining breakout room closed audio in the main room');
                  if (isPresenter) finishScreenShare();
                }}
              />
            )
        }
      </Styled.BreakoutActions>
    )
  },
    [
    waiting,
    requestedBreakoutId,
  ]);


  const rooms = useMemo(()=>{
    const roomItems = breakouts.map((breakout) => {
      return (
        <Styled.BreakoutItems key={`breakoutRoomItems-${breakout.breakoutRoomId}`}>
        <Styled.Content key={`breakoutRoomList-${breakout.breakoutRoomId}`}>
          <Styled.BreakoutRoomListNameLabel data-test={breakout.shortName} aria-hidden>
            {breakout.isDefaultName
              ? intl.formatMessage(intlMessages.breakoutRoom, { 0: breakout.sequence })
              : breakout.shortName}
            <Styled.UsersAssignedNumberLabel>
              (
              {breakout.participants.length}
              )
            </Styled.UsersAssignedNumberLabel>
          </Styled.BreakoutRoomListNameLabel>
          {waiting && requestedBreakoutId === breakout.breakoutRoomId ? (
            <span>
              {intl.formatMessage(intlMessages.generatingURL)}
              <Styled.ConnectingAnimation animations />
            </span>
          ) : renderUserActions(
            breakout.breakoutRoomId,
            breakout.participants,
            breakout.shortName,
          )}
        </Styled.Content>
          <Styled.JoinedUserNames
            data-test={`userNameBreakoutRoom-${breakout.shortName}`}
          >
            {breakout.participants
              .sort((a, b) => {
                const aName = a.user.nameSortable;
                const bName = b.user.nameSortable;
                if (aName < bName) {
                  return -1;
                }
                if (aName > bName) {
                  return 1;
                }
                return 0;
              })
              .map((u) => u.user.name)
              .join(', ')}
          </Styled.JoinedUserNames>
        </Styled.BreakoutItems>
      );
    });

    return (
      <Styled.BreakoutColumn>
        <Styled.BreakoutScrollableList data-test="breakoutRoomList">
          {roomItems}
        </Styled.BreakoutScrollableList>
      </Styled.BreakoutColumn>
    );
  },[breakouts]);

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
          onClick: () => {
            closePanel();
          },
        }}
        customRightButton={isModerator && (
          <BreakoutDropdown
            openBreakoutTimeManager={() => {
              setOpenBreakoutTimeManager(true);
            }}
            endAllBreakouts={() => {
              closePanel();
              endAllBreakouts();
            }}
            isMeteorConnected={getIsConnected()}
            amIModerator={isModerator}
            isRTL={isRTL}
          />
        )}
      />
      {isModerator
        ? (
          <BreakoutRoomMessageForm
            {...{
              title: intl.formatMessage(intlMessages.chatTitleMsgAllRooms),
            }}
            chatId="breakouts"
            chatTitle={intl.formatMessage(intlMessages.chatTitleMsgAllRooms)}
            disabled={!getIsConnected()}
            connected={getIsConnected()}
            locked={false}
          />
        ) : null}
      {isModerator ? <Styled.Separator /> : null }

    </Styled.Panel>
  );
};

const BreakoutRoomPanelContainer: React.FC = () => {
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);

  const {
    data: currentUser,
    loading: currentUserLoading,
  } = useCurrentUser((u) => {
    return {
      presenter: u.presenter,
      isModerator: u.isModerator,
    };
  });

  const {
    data: breakoutData,
    loading: breakoutDataLoading,
    error: breakoutDataError,
  } = useSubscription<GetBreakoutDataResponse>(getBreakoutData);

  const isMicrophoneUser = getIsMicrophoneUser();

  if (currentUserLoading || breakoutDataLoading) return null;
  if (!currentUser) return null;
  return (
    <BreakoutRoomPanel
      layoutContextDispatch={layoutContextDispatch}
      isModerator={currentUser.isModerator ?? false}
      isPresenter={currentUser.presenter ?? false}
      isRTL={isRTL}
      breakouts={breakoutData?.breakoutRooms ?? []}
    />
  );
};

export default BreakoutRoomPanelContainer;
