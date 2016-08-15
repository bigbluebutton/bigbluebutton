import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Icon from '/imports/ui/components/icon/component';
import classNames from 'classnames';
import styles from './styles';
import SettingsModal from '../settings/SettingsModal';
import SessionMenu from '../settings/submenus/SessionMenu';

export default class DropdownContent extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}
