import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import classNames from 'classnames';
import styles from './styles';
import SettingsModal from '../settings/SettingsModal';
import SessionMenu from '../settings/submenus/SessionMenu';
import Dropdown from './Dropdown';

export default class SettingsDropdown extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Dropdown styleName='settingBtn'
              label='setting'
              icon='more'
              ghost='true'
              circle='true'/>
    );
  }
}
