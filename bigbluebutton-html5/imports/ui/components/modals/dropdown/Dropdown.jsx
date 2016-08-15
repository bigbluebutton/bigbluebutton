import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Button from '/imports/ui/components/button/component';
import classNames from 'classnames';
import Icon from '/imports/ui/components/icon/component';
import styles from './styles';

export default class Dropdown extends Component {

  constructor(props) {
    super(props);
    this.state = { isMenuOpen: false, };
    this.showMenu = this.showMenu.bind(this);
    this.hideMenu = this.hideMenu.bind(this);
  }

  showMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  hideMenu() {
    this.setState({ isMenuOpen: false, });

  }

  render() {
    const { icon, label, circle } = this.props;
    return (
      <div className={styles.dropdown}>
        <Button className={styles.settingBtn}
            role='button'
            label={'settings'}
            icon={'more'}
            ghost={true}
            circle={true}
            hideLabel={true}
            onClick={this.showMenu}
            onKeyDown={this.showMenu}/>
        {
          this.state.isMenuOpen ?
          this.props.children
          : null
        }
      </div>
    );
  }
}
