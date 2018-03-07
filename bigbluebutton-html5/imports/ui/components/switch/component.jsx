import React from 'react';
import Toggle from 'react-toggle';
import classNames from 'classnames';

export default class Switch extends Toggle {
  render() {
    const {
      className,
      icons: _icons,
      ariaLabelledBy,
      ariaDescribedBy,
      ariaLabel,
      ariaDesc,
      ...inputProps,
    } = this.props;

    const classes = classNames('react-toggle', {
      'react-toggle--checked': this.state.checked,
      'react-toggle--focus': this.state.hasFocus,
      'react-toggle--disabled': this.props.disabled,
    }, className);

    return (
      <div className={classes}
        onClick={this.handleClick}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}>
        <div className='react-toggle-track' aria-hidden="true">
          <div className='react-toggle-track-check'>
            ON
          </div>
          <div className='react-toggle-track-x'>
            OFF
          </div>
        </div>
        <div className='react-toggle-thumb' />

        <input
          {...inputProps}
          ref={ref => { this.input = ref; }}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          className='react-toggle-screenreader-only'
          type='checkbox'
          tabIndex='0'
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}/>
          <div id={ariaDescribedBy} hidden>{ariaDesc}</div>
      </div>
    );
  }
};
