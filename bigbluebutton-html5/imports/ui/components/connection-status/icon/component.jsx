import React, { Fragment } from 'react';
import cx from 'classnames';
import { styles } from './styles';

const STATS = {
  critical: {
    color: styles.critical,
    bars: styles.oneBar,
  },
  danger: {
    color: styles.danger,
    bars: styles.twoBars,
  },
  warning: {
    color: styles.warning,
    bars: styles.threeBars,
  },
  normal: {
    color: styles.normal,
    bars: styles.fourBars,
  },
};

const Icon = ({ level, grayscale }) => {
  const color = grayscale ? styles.normal : STATS[level].color;

  return (
    <Fragment>
      <div className={cx(styles.signalBars, color, STATS[level].bars)}>
        <div className={cx(styles.firstBar, styles.bar)} />
        <div className={cx(styles.secondBar, styles.bar)} />
        <div className={cx(styles.thirdBar, styles.bar)} />
        <div className={cx(styles.fourthBar, styles.bar)} />
      </div>
    </Fragment>
  );
};

export default Icon;
