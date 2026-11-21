import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Styled from './styles';
import Left from './left/component';
import Right from './right/component';

const Header = ({
  leftButtonProps,
  rightButtonProps,
  customRightButton,
  title,
  className,
  'data-test': dataTest,
  ...rest
}) => {

  return (
    <Styled.Header
      className={cx('bbb-panel-header', className)}
      data-test={dataTest ? dataTest : ''}
      {...rest}
    >
      <Styled.Title className="bbb-panel-header__title">{title}</Styled.Title>
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
  className: PropTypes.string,
  dataTest: PropTypes.string,
};

export default Header;
