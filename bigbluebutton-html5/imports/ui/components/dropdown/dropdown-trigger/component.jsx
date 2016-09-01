import React, { Component, PropTypes } from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../styles';

export default class DropdownTrigger extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.props.toggle.bind(this);
  }

  render() {
    return this.props.children ? this.renderChildren() : this.renderButton();
  }

  renderChildren() {
    return (
      <span onClick={this.toggle}>
        { this.props.children }
      </span>
    );
  }

  renderButton() {
    const {
      labelBtn,
      iconBtn,
    } = this.props;

    return (
      <Button
        className={styles.settingBtn}
        role='button'
        label={labelBtn}
        icon={iconBtn}
        ghost={true}
        circle={true}
        hideLabel={true}
        onClick={this.toggle}
        onKeyDown={this.toggle}
        aria-haspopup={'true'}/>
    );
  }
}
