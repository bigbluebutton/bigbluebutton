import React, { Component, PropTypes } from 'react';
import { withModalBase } from '../base/component';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';
import cx from 'classnames';

const propTypes = {
  title: PropTypes.string.isRequired,
  dismiss: PropTypes.shape({
    callback: PropTypes.func,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
};

const defaultProps = {
  overlayClassName: styles.overlay,
  dismiss: {
    label: 'Close',
    description: 'Closes the modal',
  },
};

class ModalSimple extends Component {
  handleAction(name) {
    const action = this.props[name];
    this.props.close(action.callback);
  }

  render() {
    const {
      title,
      dismiss,
    } = this.props;

    return (
      <div>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.actions}>
            <Button
              className={styles.dismiss}
              onClick={() => this.props.hide(dismiss.callback)}
              label={dismiss.label}
              aria-describedby={'modalDismissDescription'}
              icon={'close'}
              size={'lg'}
              hideLabel={true}
              tabIndex={0} />
          </div>
        </header>
        <div className={styles.content}>
          {this.props.children}
        </div>
        <div id="modalDismissDescription" hidden>{dismiss.description}</div>
      </div>
    );
  }
};

ModalSimple.propTypes = propTypes;
ModalSimple.defaultProps = defaultProps;

export default withModalBase(ModalSimple);
