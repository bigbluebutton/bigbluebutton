import React from 'react';
import { withRouter } from 'react-router';
import Button from '/imports/ui/components/button/component';
import styles from './styles.scss';

const MeetingEnded = ({ router }) => (
  <div className={styles.parent}>
    <div className={styles.modal}>
      <div className={styles.content}>
        <h1 className={styles.title}>This session has ended</h1>
        <div className={styles.text}>
          You will be forwarded back to the home screen
        </div>
        <Button
          color="primary"
          className={styles.button}
          label="Okay"
          size="sm"
          onClick={() => router.push('/logout')}
        />
      </div>
    </div>
  </div>
);

export default withRouter(MeetingEnded);
