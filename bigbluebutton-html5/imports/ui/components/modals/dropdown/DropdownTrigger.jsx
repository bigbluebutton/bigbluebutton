import React, { Component, PropTypes } from 'react';
import Button from '/imports/ui/components/button/component';
import styles from './styles';

const propTypes = {
  labelBtn: PropTypes.string.isRequired,
  iconBtn: PropTypes.string.isRequired,
  toggleMenu: PropTypes.func.isRequired,
}

export default class DropdownTrigger extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { labelBtn, iconBtn, refBtn } = this.props;
    const toggle = this.props.toggleMenu.bind(this);
    return (
      <Button className={styles.settingBtn}
          role='button'
          label='setting'
          icon='more'
          ghost={true}
          circle={true}
          hideLabel={true}
          onClick={toggle}
          ref='settingBtn'/>
    );
  }
}

DropdownTrigger.propTypes = propTypes;
