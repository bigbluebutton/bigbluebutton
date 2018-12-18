import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { styles } from './styles.scss';

const propTypes = {
  overlayClassName: PropTypes.string.isRequired,
  portalClassName: PropTypes.string.isRequired,
  contentLabel: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const defaultProps = {
  className: styles.modal,
  overlayClassName: styles.overlay,
  portalClassName: styles.portal,
  contentLabel: 'Modal',
  isOpen: true,
};

export default class ModalBase extends Component {
  render() {
    if (!this.props.isOpen) return null;

    return (
      <ReactModal {...this.props}>
        {this.props.children}
      </ReactModal>
    );
  }
}

ModalBase.propTypes = propTypes;
ModalBase.defaultProps = defaultProps;

export const withModalState = ComponentToWrap =>
  class ModalStateWrapper extends Component {
    constructor(props) {
      super(props);

      this.state = {
        isOpen: true,
      };

      this.hide = this.hide.bind(this);
      this.show = this.show.bind(this);
    }

    hide(cb = () => {}) {
      Promise.resolve(cb())
        .then(() => this.setState({ isOpen: false }));
    }

    show(cb = () => {}) {
      Promise.resolve(cb())
        .then(() => this.setState({ isOpen: true }));
    }

    render() {
      return (<ComponentToWrap
        {...this.props}
        modalHide={this.hide}
        modalShow={this.show}
        modalisOpen={this.state.isOpen}
      />);
    }
  };
