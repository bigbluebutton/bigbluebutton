import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation, useSubscription } from '@apollo/client';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import NotesService from '/imports/ui/components/notes/service';
import PadContainer from '/imports/ui/components/pads/pads-graphql/component';
import browserInfo from '/imports/utils/browserInfo';
import Header from '/imports/ui/components/common/control-header/component';
import NotesDropdown from './notes-dropdown/component';
import {
  PANELS, ACTIONS,
} from '/imports/ui/components/layout/enums';
import { layoutSelectInput, layoutDispatch, layoutSelectOutput } from '/imports/ui/components/layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useHasPermission from './hooks/useHasPermission';
import Styled from './styles';
import { PINNED_PAD_SUBSCRIPTION, PinnedPadSubscriptionResponse } from './queries';
import { PIN_NOTES } from './mutations';
import { EXTERNAL_VIDEO_STOP } from '/imports/ui/components/external-video-player/mutations';
import {
  screenshareHasEnded,
  isScreenBroadcasting,
} from '/imports/ui/components/screenshare/service';

const NOTES_CONFIG = window.meetingClientSettings.public.notes;
const DELAY_UNMOUNT_SHARED_NOTES = window.meetingClientSettings.public.app.delayForUnmountOfSharedNote;

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
  area: 'media' | undefined;
  isToSharedNotesBeShow: boolean;
}

interface NotesGraphqlProps extends NotesContainerGraphqlProps {
  hasPermission: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layoutContextDispatch: (action: any) => void;
  isResizing: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sidebarContent: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharedNotesOutput: any;
  amIPresenter: boolean;
  isRTL: boolean;
  shouldShowSharedNotesOnPresentationArea: boolean;
  handlePinSharedNotes: (pinned: boolean) => void;
}

let timoutRef: NodeJS.Timeout | undefined;
const sidebarContentToIgnoreDelay = ['captions'];

const NotesGraphql: React.FC<NotesGraphqlProps> = (props) => {
  const {
    hasPermission,
    isRTL,
    layoutContextDispatch,
    isResizing,
    area,
    sidebarContent,
    sharedNotesOutput,
    amIPresenter,
    isToSharedNotesBeShow,
    shouldShowSharedNotesOnPresentationArea,
    handlePinSharedNotes,
  } = props;
  const [shouldRenderNotes, setShouldRenderNotes] = useState(false);
  const intl = useIntl();

  const { isChrome } = browserInfo;
  const isOnMediaArea = area === 'media';
  const style = isOnMediaArea ? {
    position: 'absolute',
    ...sharedNotesOutput,
  } : {};

  const isHidden = (isOnMediaArea && (style.width === 0 || style.height === 0))
    || (!isToSharedNotesBeShow
      && !sidebarContentToIgnoreDelay.includes(sidebarContent.sidebarContentPanel))
    || shouldShowSharedNotesOnPresentationArea;

  if (isHidden && !isOnMediaArea) {
    style.padding = 0;
    style.display = 'none';
  }
  useEffect(() => {
    if (isToSharedNotesBeShow) {
      setShouldRenderNotes(true);
      clearTimeout(timoutRef);
    } else {
      timoutRef = setTimeout(() => {
        setShouldRenderNotes(false);
      }, (sidebarContentToIgnoreDelay.includes(sidebarContent.sidebarContentPanel)
        || shouldShowSharedNotesOnPresentationArea)
        ? 0 : DELAY_UNMOUNT_SHARED_NOTES);
    }
    return () => clearTimeout(timoutRef);
  }, [isToSharedNotesBeShow, sidebarContent.sidebarContentPanel]);

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

  return (shouldRenderNotes || shouldShowSharedNotesOnPresentationArea) && (
    <Styled.Notes
      data-test="notes"
      isChrome={isChrome}
      style={style}
    >
      {!isOnMediaArea ? (
        // @ts-ignore Until everything in Typescript
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
          customRightButton={
            <NotesDropdown handlePinSharedNotes={handlePinSharedNotes} />
          }
        />
      ) : renderHeaderOnMedia()}
      <PadContainer
        externalId={NotesService.ID}
        hasPermission={hasPermission}
        isResizing={isResizing}
        isRTL={isRTL}
      />
    </Styled.Notes>
  );
};

const NotesContainerGraphql: React.FC<NotesContainerGraphqlProps> = (props) => {
  const { area, isToSharedNotesBeShow } = props;

  const hasPermission = useHasPermission();
  const { data: pinnedPadData } = useSubscription<PinnedPadSubscriptionResponse>(PINNED_PAD_SUBSCRIPTION);
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const [pinSharedNotes] = useMutation(PIN_NOTES);

  // @ts-ignore Until everything in Typescript
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  // @ts-ignore Until everything in Typescript
  const sharedNotesOutput = layoutSelectOutput((i) => i.sharedNotes);
  // @ts-ignore Until everything in Typescript
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();
  const amIPresenter = !!currentUserData?.presenter;

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const shouldShowSharedNotesOnPresentationArea = !!pinnedPadData
    && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;

  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);

  const handlePinSharedNotes = (pinned: boolean) => {
    if (pinned) {
      stopExternalVideoShare();
      if (isScreenBroadcasting()) screenshareHasEnded();
    }
    pinSharedNotes({ variables: { pinned } });
  };

  return (
    <NotesGraphql
      area={area}
      hasPermission={hasPermission}
      layoutContextDispatch={layoutContextDispatch}
      isResizing={isResizing}
      sidebarContent={sidebarContent}
      sharedNotesOutput={sharedNotesOutput}
      amIPresenter={amIPresenter}
      shouldShowSharedNotesOnPresentationArea={shouldShowSharedNotesOnPresentationArea}
      isRTL={isRTL}
      isToSharedNotesBeShow={isToSharedNotesBeShow}
      handlePinSharedNotes={handlePinSharedNotes}
    />
  );
};

export default injectWbResizeEvent(NotesContainerGraphql);
