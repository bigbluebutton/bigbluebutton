import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import styles from './styles';
import classNames from 'classnames';

const customStyles = {
  overlay: {
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '10px',
    height: '40%',
    overflow: 'hidden',
    minHeight: '290px',
  },
};

export default class BaseModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // You need to set isOpen={true} on the modal component for it to render its children.
      modalIsOpen: true,
      title: props.title || 'title',
      content: <div>hello</div>,
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
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

  getContent() {
    return (<div>parent content</div>);
  }

  render() {
    return (
      <span>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          shouldCloseOnOverlayClick={false}
          style={customStyles} >
          <div className={styles.settingsMenuTop} role='presentation'>
            <div className={classNames(styles.modalHeaderTitle, 'largeFont')}>
              {this.state.title}
            </div>
            <div className={styles.modalHeaderButtonContainer} role='presentation'>
              <Button className={styles.modalBtn}
                label={'Cancel'}
                color={'primary'}
                ghost={true}
                onClick={this.closeModal}
                tabIndex={1}
                aria-labelledby={'cancelLabel'}
                aria-describedby={'cancelDesc'}
              />
              <Button className={styles.modalBtn}
                label={'Done'}
                color={'primary'}
                onClick={this.closeModal}
                tabIndex={2}
                aria-labelledby={'doneLabel'}
                aria-describedby={'doneDesc'}
              />
              <div id='cancelLabel' hidden>Cancel</div>
              <div id='cancelDesc' hidden>Disregards changes and closes the settings menu.</div>
              <div id='doneLabel' hidden>Done</div>
              <div id='doneDesc' hidden>Saves changes and closes the settings menu.</div>
            </div>
          </div>
          <div className={styles.settingsMenuBottom}  role='presentation'>
            {this.getContent()}
          </div>
        </Modal>
      </span>
    );
  }
};
