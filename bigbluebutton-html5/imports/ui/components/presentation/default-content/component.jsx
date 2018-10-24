import React from 'react';
import { FormattedMessage } from 'react-intl';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { styles } from './styles.scss';

export default () => (
  <TransitionGroup>
    <CSSTransition
      classNames={{
          appear: styles.appear,
          appearActive: styles.appearActive,
        }}
      appear
      enter={false}
      exit={false}
      timeout={{ enter: 400 }}
      className={styles.contentWrapper}
    >
      <div className={styles.content}>
        <div className={styles.defaultContent}>
          <p>
            <FormattedMessage
              id="app.home.greeting"
              description="Message to greet the user."
              defaultMessage="Your presentation will begin shortly..."
            />
            <br />
          </p>
        </div>
      </div>
    </CSSTransition>
  </TransitionGroup>
);
