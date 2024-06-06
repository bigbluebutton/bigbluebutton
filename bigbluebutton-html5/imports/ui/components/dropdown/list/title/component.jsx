import React, { Component } from 'react';
import Styled from './styles';
import { uniqueId } from '/imports/utils/string-utils';

export default class DropdownListTitle extends Component {
  constructor(props) {
    super(props);
    this.labelID = uniqueId('labelContext-');
  }

  render() {
    const {
      children,
    } = this.props;

    return (
      <Styled.Title aria-hidden>
        {children}
      </Styled.Title>
    );
  }
}
