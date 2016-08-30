import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import styles from '../styles';

export default class ClosedCaptionsMenu extends BaseMenu {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (
      <div className={styles.full} role='presentation'>
        <div className={styles.row} role='presentation'>
          <label><input className={styles.checkboxOffset} type='checkbox' tabIndex='7'
          aria-labelledby='closedCaptionsLabel' aria-describedby='closedCaptionsDesc' />
          Closed captions</label>
        </div>
      </div>
    );
  }
};
