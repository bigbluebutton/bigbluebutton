import React from 'react';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import ModalBase from '../modal/base/component';
import { clearModal } from '/imports/ui/components/app/service';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import styles from './styles.scss';

export default class Audio extends React.Component {
  constructor(props) {
    super(props);

    this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
    this.setState({ isOpen: false });
    clearModal();
  }

  handleClick() {
  }

  render() {
    return (
      <ModalBase
        isOpen={true}
        onHide={null}
        onShow={null}
        className={styles.inner}>
          <div className={styles.center}>
            <Button className={styles.closeBtn}
              label={'Close'}
              icon={'close'}
              size={'lg'}
              circle={true}
              hideLabel={true}
              onClick={this.handleClose}
            />
            <div>
              How would you like to join the audio?
            </div>
          </div>
          <div className={styles.center}>
            <Button className={styles.audioBtn}
              label={'Audio'}
              icon={'audio'}
              circle={true}
              size={'jumbo'}
              onClick={this.handleClick}
            />
            <Button className={styles.audioBtn}
              label={'Listen Only'}
              icon={'listen'}
              circle={true}
              size={'jumbo'}
              onClick={this.handleClick}
            />
          </div>
      </ModalBase>
    );
  }
};
