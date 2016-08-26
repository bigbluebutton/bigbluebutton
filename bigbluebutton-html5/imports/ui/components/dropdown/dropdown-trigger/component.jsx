import React, { Component, PropTypes } from 'react';
import Button from '/imports/ui/components/button/component';
import styles from '../styles';
import settingStyles from '../../dropdown-settings/styles';

export default class DropdownTrigger extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.props.toggle.bind(this);
  }

  render() {

    /*pass these props from your component to specialize your button */
    const { styleBtn, labelBtn, iconBtn, ghostBtn, colorBtn, sizeBtn, hideBtn, } = this.props;

    return (
      <Button
        className={styleBtn.triggerBtn}
        role='button'
        label={labelBtn}
        icon={iconBtn}
        ghost={ghostBtn}
        color={colorBtn}
        size={sizeBtn}
        hideLabel={hideBtn}
        circle={true}
        onClick={this.toggle}
        onKeyDown={this.toggle}
        aria-haspopup={'true'}/>
    );
  }
}
