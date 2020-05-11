import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/icon/component';
import { Session } from 'meteor/session';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';

const propTypes = {
  intl: intlShape.isRequired,
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

const handleClickToggleCaptions = (locale) => {
  const panel = Session.get('openPanel');

  if (panel !== 'captions') {
    Session.set('captionsLocale', locale);
    Session.set('openPanel', 'captions');
  } else {
    const captionsLocale = Session.get('captionsLocale');
    if (captionsLocale !== locale) {
      Session.set('captionsLocale', locale);
    } else {
      Session.set('openPanel', 'userlist');
    }
  }
};

const CaptionsListItem = (props) => {
  const {
    intl,
    locale,
    tabIndex,
  } = props;

  return (
    <div
      role="button"
      tabIndex={tabIndex}
      id={locale.locale}
      className={styles.listItem}
      onClick={() => handleClickToggleCaptions(locale.locale)}
      aria-label={`${locale.name} ${intl.formatMessage(intlMessages.captionLabel)}`}
    >
      <Icon iconName="closed_caption" />
      <span aria-hidden>{locale.name}</span>
    </div>
  );
};

CaptionsListItem.propTypes = propTypes;

export default injectIntl(CaptionsListItem);
