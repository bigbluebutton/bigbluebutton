import React, { PureComponent } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '../../icon/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  wasTalking: {
    id: 'app.talkingIndicator.wasTalking',
    description: 'aria label for user who is not talking but still visible',
  },
  isTalking: {
    id: 'app.talkingIndicator.isTalking',
    description: 'aria label for user currently talking',
  },
  ariaMuteDesc: {
    id: 'app.talkingIndicator.ariaMuteDesc',
    description: 'aria description for muting a user',
  },
});

class TalkingIndicator extends PureComponent {
  handleMuteUser(id) {
    const { muteUser, amIModerator } = this.props;
    if (!amIModerator) return;
    muteUser(id);
  }

  render() {
    const { intl, talkers, amIModerator } = this.props;
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

      const ariaLabel = talking ? intl.formatMessage(intlMessages.isTalking, {
        0: name,
      }) : intl.formatMessage(intlMessages.wasTalking, {
        0: name,
      });

      return (
        <div
          key={_.uniqueId(`${name}-`)}
          role="button"
          tabIndex={0}
          className={cx(style)}
          aria-label={ariaLabel}
          aria-describedby={talking ? 'description' : null}
          style={{
            backgroundColor: color,
          }}
          onClick={() => this.handleMuteUser(voiceUserId)}
          onKeyPress={() => this.handleMuteUser(voiceUserId)}
        >
          <span>{`${name}`}</span>
          {talking ? <Icon iconName="unmute" /> : null}
          {talking ? <div id="description" className={styles.hidden}>{`${intl.formatMessage(intlMessages.ariaMuteDesc)}`}</div> : null}
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

export default injectIntl(TalkingIndicator);
