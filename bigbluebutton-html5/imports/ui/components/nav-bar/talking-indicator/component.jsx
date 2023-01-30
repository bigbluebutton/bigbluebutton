import React, { PureComponent } from 'react';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
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
      moreThanMaxIndicators,
      users,
    } = this.props;
    if (!talkers) return null;

    const talkingUserElements = Object.keys(talkers).map((id) => {
      const {
        talking,
        color,
        transcribing,
        floor,
        muted,
        callerName,
      } = talkers[`${id}`];

      const user = users[id];

      const name = user?.name ?? callerName;

      const ariaLabel = intl.formatMessage(talking
        ? intlMessages.isTalking : intlMessages.wasTalking, {
        0: name,
      });

      let icon = talking ? 'unmute' : 'blank';
      icon = muted ? 'mute' : icon;

      return (
        <Styled.TalkingIndicatorWrapper
          key={_.uniqueId(`${name}-`)}
          muted={muted}
          talking={talking}
          floor={floor}
        >
          {transcribing && (
            <Styled.CCIcon
              iconName={muted ? 'closed_caption_stop' : 'closed_caption'}
              muted={muted}
              talking={talking}
            />
          )}
          <Styled.TalkingIndicatorButton
            $spoke={!talking || undefined}
            $muted={muted}
            $isViewer={!amIModerator || undefined}
            key={_.uniqueId(`${name}-`)}
            onClick={() => this.handleMuteUser(id)}
            label={name}
            tooltipLabel={!muted && amIModerator
              ? `${intl.formatMessage(intlMessages.muteLabel)} ${name}`
              : null}
            data-test={talking ? 'isTalking' : 'wasTalking'}
            aria-label={ariaLabel}
            aria-describedby={talking ? 'description' : null}
            color="primary"
            icon={icon}
            size="lg"
            style={{
              backgroundColor: color,
              border: `solid 2px ${color}`,
            }}
          >
            {talking ? (
              <Styled.Hidden id="description">
                {`${intl.formatMessage(intlMessages.ariaMuteDesc)}`}
              </Styled.Hidden>
            ) : null}
          </Styled.TalkingIndicatorButton>
        </Styled.TalkingIndicatorWrapper>
      );
    });

    const maxIndicator = () => {
      if (!moreThanMaxIndicators) return null;

      const nobodyTalking = Service.nobodyTalking(talkers);

      const { moreThanMaxIndicatorsTalking, moreThanMaxIndicatorsWereTalking } = intlMessages;

      const ariaLabel = intl.formatMessage(nobodyTalking
        ? moreThanMaxIndicatorsWereTalking : moreThanMaxIndicatorsTalking, {
        0: Object.keys(talkers).length,
      });

      return (
        <Styled.TalkingIndicatorButton
          $spoke={nobodyTalking}
          $muted={false}
          $isViewer={false}
          key={_.uniqueId('_has__More_')}
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
      <Styled.IsTalkingWrapper data-test="talkingIndicator">
        <Styled.Speaking>
          {talkingUserElements}
          {maxIndicator()}
        </Styled.Speaking>
      </Styled.IsTalkingWrapper>
    );
  }
}

export default injectIntl(TalkingIndicator);
