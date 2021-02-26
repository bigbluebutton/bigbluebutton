import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/icon/component';
import { Session } from 'meteor/session';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import { PANELS, ACTIONS } from '../../layout/enums';

const propTypes = {
  intl: PropTypes.object.isRequired,
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

const handleClickToggleCaptions = (locale, newLayoutContextDispatch) => {
  const panel = Session.get('openPanel');

  if (panel !== 'captions') {
    Session.set('captionsLocale', locale);
    Session.set('openPanel', 'captions');
    newLayoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.CAPTIONS,
    });
  } else {
    const captionsLocale = Session.get('captionsLocale');
    if (captionsLocale !== locale) {
      Session.set('captionsLocale', locale);
    } else {
      Session.set('openPanel', 'userlist');
      newLayoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.NONE,
      });
    }
  }
};

const CaptionsListItem = (props) => {
  const {
    intl,
    locale,
    tabIndex,
    newLayoutContextDispatch,
  } = props;

  return (
    <div
      role="button"
      tabIndex={tabIndex}
      id={locale.locale}
      className={styles.listItem}
      onClick={() => handleClickToggleCaptions(locale.locale, newLayoutContextDispatch)}
      aria-label={`${locale.name} ${intl.formatMessage(intlMessages.captionLabel)}`}
    >
      <Icon iconName="closed_caption" />
      <span aria-hidden>{locale.name}</span>
    </div>
  );
};

CaptionsListItem.propTypes = propTypes;

export default injectIntl(CaptionsListItem);
