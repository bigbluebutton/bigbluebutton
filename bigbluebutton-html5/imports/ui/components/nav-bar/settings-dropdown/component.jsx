import React, { Component, PropTyes } from 'react';
import { FormattedMessage } from 'react-intl';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import styles from '../styles';

import { showModal } from '/imports/ui/components/app/service';
import LogoutConfirmation from '/imports/ui/components/logout-confirmation/component';
import Settings from '/imports/ui/components/settings/component';

import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';

const toggleFullScreen = () => {
  let element = document.documentElement;

  if (document.fullscreenEnabled
    || document.mozFullScreenEnabled
    || document.webkitFullscreenEnabled) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
};

const openSettings = () => showModal(<Settings />);

const openLogoutConfirmation = () => showModal(<LogoutConfirmation />);

export default class SettingsDropdown extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Dropdown ref="dropdown">
        <DropdownTrigger>
          <Button
            role="button"
            label="Settings"
            icon="more"
            ghost={true}
            circle={true}
            hideLabel={true}
            className={styles.settingBtn}

            // FIXME: Without onClick react proptypes keep warning
            // even after the DropdownTrigger inject an onClick handler
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="bottom right">
          <DropdownList>
            <DropdownListItem
              icon="full-screen"
              label="Fullscreen"
              defaultMessage="Make the application fullscreen"
              onClick={toggleFullScreen.bind(this)}
            />
            <DropdownListItem
              icon="more"
              label="Settings"
              description="Change the general settings"
              onClick={openSettings.bind(this)}
            />
            <DropdownListSeparator />
            <DropdownListItem
              icon="logout"
              label="Leave Session"
              description="Leave the meeting"
              onClick={openLogoutConfirmation.bind(this)}
            />
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}
