import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';
import { styles } from './styles';
import  EditBreakout from './edit-breakout/container';

const propTypes = {
  
};

const defaultProps = {
};

class BreakoutEditModalComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      showPermissionsOvelay,
      closeModal,
      breakoutId,
      name,
    } = this.props;
    console.log(name);
    
    return (
      <span>
        {showPermissionsOvelay ? <PermissionsOverlay closeModal={closeModal} /> : null}
        <Modal
          overlayClassName={styles.overlay}
          className={styles.modal}
          onRequestClose={closeModal}
          hideBorder
        >
          <React.Fragment>
           <EditBreakout  breakoutId={breakoutId} name={name} closeModal={closeModal}/>
          </React.Fragment>
        </Modal>
      </span>
    );
  }
}

BreakoutEditModalComponent.propTypes = propTypes;
BreakoutEditModalComponent.defaultProps = defaultProps;

export default injectIntl(BreakoutEditModalComponent);
