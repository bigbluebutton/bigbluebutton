import React from 'react';
import PropTypes from 'prop-types';
import Icon from '/imports/ui/components/icon/component';
import { Session } from 'meteor/session';
import { styles } from './styles';

const propTypes = {
  locale: PropTypes.shape({
    locale: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  tabIndex: PropTypes.number.isRequired,
};

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
    locale,
    tabIndex,
  } = props;

  return (
    <div
      role="button"
      tabIndex={tabIndex}
      id={locale.locale}
      className={styles.captionsListItem}
      onClick={() => handleClickToggleCaptions(locale.locale)}
    >
      <Icon iconName="polling" />
      <span>{locale.name}</span>
    </div>
  );
};

CaptionsListItem.propTypes = propTypes;

export default CaptionsListItem;
