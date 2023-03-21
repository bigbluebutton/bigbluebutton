import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';
import { registerTitleView, unregisterTitleView } from '/imports/utils/dom-utils';

const propTypes = {
  overlayClassName: PropTypes.string.isRequired,
  portalClassName: PropTypes.string.isRequired,
  contentLabel: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const defaultProps = {
  overlayClassName: 'modalOverlay',
  contentLabel: 'Modal',
  isOpen: true,
};

export default class ModalBase extends Component {

  componentDidMount() {
    registerTitleView(this.props.contentLabel);
  }

  componentWillUnmount() {
    unregisterTitleView();
  }

  render() {
    const {
      isOpen,
      'data-test': dataTest,
    } = this.props;

    if (!isOpen) return null;

    return (
      <Styled.BaseModal
        {...this.props}
        parentSelector={() => {
          if (document.fullscreenElement &&
            document.fullscreenElement.nodeName &&
            document.fullscreenElement.nodeName.toLowerCase() === 'div')
            return document.fullscreenElement;
          else return document.body;
        }}
        data={{
          test: dataTest ?? null,
        }}
      >
        {this.props.children}
      </Styled.BaseModal>
    );
  }
}

ModalBase.propTypes = propTypes;
ModalBase.defaultProps = defaultProps;
