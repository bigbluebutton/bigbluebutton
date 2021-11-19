import React, { Component } from 'react';
import _ from 'lodash';
import Styled from './styles';

export default class DropdownListTitle extends Component {
  constructor(props) {
    super(props);
    this.labelID = _.uniqueId('labelContext-');
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
