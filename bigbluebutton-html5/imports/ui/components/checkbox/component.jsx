import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { findDOMNode } from 'react-dom';
import KEY_CODES from '/imports/utils/keyCodes';
import Icon from '../icon/component';
import { styles } from './styles';

const propTypes = {
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaDesc: PropTypes.string,
};

const defaultProps = {
  disabled: false,
  checked: false,
  className: null,
  ariaLabelledBy: null,
  ariaLabel: null,
  ariaDescribedBy: null,
  ariaDesc: null,
};

export default class Checkbox extends PureComponent {
  constructor(props) {
    super(props);

    this.onChange = props.onChange;
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    const checkbox = findDOMNode(this.checkbox);
    if (checkbox) checkbox.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    const checkbox = findDOMNode(this.checkbox);
    if (checkbox) checkbox.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event) {
    const { which } = event;
    const input = findDOMNode(this.input);
    if ([KEY_CODES.ENTER].includes(which)) {
      if (input) input.click();
    }
  }

  handleChange() {
    const { disabled, keyValue } = this.props;
    if (disabled) return;
    this.onChange(keyValue);
  }

  render() {
    const {
      ariaLabel, ariaLabelledBy, ariaDesc, ariaDescribedBy,
      className, checked, disabled,
    } = this.props;

    return (
      <div
        className={cx({
          [styles.disabled]: !!disabled,
        }, className)}
        tabIndex={0}
        ref={(node) => { this.checkbox = node; }}
      >
        <input
          type="checkbox"
          onChange={this.handleChange}
          checked={checked}
          className={styles.input}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          disabled={disabled}
          ref={(node) => { this.input = node; }}
        />
        <div role="presentation" onClick={this.handleChange}>
          { checked
            ? <Icon iconName="check" className={cx(styles.icon, styles.checked)} />
            : <Icon iconName="circle" className={styles.icon} />
          }
        </div>
        <div id={ariaDescribedBy} hidden>{ariaDesc}</div>
      </div>
    );
  }
}

Checkbox.propTypes = propTypes;
Checkbox.defaultProps = defaultProps;
