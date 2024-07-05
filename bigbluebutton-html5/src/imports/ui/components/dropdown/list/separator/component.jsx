import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

const DropdownListSeparator = ({ style = null }) => (
  <Styled.Separator style={style} />
);

DropdownListSeparator.propTypes = {
  style: PropTypes.shape({}),
};

export default DropdownListSeparator;
