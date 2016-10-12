import React from 'react';
import Button from '/imports/ui/components/button/component';
import { clearModal } from '/imports/ui/components/app/service';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import styles from '../styles.scss';

export default class ListenOnly extends React.Component {
  constructor(props) {
    super(props);

    this.chooseAudio = this.chooseAudio.bind(this);
  }

  chooseAudio() {
    this.props.changeMenu(this.props.CHOOSE_MENU);
  }


  render() {
    return (
      <div>
        <div className={styles.center}>
          <Button className={styles.backBtn}
            label={'Back'}
            icon={'left-arrow'}
            size={'sm'}
            hideLabel={false}
            onClick={this.chooseAudio}
          />
          <div>
            Listen only message
          </div>
        </div>
        <div>
          Content goes here
        </div>
      </div>
    );
  }
};
