import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseMenu from '../base/component';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import styles from '../styles.scss';
import Toggle from '/imports/ui/components/switch/component';

export default class ApplicationMenu extends BaseMenu {
  constructor(props) {
    super(props);

    console.log('application', props);
  }

  render() {
    return (
      <div className={styles.tabContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>Application</h3>
        </div>
        <div className={styles.form}>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Audio notifications for chat
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Toggle
                icons={false}
                defaultChecked={true}
                onChange={this.handleBaconChange} />
              </div>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Push notifications for chat
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Toggle
                icons={false}
                defaultChecked={true}
                onChange={this.handleBaconChange} />
              </div>
            </div>
          </div>
          <hr className={styles.separator}/>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formElement}>
                <label className={styles.label}>
                  Font size
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentCenter)}>
                <label className={cx(styles.label, styles.bold)}>
                  32pt
                </label>
              </div>
            </div>
            <div className={styles.col}>
              <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Button
                onClick={this.props.handleIncreaseFontSize}
                icon={'circle-add'}
                circle={true}
                tabIndex={9}
                hideLabel={true}
                label={'Increase Font'}
                aria-labelledby={'sizeUpLabel'}
                aria-describedby={'sizeUpDesc'}
              />
              <div id='sizeUpLabel' hidden>Font size up</div>
              <div id='sizeUpDesc' hidden>
                Increases the font size of the application.</div>
              <Button
                onClick={this.props.handleDecreaseFontSize}
                icon={'circle-minus'}
                circle={true}
                tabIndex={10}
                hideLabel={true}
                label={'Decrease Font'}
                aria-labelledby={'sizeDownLabel'}
                aria-describedby={'sizeDownDesc'}
              />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
