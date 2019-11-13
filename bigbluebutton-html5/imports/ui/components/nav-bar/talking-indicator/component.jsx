import React, { PureComponent } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Icon from '../../icon/component';
import { styles } from './styles';

class TalkingIndicator extends PureComponent {
  render() {
    const { talkers, muteUser, amIModerator } = this.props;
    if (!talkers) return null;

    const talkingUserElements = Object.keys(talkers).map((name) => {
      const {
        talking,
        color,
        voiceUserId,
        muted,
      } = talkers[`${name}`];

      const style = {
        [styles.talker]: true,
        [styles.spoke]: !talking,
        [styles.muted]: muted,
        [styles.unmuted]: !muted && amIModerator,
      };

      return (
        <div
          key={_.uniqueId(`${name}-`)}
          className={cx(style)}
          style={{
            backgroundColor: color,
          }}
          role="button"
          tabIndex={0}
          onClick={amIModerator ? () => {
            muteUser(voiceUserId);
          } : null}
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
