import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';
import Left from './left/component';
import Right from './right/component';

const Header = ({
  leftButtonProps,
  rightButtonProps,
  customRightButton,
  title,
  'data-test': dataTest,
  ...rest
}) => {

  return (
    <Styled.Header data-test={dataTest ? dataTest : ''} {...rest}>
      <Styled.Title>{title}</Styled.Title>
      {customRightButton && (
        <Styled.RightWrapper>
          {customRightButton}
        </Styled.RightWrapper>
      )}
      {rightButtonProps && (
        <Styled.RightWrapper>
          <Right {...rightButtonProps} />
        </Styled.RightWrapper>
      )}
    </Styled.Header>
  );
}

Header.propTypes = {
  leftButtonProps: PropTypes.object,
  rightButtonProps: PropTypes.object,
  customRightButton: PropTypes.element,
  dataTest: PropTypes.string,
};

export default Header;
