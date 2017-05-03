import React, { Component, PropTypes } from 'react';

import Icon from '../icon/component';
import styles from './styles';
import cx from 'classnames';

export default class Checkbox extends Component {
  constructor(props) {
    super(props);

    this.onChange = props.onChange;
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange() {
    if (!this.props.disabled)
      this.onChange();
  }

  render() {
    const { className, ariaLabel, ariaLabelledBy, ariaDesc, ariaDescribedBy, disabled } = this.props;

    return (
      <div className={cx({
        [styles.disabled]: !!disabled,
      }, styles.container, className)}>
        <input
          type='checkbox'
          onChange={this.handleChange}
          checked={this.props.checked}
          className={styles.input}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          disabled={disabled} />
        <div onClick={this.handleChange}>
          { this.props.checked ?
            <Icon iconName='check' className={cx(styles.icon, styles.checked)}/> :
            <Icon iconName='circle' className={styles.icon}/>
          }
        </div>
        <div id={ariaLabelledBy} hidden>{ariaLabel}</div>
        <div id={ariaDescribedBy} hidden>{ariaDesc}</div>
      </div>
    );
  }
}
