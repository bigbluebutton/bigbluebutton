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
    padding: 10,
    height: '40%',
    overflow: 'hidden',
    minHeight: '250px',
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
          style={ customStyles } >

          <div style={{ name: 'settingsTop' }} className={styles.settingsMenuTop}>
            <div style={{ height: '70%' }}>
              <span className={classNames(styles.modalHeaderTitle, 'largeFont')}>
                {this.state.title}
              </span>
              <span className={styles.modalHeaderButtonContainer}>
                <Button style={{ borderRadius: '18px', width: '90px', marginRight: '10px',
                    border: 'none', boxShadow: 'none', }}
                  label={'Cancel'}
                  color={'primary'}
                  ghost={true}
                  onClick={this.closeModal}
                />
              <Button style={{ borderRadius: '18px', width: '90px',
                border: 'none', boxShadow: 'none', }}
                  label={'Done'}
                  color={'primary'}
                  onClick={this.closeModal}
                />
              </span>
            </div>
            <div style={{ height: '30%' }}>
            </div>
          </div>
          <div style={{ name: 'settingsBottom' }} className={styles.settingsMenuBottom}>
            {this.getContent()}
          </div>
        </Modal>
      </span>
    );
  }
};
