import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';
import Left from './left/component';
import Right from './right/component';

const Header = ({
  leftButtonProps,
  rightButtonProps,
  customRightButton,
  'data-test': dataTest,
}) => {
  const renderCloseButton = () => (
    <Right {...rightButtonProps} />
  );

  const renderCustomRightButton = () => (
    <Styled.RightWrapper>
      {customRightButton}
    </Styled.RightWrapper>
  );

  return (
    <Styled.Header data-test={dataTest ? dataTest : ''}>
      <Left {...leftButtonProps} />
      {customRightButton
        ? renderCustomRightButton()
        : rightButtonProps
          ? renderCloseButton()
          : null}
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
