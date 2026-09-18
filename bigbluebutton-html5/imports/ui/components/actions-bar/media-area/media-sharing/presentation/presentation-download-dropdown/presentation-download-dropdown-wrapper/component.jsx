import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

const propTypes = {
  children: PropTypes.node.isRequired,
};
function PresentationDownloadDropdownWrapper({ children }) {
  return (
    <Styled.DropdownMenuWrapper>
      {children}
    </Styled.DropdownMenuWrapper>
  );
}

PresentationDownloadDropdownWrapper.propTypes = propTypes;

export default PresentationDownloadDropdownWrapper;
