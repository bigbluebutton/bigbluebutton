import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import { ACTIONS, PANELS } from '../../../layout/enums';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
});

const BreakoutRoomItem = ({
  hasBreakoutRoom,
  sidebarContentPanel,
  layoutContextDispatch,
  intl,
}) => {
  const toggleBreakoutPanel = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== PANELS.BREAKOUT,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === PANELS.BREAKOUT
        ? PANELS.NONE
        : PANELS.BREAKOUT,
    });
  };

  if (hasBreakoutRoom) {
    return (
      <div className={styles.messages}>
        <div className={styles.container}>
          <h2 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.breakoutTitle)}
          </h2>
        </div>
        <div className={styles.scrollableList}>
          <div className={styles.list}>
            <div
              role="button"
              tabIndex={0}
              onClick={toggleBreakoutPanel}
              data-test="breakoutRoomsItem"
              className={styles.listItem}
              aria-label={intl.formatMessage(intlMessages.breakoutTitle)}
              onKeyPress={() => {}}
            >
              <Icon iconName="rooms" />
              <span aria-hidden>{intl.formatMessage(intlMessages.breakoutTitle)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <span />;
};

export default injectIntl(BreakoutRoomItem);

BreakoutRoomItem.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  hasBreakoutRoom: PropTypes.bool.isRequired,
};
