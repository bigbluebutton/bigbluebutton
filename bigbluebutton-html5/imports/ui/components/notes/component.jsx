import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Service from '/imports/ui/components/notes/service';
import PadContainer from '/imports/ui/components/pads/container';
import Styled from './styles';
import { PANELS, ACTIONS, LAYOUT_TYPE } from '../layout/enums';
import browserInfo from '/imports/utils/browserInfo';
import Header from '/imports/ui/components/common/control-header/component';
import NotesDropdown from '/imports/ui/components/notes/notes-dropdown/container';
import { isPresentationEnabled } from '../../services/features';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
const DELAY_UNMOUNT_SHARED_NOTES = Meteor.settings.public.app.delayForUnmountOfSharedNote;
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

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isRTL: PropTypes.bool.isRequired,
  hasPermission: PropTypes.bool.isRequired,
  isResizing: PropTypes.bool.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  sidebarContent: PropTypes.object.isRequired,
  sharedNotesOutput: PropTypes.object.isRequired,
  area: PropTypes.string,
  layoutType: PropTypes.string,
};

const defaultProps = {
  area: 'sidebarContent',
  layoutType: null,
};

let timoutRef = null;
const sidebarContentToIgnoreDelay = ['captions'];
const Notes = ({
  hasPermission,
  intl,
  isRTL,
  layoutContextDispatch,
  isResizing,
  area,
  layoutType,
  sidebarContent,
  sharedNotesOutput,
  amIPresenter,
  isToSharedNotesBeShow,
  shouldShowSharedNotesOnPresentationArea,
}) => {
  const [shouldRenderNotes, setShouldRenderNotes] = useState(false);

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
  useEffect(() => {
    if (
      isOnMediaArea
      && (sidebarContent.isOpen || !isPresentationEnabled())
      && (sidebarContent.sidebarContentPanel === PANELS.SHARED_NOTES || !isPresentationEnabled())
    ) {
      if (layoutType === LAYOUT_TYPE.VIDEO_FOCUS) {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.CHAT,
        });

        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: PUBLIC_CHAT_ID,
        });
      } else {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: false,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.NONE,
        });
      }

      layoutContextDispatch({
        type: ACTIONS.SET_NOTES_IS_PINNED,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: true,
      });

      return () => {
        layoutContextDispatch({
          type: ACTIONS.SET_NOTES_IS_PINNED,
          value: false,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_PRESENTATION_IS_OPEN,
          value: Session.get('presentationLastState'),
        });
      };
    } if (shouldShowSharedNotesOnPresentationArea) {
      layoutContextDispatch({
        type: ACTIONS.SET_NOTES_IS_PINNED,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: true,
      });
    }
  }, []);

  const renderHeaderOnMedia = () => {
    return amIPresenter ? (
      <Styled.Header
        rightButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.unpinNotes),
          'data-test': 'unpinNotes',
          icon: 'close',
          label: intl.formatMessage(intlMessages.unpinNotes),
          onClick: () => {
            Service.pinSharedNotes(false);
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
            <NotesDropdown />
          }
        />
      ) : renderHeaderOnMedia()}
      <PadContainer
        externalId={Service.ID}
        hasPermission={hasPermission}
        isResizing={isResizing}
        isRTL={isRTL}
      />
    </Styled.Notes>
  );
};

Notes.propTypes = propTypes;
Notes.defaultProps = defaultProps;

export default injectWbResizeEvent(injectIntl(Notes));
