import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import PadContainer from '/imports/ui/components/pads/pads-graphql/component';
import browserInfo from '/imports/utils/browserInfo';
import Header from '/imports/ui/components/common/control-header/component';
import NotesDropdown from './notes-dropdown/component';
import {
  PANELS, ACTIONS,
} from '/imports/ui/components/layout/enums';
import {
  layoutSelectInput,
  layoutDispatch,
  layoutSelectOutput,
  layoutSelect,
} from '/imports/ui/components/layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useHasPermission from './hooks/useHasPermission';
import Styled from './styles';
import { PIN_NOTES } from './mutations';
import { EXTERNAL_VIDEO_STOP } from '/imports/ui/components/external-video-player/mutations';
import {
  screenshareHasEnded,
  useIsScreenBroadcasting,
} from '/imports/ui/components/screenshare/service';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useNotesLastRead from './hooks/useNotesLastRead';
import {
  Layout,
  SharedNotes,
  Output,
  Input,
  DispatcherFunction,
} from '/imports/ui/components/layout/layoutTypes';
import { NotesRenderMode, sidebarContentToIgnoreDelay } from './constants';
import { NotesRenderModeType } from './types';
import { NOTES_ID, NOTES_UNMOUNT_DELAY } from './service';

const intlMessages = defineMessages({
  hide: {
    id: 'app.notes.hide',
    description: 'Label for hiding shared notes button',
  },
  title: {
    id: 'app.notes.title',
    description: 'Title for the shared notes',
  },
  unpinNotes: {
    id: 'app.notes.notesDropdown.unpinNotes',
    description: 'Label for unpin shared notes button',
  },
});

interface NotesContainerGraphqlProps {
  renderMode: NotesRenderModeType;
  isVisible: boolean;
}

interface NotesGraphqlProps {
  isOnMediaArea: boolean;
  isVisible: boolean;
  hasPermission: boolean;
  layoutContextDispatch: DispatcherFunction;
  isResizing: boolean;
  isLocalChange: boolean;
  sharedNotesOutput: SharedNotes;
  amIPresenter: boolean;
  ignoreDelayforUnmount: boolean;
  isRTL: boolean;
  handlePinSharedNotes: (pinned: boolean) => void;
}

const NotesGraphql: React.FC<NotesGraphqlProps> = (props) => {
  const {
    isOnMediaArea,
    isVisible,
    hasPermission,
    layoutContextDispatch,
    isResizing,
    isLocalChange,
    sharedNotesOutput,
    amIPresenter,
    ignoreDelayforUnmount,
    isRTL,
    handlePinSharedNotes,
  } = props;
  const [shouldRenderNotes, setShouldRenderNotes] = useState(isVisible);
  const intl = useIntl();
  const { markNotesAsRead } = useNotesLastRead();
  const { isChrome } = browserInfo;

  const isHidden = (isOnMediaArea && (sharedNotesOutput.width === 0 || sharedNotesOutput.height === 0))
    || (!isVisible && !ignoreDelayforUnmount);

  let timeoutRef: NodeJS.Timeout | undefined;
  useEffect(() => {
    if (isVisible) {
      setShouldRenderNotes(true);
      clearTimeout(timeoutRef!);
    } else {
      markNotesAsRead();
      if (ignoreDelayforUnmount) {
        setShouldRenderNotes(false);
      } else {
        timeoutRef = setTimeout(() => {
          setShouldRenderNotes(false);
        }, NOTES_UNMOUNT_DELAY());
      }
    }
    return () => clearTimeout(timeoutRef!);
  }, [isVisible]);

  const renderHeaderOnMedia = () => {
    return amIPresenter ? (
      <Styled.Header
        rightButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.unpinNotes),
          'data-test': 'unpinNotes',
          icon: 'close',
          label: intl.formatMessage(intlMessages.unpinNotes),
          onClick: () => {
            handlePinSharedNotes(false);
          },
        }}
      />
    ) : null;
  };

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    display,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isPinned,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    browserHeight,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    browserWidth,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tabOrder,
    ...cssProps
  } = sharedNotesOutput;

  return shouldRenderNotes && (
    <Styled.Notes
      data-test="notes"
      isOnMediaArea={isOnMediaArea}
      isHidden={isHidden}
      isChrome={isChrome}
      style={isOnMediaArea ? cssProps : {}}
    >
      {!isOnMediaArea ? (
        <>
          <h2 className="sr-only">{intl.formatMessage(intlMessages.title)}</h2>
          <Header
            leftButtonProps={{
              onClick: () => {
                layoutContextDispatch({
                  type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                  value: false,
                });
                layoutContextDispatch({
                  type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                  value: PANELS.NONE,
                });
              },
              'data-test': 'hideNotesLabel',
              'aria-label': intl.formatMessage(intlMessages.hide),
              label: intl.formatMessage(intlMessages.title),
            }}
            data-test="notesHeader"
            rightButtonProps={null}
            customRightButton={
              <NotesDropdown handlePinSharedNotes={handlePinSharedNotes} />
            }
          />
        </>
      ) : renderHeaderOnMedia()}
      <PadContainer
        isOnMediaArea={isOnMediaArea}
        externalId={NOTES_ID()}
        hasPermission={hasPermission}
        isResizing={isResizing}
        isRTL={isRTL}
      />
    </Styled.Notes>
  );
};

const NotesContainerGraphql: React.FC<NotesContainerGraphqlProps> = (props) => {
  const { renderMode, isVisible = true } = props;

  const hasPermission = useHasPermission();

  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));

  const cameraDock = layoutSelectInput((i: Input) => i.cameraDock);
  const sharedNotesOutput = layoutSelectOutput((i: Output) => i.sharedNotes);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { isResizing, isLocalChange } = cameraDock;
  const layoutContextDispatch = layoutDispatch();
  const amIPresenter = !!currentUserData?.presenter;

  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const { isOpen: isSidebarContentOpen } = sidebarContent;
  const isOnMediaArea = renderMode === NotesRenderMode.PINNED;
  const isGridLayout = useStorageKey('isGridEnabled');

  const [pinSharedNotes] = useMutation(PIN_NOTES);
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);
  const isScreenBroadcasting = useIsScreenBroadcasting();

  const handlePinSharedNotes = useCallback((pinned: boolean) => {
    if (pinned) {
      stopExternalVideoShare();
      if (isScreenBroadcasting) screenshareHasEnded();
    }
    pinSharedNotes({ variables: { pinned } });
    layoutContextDispatch({
      type: ACTIONS.SET_NOTES_IS_PINNED,
      value: pinned,
    });
  }, [
    stopExternalVideoShare,
    isScreenBroadcasting,
    screenshareHasEnded,
    pinSharedNotes,
    layoutContextDispatch,
  ]);

  return (
    <NotesGraphql
      isOnMediaArea={isOnMediaArea}
      isVisible={isOnMediaArea && isGridLayout ? isVisible && isSidebarContentOpen : isVisible}
      hasPermission={hasPermission}
      layoutContextDispatch={layoutContextDispatch}
      isResizing={isResizing}
      isLocalChange={isLocalChange}
      ignoreDelayforUnmount={sidebarContentToIgnoreDelay.includes(sidebarContent.sidebarContentPanel)}
      sharedNotesOutput={sharedNotesOutput}
      amIPresenter={amIPresenter}
      isRTL={isRTL}
      handlePinSharedNotes={handlePinSharedNotes}
    />
  );
};

export default injectWbResizeEvent(NotesContainerGraphql);
