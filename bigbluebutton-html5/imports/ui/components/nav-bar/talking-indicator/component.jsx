import React, { PureComponent } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';
import Service from './service';

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
  muteLabel: {
    id: 'app.actionsBar.muteLabel',
    description: 'indicator mute label for moderators',
  },
  moreThanMaxIndicatorsTalking: {
    id: 'app.talkingIndicator.moreThanMaxIndicatorsTalking',
    description: 'indicator label for all users who is talking but not visible',
  },
  moreThanMaxIndicatorsWereTalking: {
    id: 'app.talkingIndicator.moreThanMaxIndicatorsWereTalking',
    description: 'indicator label for all users who is not talking but not visible',
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
    const {
      intl,
      talkers,
      amIModerator,
      sidebarNavigationIsOpen,
      sidebarContentIsOpen,
      moreThanMaxIndicators,
    } = this.props;
    if (!talkers) return null;

    const talkingUserElements = Object.keys(talkers).map((id) => {
      const {
        talking,
        color,
        muted,
        callerName,
      } = talkers[`${id}`];

      const style = {
        [styles.talker]: true,
        [styles.spoke]: !talking,
        [styles.muted]: muted,
        [styles.mobileHide]: sidebarNavigationIsOpen
          && sidebarContentIsOpen,
        [styles.isViewer]: !amIModerator,
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
          onClick={() => this.handleMuteUser(id)}
          label={callerName}
          tooltipLabel={!muted && amIModerator
            ? `${intl.formatMessage(intlMessages.muteLabel)} ${callerName}`
            : null}
          data-test={talking ? 'isTalking' : 'wasTalking'}
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
          ) : null}
        </Button>
      );
    });

    const maxIndicator = () => {
      if (!moreThanMaxIndicators) return null;

      const nobodyTalking = Service.nobodyTalking(talkers);

      const style = {
        [styles.talker]: true,
        [styles.spoke]: nobodyTalking,
        // [styles.muted]: false,
        [styles.mobileHide]: sidebarNavigationIsOpen
          && sidebarContentIsOpen,
      };

      const { moreThanMaxIndicatorsTalking, moreThanMaxIndicatorsWereTalking } = intlMessages;

      const ariaLabel = intl.formatMessage(nobodyTalking
        ? moreThanMaxIndicatorsWereTalking : moreThanMaxIndicatorsTalking, {
        0: Object.keys(talkers).length,
      });

      return (
        <Button
          key={_.uniqueId('_has__More_')}
          className={cx(style)}
          onClick={() => {}} // maybe add a dropdown to show the rest of the users
          label="..."
          tooltipLabel={ariaLabel}
          aria-label={ariaLabel}
          color="primary"
          size="sm"
          style={{
            backgroundColor: '#4a148c',
            border: 'solid 2px #4a148c',
            cursor: 'default',
          }}
        />
      );
    };

    return (
      <div className={styles.isTalkingWrapper}>
        <div className={styles.speaking}>
          {talkingUserElements}
          {maxIndicator()}
        </div>
      </div>
    );
  }
}

export default injectIntl(TalkingIndicator);
