import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/button/component';
import Service from '/imports/ui/components/notes/service';
import PadContainer from '/imports/ui/components/pads/container';
import { styles } from './styles';
import { PANELS, ACTIONS } from '../layout/enums';

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
};

const Notes = ({
  hasPermission,
  intl,
  isRTL,
  layoutContextDispatch,
  isResizing,
}) => {
  useEffect(() => () => Service.setLastRev(), []);

  return (
    <div
      data-test="notes"
      className={styles.notes}
    >
      <header className={styles.header}>
        <div
          data-test="notesTitle"
          className={styles.title}
        >
          <Button
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
            className={styles.hideBtn}
          />
        </div>
      </header>
      <PadContainer
        externalId={Service.ID}
        hasPermission={hasPermission}
        isResizing={isResizing}
        isRTL={isRTL}
      />
    </div>
  );
};

Notes.propTypes = propTypes;

export default injectWbResizeEvent(injectIntl(Notes));
