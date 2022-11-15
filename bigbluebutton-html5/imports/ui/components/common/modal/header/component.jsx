import React from 'react';
import Styled from './styles';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node.isRequired,
  hideBorder: PropTypes.bool,
  headerPosition: PropTypes.string,
  shouldShowCloseButton: PropTypes.bool,
  modalDismissDescription: PropTypes.string,
  closeButtonProps: PropTypes.shape({
    label: PropTypes.string,
    'aria-label': PropTypes.string,
    onClick: PropTypes.func,
  }),
};

const defaultProps = {
  hideBorder: true,
  headerPosition: 'inner',
  shouldShowCloseButton: true,
  modalDismissDescription: '',
  closeButtonProps: {},
};

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      children,
      closeButtonProps,
      headerPosition,
      hideBorder,
      modalDismissDescription,
      shouldShowCloseButton,
      ...other
    } = this.props;

    if (!shouldShowCloseButton && !children) return null;

    const headerOnTop = headerPosition === 'top';
    const innerHeader = headerPosition === 'inner';

    return (
      <Styled.Header
        $hideBorder={hideBorder}
        $headerOnTop={headerOnTop}
        $innerHeader={innerHeader}
        {...other}
      >
        <Styled.Title
          $hasMarginBottom={innerHeader}
          $headerOnTop={headerOnTop}
          $innerHeader={innerHeader}
        >
          {children}
        </Styled.Title>
        {shouldShowCloseButton ? (
          <Styled.DismissButton
            data-test="closeModal"
            icon="close"
            circle
            hideLabel
            aria-describedby="modalDismissDescription"
            $headerOnTop={headerOnTop}
            $innerHeader={innerHeader}
            {...closeButtonProps}
          />
        ) : null}
        <div id="modalDismissDescription" hidden>{modalDismissDescription}</div>
      </Styled.Header>
    );
  }
};

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;
