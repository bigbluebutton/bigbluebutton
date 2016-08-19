import React, { Component, PropTypes } from 'react';
import Button from '/imports/ui/components/button/component';
import styles from './styles';

export default class DropdownTrigger extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { labelBtn, iconBtn } = this.props;
    const toggle = this.props.toggleMenu.bind(this);
    return (
      <Button className={styles.settingBtn}
          role='button'
          label={labelBtn}
          icon={iconBtn}
          ghost={true}
          circle={true}
          hideLabel={true}
          onClick={toggle}
          onKeyDown={toggle}
          aria-haspopup={'true'}/>
    );
  }
}
