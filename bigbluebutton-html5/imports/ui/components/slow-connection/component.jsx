import React, { Fragment } from 'react';
import cx from 'classnames';
import { styles } from './styles';

const SLOW_CONNECTIONS_TYPES = {
  critical: {
    level: styles.bad,
    bars: styles.oneBar,
  },
  danger: {
    level: styles.bad,
    bars: styles.twoBars,
  },
  warning: {
    level: styles.warning,
    bars: styles.threeBars,
  },
};

const SlowConnection = ({ children, effectiveConnectionType, iconOnly }) => (
  <Fragment>
    <div className={cx(styles.signalBars, styles.sizingBox, SLOW_CONNECTIONS_TYPES[effectiveConnectionType].level, SLOW_CONNECTIONS_TYPES[effectiveConnectionType].bars)}>
      <div className={cx(styles.firstBar, styles.bar)} />
      <div className={cx(styles.secondBar, styles.bar)} />
      <div className={cx(styles.thirdBar, styles.bar)} />
      <div className={cx(styles.fourthBar, styles.bar)} />
    </div>
    {!iconOnly ? (<span>{children}</span>) : null}
  </Fragment>
);

export default SlowConnection;
