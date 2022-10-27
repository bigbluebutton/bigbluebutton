import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Service from '/imports/ui/components/notes/service';
import PadContainer from '/imports/ui/components/pads/container';
import ConverterButtonContainer from './converter-button/container';
import Styled from './styles';
import { PANELS, ACTIONS } from '../layout/enums';
import browserInfo from '/imports/utils/browserInfo';
import Header from '/imports/ui/components/common/control-header/component';

const intlMessages = defineMessages({
  hide: {
    id: 'app.notes.hide',
    description: 'Label for hiding shared notes button',
  },
  title: {
    id: 'app.notes.title',
    description: 'Title for the shared notes',
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
};

const defaultProps = {
  area: 'sidebarContent',
};

const Notes = ({
  hasPermission,
  intl,
  isRTL,
  layoutContextDispatch,
  isResizing,
  area,
  sidebarContent,
  sharedNotesOutput,
}) => {
  useEffect(() => () => Service.setLastRev(), []);
  const { isChrome } = browserInfo;
  const isOnMediaArea = area === 'media';
  const style = isOnMediaArea ? {
    position: 'absolute',
    ...sharedNotesOutput,
  } : {};
  const isHidden = isOnMediaArea && (style.width === 0 || style.height === 0);

  if (isHidden) style.padding = 0;

  useEffect(() => {
    if (
      isOnMediaArea
      && sidebarContent.isOpen
      && sidebarContent.sidebarContentPanel === PANELS.SHARED_NOTES
    ) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: false,
      });

      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.NONE,
      });

      layoutContextDispatch({
        type: ACTIONS.SET_NOTES_IS_PINNED,
        value: true,
      });

      return () => {
        layoutContextDispatch({
          type: ACTIONS.SET_NOTES_IS_PINNED,
          value: false,
        });
      };
    }
  }, []);

  return (
    <Styled.Notes data-test="notes" isChrome={isChrome} style={style}>
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
            <ConverterButtonContainer />
          }
        />
      ): null}
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
