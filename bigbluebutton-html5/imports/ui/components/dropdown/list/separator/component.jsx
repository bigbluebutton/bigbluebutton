import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

const DropdownListSeparator = ({ style }) => (
  <Styled.Separator style={style} />
);

DropdownListSeparator.propTypes = {
  style: PropTypes.shape({}),
};

DropdownListSeparator.defaultProps = {
  style: null,
};

export default DropdownListSeparator;
