import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import {
  defineMessages, injectIntl, intlShape, FormattedMessage,
} from 'react-intl';
import { styles } from './styles';
import Assign from './assign-to-breakouts/container';

const propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
};

class BreakoutCreateModalComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      showPermissionsOvelay,
      closeModal,
    } = this.props;
    return (
      <span>
        {showPermissionsOvelay ? <PermissionsOverlay closeModal={closeModal} /> : null}
        <Modal
          overlayClassName={styles.overlay}
          className={styles.modal}
          onRequestClose={closeModal}
          hideBorder
          title="Create Channels"
        >
          <React.Fragment>
            <Assign closeModal={closeModal} />
          </React.Fragment>
        </Modal>
      </span>
    );
  }
}

BreakoutCreateModalComponent.propTypes = propTypes;
BreakoutCreateModalComponent.defaultProps = defaultProps;

export default injectIntl(BreakoutCreateModalComponent);
