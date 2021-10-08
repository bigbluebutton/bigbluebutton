import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/icon/component';
import { Session } from 'meteor/session';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import { PANELS, ACTIONS } from '../../layout/enums';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  locale: PropTypes.shape({
    locale: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  tabIndex: PropTypes.number.isRequired,
};

const intlMessages = defineMessages({
  captionLabel: {
    id: 'app.captions.label',
    description: 'used for captions button aria label',
  },
});

const CaptionsListItem = (props) => {
  const {
    intl,
    locale,
    tabIndex,
    sidebarContentPanel,
    layoutContextDispatch,
  } = props;

  const handleClickToggleCaptions = () => {
    if (sidebarContentPanel !== PANELS.CAPTIONS) {
      Session.set('captionsLocale', locale.locale);
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.CAPTIONS,
      });
    } else {
      const captionsLocale = Session.get('captionsLocale');
      if (captionsLocale !== locale.locale) {
        Session.set('captionsLocale', locale.locale);
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
    }
  };

  return (
    <div
      role="button"
      tabIndex={tabIndex}
      id={locale.locale}
      className={styles.listItem}
      onClick={handleClickToggleCaptions}
      aria-label={`${locale.name} ${intl.formatMessage(intlMessages.captionLabel)}`}
      onKeyPress={() => {}}
    >
      <Icon iconName="closed_caption" />
      <span aria-hidden>{locale.name}</span>
    </div>
  );
};

CaptionsListItem.propTypes = propTypes;

export default injectIntl(CaptionsListItem);
