import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import KEY_CODES from '/imports/utils/keyCodes';
import Styled from './styles';

const propTypes = {
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  ariaLabelledBy: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaDesc: PropTypes.string,
};

const defaultProps = {
  disabled: false,
  checked: false,
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
    const { ariaLabel, ariaDesc, ariaDescribedBy, checked, disabled } = this.props;

    return (
      <Styled.CheckboxWrapper
        disabled={!!disabled}
        tabIndex={0}
        ref={(node) => { this.checkbox = node; }}
      >
        <Styled.CheckboxInput
          type="checkbox"
          onChange={this.handleChange}
          checked={checked}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          disabled={disabled}
          ref={(node) => { this.input = node; }}
        />
        <div role="presentation" onClick={this.handleChange}>
          { checked
            ? <Styled.CheckboxIconChecked iconName="check" />
            : <Styled.CheckboxIcon iconName="circle" />
          }
        </div>
        <div id={ariaDescribedBy} hidden>{ariaDesc}</div>
      </Styled.CheckboxWrapper>
    );
  }
}

Checkbox.propTypes = propTypes;
Checkbox.defaultProps = defaultProps;
