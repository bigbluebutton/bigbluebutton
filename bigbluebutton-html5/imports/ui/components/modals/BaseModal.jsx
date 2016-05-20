import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import styles from './styles';
import classNames from 'classnames';

const customStyles = {
  overlay: {
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export default class BaseModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      title: props.title || 'title',
      content: <div>hello</div>,
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleModalCloseRequest = this.handleModalCloseRequest.bind(this);
    this.handleSaveClicked = this.handleSaveClicked.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.setTitle = this.setTitle.bind(this);
  }

  setTitle(title) {
    this.setState({ title: title });
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  afterOpenModal() {}

  handleModalCloseRequest() {
    // opportunity to validate something and keep the modal open even if it
    // requested to be closed
    this.setState({ modalIsOpen: false });
  }

  handleSaveClicked(e) {
    alert('Save button was clicked');
  }

  getContent() {
    return (<div>parent content</div>);
  }

  render() {
    return (
      <span>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          shouldCloseOnOverlayClick={false}
          style={customStyles} >

          <span className={classNames(styles.modalHeaderTitle, 'largeFont')}>
            {this.state.title}
          </span>
          <span className={styles.modalHeaderButtonContainer}>
            <button className={classNames(styles.modalButton, styles.close)}
              onClick={this.closeModal}>
              Cancel
            </button>
            <button className={classNames(styles.modalButton, styles.done)}
              onClick={this.closeModal}>
              Done
            </button>
          </span>
          <hr className={styles.modalHorizontalRule} />
          <div>
            {this.getContent()}
          </div>
        </Modal>
      </span>
    );
  }
};
