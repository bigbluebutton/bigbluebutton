import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation, useQuery } from '@apollo/client';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import PadContainer from '/imports/ui/components/pads/pads-graphql/component';
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
import { GET_PAD_ID, GetPadIdQueryResponse } from './queries';
import BlockNoteContainer from '../bn-shared-notes/component';

const intlMessages = defineMessages({
  title: {
    id: 'app.notes.title',
    description: 'Title for the shared notes',
  },
  unpinNotes: {
    id: 'app.notes.notesDropdown.unpinNotes',
    description: 'Label for unpin shared notes button',
  },
  minimize: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Label for the minimize shared notes panel',
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
  sharedNotesEditor: string;
  padId: string;
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
    sharedNotesEditor,
    padId,
    isRTL,
    layoutContextDispatch,
    isResizing,
    isLocalChange,
    sharedNotesOutput,
    amIPresenter,
    ignoreDelayforUnmount,
    handlePinSharedNotes,
  } = props;
  const [shouldRenderNotes, setShouldRenderNotes] = useState(isVisible);
  const intl = useIntl();

  const isHidden = (isOnMediaArea && (sharedNotesOutput.width === 0 || sharedNotesOutput.height === 0))
    || (!isVisible && !ignoreDelayforUnmount);

  const timeoutRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (isVisible) {
      setShouldRenderNotes(true);
      clearTimeout(timeoutRef.current);
    } else if (ignoreDelayforUnmount) {
      setShouldRenderNotes(false);
    } else {
      timeoutRef.current = setTimeout(() => {
        setShouldRenderNotes(false);
      }, NOTES_UNMOUNT_DELAY());
    }
    return () => clearTimeout(timeoutRef.current);
  }, [isVisible]);

  const renderHeaderOnMedia = () => {
    return amIPresenter ? (
      <Styled.Header
        title={intl.formatMessage(intlMessages.title)}
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
    height,
    width,
    top,
    left,
    right,
    zIndex,
  } = sharedNotesOutput;

  const cssProps = {
    height,
    width,
    top,
    left,
    right,
    zIndex,
  };

  const isEtherpadSharedNotes = sharedNotesEditor === 'etherpad';

  return shouldRenderNotes && (
    <Styled.PanelContent
      data-test="notes"
      isOnMediaArea={isOnMediaArea}
      isHidden={isHidden}
      style={isOnMediaArea ? cssProps : {}}
    >
      {!isOnMediaArea ? (
        <>
          <Styled.HeaderContainer
            title={intl.formatMessage(intlMessages.title)}
            rightButtonProps={{
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
              icon: 'minus',
              'data-test': 'hideNotesLabel',
              'aria-label': intl.formatMessage(
                intlMessages.minimize,
                { panelName: intl.formatMessage(intlMessages.title) },
              ),
              label: intl.formatMessage(
                intlMessages.minimize,
                { panelName: intl.formatMessage(intlMessages.title) },
              ),
            }}
            data-test="notesHeader"
            customRightButton={(
              <NotesDropdown
                handlePinSharedNotes={handlePinSharedNotes}
                isEtherpadSharedNotes={isEtherpadSharedNotes}
                padId={padId}
              />
            )}
          />
          <Styled.Separator />
        </>
      ) : renderHeaderOnMedia()}
      { isEtherpadSharedNotes
        ? (
          <PadContainer
            isOnMediaArea={isOnMediaArea}
            externalId={NOTES_ID()}
            hasPermission={hasPermission}
            isResizing={isResizing}
            isLocalChange={isLocalChange}
            isRTL={isRTL}
            amIPresenter={amIPresenter}
            isVisible={isVisible}
          />
        ) : <BlockNoteContainer />}
    </Styled.PanelContent>
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
  const NOTES_CONFIG = window.meetingClientSettings.public.notes;
  const { data: padIdData } = useQuery<GetPadIdQueryResponse>(
    GET_PAD_ID,
    { variables: { externalId: NOTES_CONFIG.id } },
  );
  const padId = padIdData?.sharedNotes?.[0]?.padId;
  const sharedNotesEditor = padIdData?.sharedNotes?.[0]?.sharedNotesEditor;

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

  if (!padId || !sharedNotesEditor) return null;

  return (
    <NotesGraphql
      isOnMediaArea={isOnMediaArea}
      isVisible={isOnMediaArea && isGridLayout ? isVisible && isSidebarContentOpen : isVisible}
      padId={padId}
      sharedNotesEditor={sharedNotesEditor}
      hasPermission={hasPermission}
      layoutContextDispatch={layoutContextDispatch}
      isResizing={isResizing}
      isLocalChange={isLocalChange}
      ignoreDelayforUnmount={sidebarContentToIgnoreDelay.includes(sidebarContent.sidebarContentPanel)
        || (isOnMediaArea && !!isGridLayout)}
      sharedNotesOutput={sharedNotesOutput}
      amIPresenter={amIPresenter}
      isRTL={isRTL}
      handlePinSharedNotes={handlePinSharedNotes}
    />
  );
};

export default injectWbResizeEvent(NotesContainerGraphql);
