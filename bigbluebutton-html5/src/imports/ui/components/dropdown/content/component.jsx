import React, { Component, Children, cloneElement } from 'react';
import Styled from './styles';

const defaultProps = {
  'aria-expanded': false,
};

export default class DropdownContent extends Component {
  render() {
    const {
      children,
      dropdownToggle,
      dropdownShow,
      dropdownHide,
      dropdownIsOpen,
      keepOpen,
      ...restProps
    } = this.props;

    const boundChildren = Children.map(children, child => cloneElement(child, {
      dropdownIsOpen,
      dropdownToggle,
      dropdownShow,
      dropdownHide,
      keepOpen,
    }));

    return (
      <Styled.Content
        data-test="dropdownContent"
        {...restProps}
      >
        <Styled.Scrollable>
          {boundChildren}
        </Styled.Scrollable>
      </Styled.Content>
    );
  }
}

DropdownContent.defaultProps = defaultProps;
