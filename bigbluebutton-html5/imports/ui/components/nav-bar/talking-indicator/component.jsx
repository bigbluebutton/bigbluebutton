import React, { PureComponent } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
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
    const { muteUser, amIModerator, isBreakoutRoom } = this.props;
    // only allow moderator muting anyone in non-breakout
    if (!amIModerator || isBreakoutRoom) return;
    muteUser(id);
  }

  render() {
    const { intl, talkers, openPanel } = this.props;
    if (!talkers) return null;

    const talkingUserElements = Object.keys(talkers).map((id) => {
      const {
        talking,
        color,
        voiceUserId,
        muted,
        callerName,
      } = talkers[`${id}`];

      const style = {
        [styles.talker]: true,
        [styles.spoke]: !talking,
        [styles.muted]: muted,
        [styles.mobileHide]: openPanel !== '',
      };

      const ariaLabel = intl.formatMessage(talking
        ? intlMessages.isTalking : intlMessages.wasTalking, {
        0: callerName,
      });

      let icon = talking ? 'unmute' : 'blank';
      icon = muted ? 'mute' : icon;

      return (
        <Button
          key={_.uniqueId(`${callerName}-`)}
          className={cx(style)}
          onClick={() => this.handleMuteUser(voiceUserId)}
          label={callerName}
          aria-label={ariaLabel}
          aria-describedby={talking ? 'description' : null}
          color="primary"
          icon={icon}
          size="sm"
          style={{
            backgroundColor: color,
            border: `solid 2px ${color}`,
          }}
        >
          {talking ? (
            <div id="description" className={styles.hidden}>
              {`${intl.formatMessage(intlMessages.ariaMuteDesc)}`}
            </div>
          ) : null
          }
        </Button>
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
