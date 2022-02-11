import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from '/imports/ui/components/actions-bar/styles';
import Button from '/imports/ui/components/button/component';
import ButtonEmoji from '/imports/ui/components/button/button-emoji/ButtonEmoji';
import { Session } from 'meteor/session';
import _ from 'lodash';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import Storage from '/imports/ui/services/storage/session';

const CAPTION_LOCALE = 'captionLocale';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  handleOnClick: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  start: {
    id: 'app.actionsBar.captions.start',
    description: 'Start closed captions option',
  },
  stop: {
    id: 'app.actionsBar.captions.stop',
    description: 'Stop closed captions option',
  },
  changeCaption: {
    id: 'app.actionsBar.changeCaption',
    description: 'Open change caption label',
  },
});

const handleClickCaption = (locale, selectedLocale) => {
  if (selectedLocale != locale) {
    Storage.setItem(CAPTION_LOCALE, locale);
    Session.set('activeCaptions', locale);
  }
}

const getAvailableCaptions = (captions, selected) => {
  return(
    captions.map(locale => (
    <DropdownListItem
      label={locale.name}
      key={_.uniqueId('locale-selector')}
      onClick={() => handleClickCaption(locale.locale, selected)}
      iconRight={selected == locale.locale ? 'check' : null}
      className={selected == locale.locale ? styles.selectedLocale : ''}
    />
    ))
  );
};

const CaptionsButton = ({ intl, isActive, handleOnClick, ownedLocales, selectedLocale }) => (
  <div className={styles.offsetBottom}>
    <Button
      className={cx(isActive || styles.btn)}
      icon="closed_caption"
      label={intl.formatMessage(isActive ? intlMessages.stop : intlMessages.start)}
      color={isActive ? 'primary' : 'default'}
      ghost={!isActive}
      hideLabel
      circle
      size="lg"
      onClick={handleOnClick}
      id={isActive ? 'stop-captions-button' : 'start-captions-button'}
    />
    {isActive &&
      <Dropdown>
        <DropdownTrigger tabIndex={0}>
        <ButtonEmoji
          emoji="device_list_selector"
          hideLabel
          label={intl.formatMessage(intlMessages.changeCaption)}
        />
        </DropdownTrigger>
        <DropdownContent placement="top left">
          <DropdownList>
            {getAvailableCaptions(ownedLocales, selectedLocale)}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    }
  </div>
);

CaptionsButton.propTypes = propTypes;
export default injectIntl(CaptionsButton);
