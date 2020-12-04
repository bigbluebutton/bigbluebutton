import React from 'react';
import { FormattedMessage } from 'react-intl';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import cx from 'classnames';
import { styles } from './styles.scss';

const LAYOUT_CONFIG = Meteor.settings.public.layout;

export default (props) => {
  const { autoSwapLayout, hidePresentation } = props;
  return (
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
          <div className={cx(styles.defaultContent, {
            [styles.hideContent]: autoSwapLayout && hidePresentation,
          })}
          >
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
};
