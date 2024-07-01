import React from 'react';
import Base from './base';
import Styled from './styles';

export default class Checkbox extends Base {
  render() {
    const {
      ariaLabel, ariaDesc, ariaDescribedBy, ariaLabelledBy, checked, disabled, label,
    } = this.props;

    const checkbox = (
      <Styled.Checkbox
        checked={checked}
        disabled={disabled}
        focusRipple={true}
        inputProps={{
          'aria-label': ariaLabel,
          'aria-describedby': ariaDescribedBy,
          'aria-labelledby': ariaLabelledBy,
        }}
        onChange={this.handleChange}
        ref={this.element}
      />
    );

    return (
      <>
        {label ? (
          <Styled.Label
            label={label}
            control={checkbox}
          />
        ) : checkbox}
        <div id={ariaDescribedBy} hidden>{ariaDesc}</div>
      </>
    );
  }
}
