import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';
import Left from './left/component';
import Right from './right/component';

const Header = ({
  leftButtonProps,
  rightButtonProps,
  customLeftButton,
  'data-test': dataTest,
  title,
  ...rest
}) => {
  const renderCloseButton = () => (
    <Left {...leftButtonProps} />
  );

  const renderCustomLeftButton = () => (
    <Styled.LeftWrapper>
      {customLeftButton}
    </Styled.LeftWrapper>
  );

  return (
    <Styled.Header data-test={dataTest ? dataTest : ''} {...rest}>
      { customLeftButton
        ? renderCustomLeftButton()
        : leftButtonProps
          ? renderCloseButton()
          : <div />}
      { title ? <Styled.Title>{title}</Styled.Title> : null}
      { rightButtonProps ? <Right {...rightButtonProps} /> : null}
    </Styled.Header>
  );
}

Header.propTypes = {
  leftButtonProps: PropTypes.object,
  rightButtonProps: PropTypes.object,
  customLeftButton: PropTypes.element,
  dataTest: PropTypes.string,
};

export default Header;
