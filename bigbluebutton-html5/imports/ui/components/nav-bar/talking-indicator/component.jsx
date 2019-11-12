import React, { PureComponent } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Icon from '../../icon/component';
import { styles } from './styles';

class TalkingIndicator extends PureComponent {
  render() {
    const { talkers } = this.props;
    if (!talkers) return null;

    const talkingUserElements = Object.keys(talkers).map((name) => {
      const {
        talking,
        color,
      } = talkers[`${name}`];

      const style = {
        [styles.talker]: true,
        [styles.spoke]: !talking,
      };

      return (
        <div
          key={_.uniqueId(`${name}-`)}
          className={cx(style)}
          style={{
            backgroundColor: color,
          }}
        >
          <span>{`${name}`}</span>
          {talking ? <Icon iconName="unmute" /> : null}
        </div>
      );
    });

    return (
      <div className={styles.isTalkingWrapper}>
        <div className={styles.speaking}>
          {talkingUserElements}
        </div>
      </div>
    );
  }
}

export default TalkingIndicator;
