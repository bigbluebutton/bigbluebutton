import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import styles from '../styles.scss';

export default class BaseMenu extends React.Component {
  constructor(props) {
    super(props);

    this.handleUpdateSettings = props.handleUpdateSettings;
  }

  handleToggle(key) {
    const obj = this.state;
    obj.settings[key] = !this.state.settings[key];

    this.setState(obj, () => {
      this.handleUpdateSettings(this.state.settingsName, this.state.settings);
    });
  }
}
