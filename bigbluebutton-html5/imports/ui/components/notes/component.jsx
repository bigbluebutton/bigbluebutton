import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Service from '/imports/ui/components/notes/service';
import PadContainer from '/imports/ui/components/pads/container';
import Styled from './styles';
import { PANELS, ACTIONS } from '../layout/enums';
import browserInfo from '/imports/utils/browserInfo';

const intlMessages = defineMessages({
  hide: {
    id: 'app.notes.hide',
    description: 'Label for hiding shared notes button',
  },
  title: {
    id: 'app.notes.title',
    description: 'Title for the shared notes',
  },
  convertAndUploadLabel: {
    id: 'app.note.convertAndUpload',
    description: 'Export shared notes as a PDF and upload to the main room',
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
  amIPresenter: PropTypes.bool.isRequired,
};

const Notes = ({
  hasPermission,
  intl,
  isRTL,
  layoutContextDispatch,
  amIPresenter,
  isResizing,
}) => {
  useEffect(() => () => Service.setLastRev(), []);
  const { isChrome } = browserInfo;

  if (hasPermission && amIPresenter) {
    return (
      <Styled.Notes data-test="notes" isChrome={isChrome}>
        <Styled.Header>
          <Styled.Title data-test="notesTitle">
            <Styled.HideButton
              onClick={() => {
                layoutContextDispatch({
                  type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                  value: false,
                });
                layoutContextDispatch({
                  type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                  value: PANELS.NONE,
                });
              }}
              data-test="hideNotesLabel"
              aria-label={intl.formatMessage(intlMessages.hide)}
              label={intl.formatMessage(intlMessages.title)}
              icon={isRTL ? 'right_arrow' : 'left_arrow'}
            />
          </Styled.Title>
          <Styled.ConvertAndUpload
            onClick={() => { Service.convertAndUpload(Date.now()); }}
            label={intl.formatMessage(intlMessages.convertAndUploadLabel)}
            icon="upload"
          />
        </Styled.Header>
        <PadContainer
          externalId={Service.ID}
          hasPermission={hasPermission}
          isResizing={isResizing}
          isRTL={isRTL}
        />
      </Styled.Notes>
    );
  }

  return (
    <Styled.Notes data-test="notes" isChrome={isChrome}>
      <Styled.Header>
        <Styled.Title data-test="notesTitle">
          <Styled.HideButton
            onClick={() => {
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: false,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: PANELS.NONE,
              });
            }}
            data-test="hideNotesLabel"
            aria-label={intl.formatMessage(intlMessages.hide)}
            label={intl.formatMessage(intlMessages.title)}
            icon={isRTL ? 'right_arrow' : 'left_arrow'}
          />
        </Styled.Title>
      </Styled.Header>
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

export default injectWbResizeEvent(injectIntl(Notes));
