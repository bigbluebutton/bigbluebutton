import React from 'react';
import Base from '../checkbox/base';
import Styled from './styles';

export default class Radio extends Base {
  render() {
    const {
      ariaLabel, ariaDesc, ariaDescribedBy, ariaLabelledBy, checked, disabled, label,
    } = this.props;

    const radio = (
      <Styled.Radio
        checked={checked}
        checkedIcon={<Styled.RadioIconChecked iconName="check" />}
        icon={<Styled.RadioIcon iconName="circle" />}
        disabled={disabled}
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
            control={radio}
          />
        ) : radio}
        <div id={ariaDescribedBy} hidden>{ariaDesc}</div>
      </>
    );
  }
}
