import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Styled from './styles';
import { notify } from '/imports/ui/services/notification';

const ASK_MODERATOR = 'ASK_MODERATOR';
const ALWAYS_ACCEPT = 'ALWAYS_ACCEPT';
const ALWAYS_DENY = 'ALWAYS_DENY';

const intlMessages = defineMessages({
  ariaModalTitle: {
    id: 'app.guest-policy.ariaTitle',
    description: 'Guest policy aria title',
  },
  guestPolicyTitle: {
    id: 'app.guest-policy.title',
    description: 'Guest policy title',
  },
  guestPolicyDescription: {
    id: 'app.guest-policy.description',
    description: 'Guest policy description',
  },
  policyBtnDesc: {
    id: 'app.guest-policy.policyBtnDesc',
    description: 'aria description for guest policy button',
  },
  askModerator: {
    id: 'app.guest-policy.button.askModerator',
    description: 'Ask moderator button label',
  },
  alwaysAccept: {
    id: 'app.guest-policy.button.alwaysAccept',
    description: 'Always accept button label',
  },
  alwaysDeny: {
    id: 'app.guest-policy.button.alwaysDeny',
    description: 'Always deny button label',
  },
  feedbackMessage: {
    id: 'app.guest-policy.feedbackMessage',
    description: 'Feedback message for guest policy change',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  guestPolicy: PropTypes.string.isRequired,
  changeGuestPolicy: PropTypes.func.isRequired,
};

class GuestPolicyComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.handleChangePolicy = this.handleChangePolicy.bind(this);
  }

  componentWillUnmount() {
    const { setIsOpen } = this.props;

    setIsOpen(false);
  }

  handleChangePolicy(policyRule, messageId) {
    const { intl, changeGuestPolicy } = this.props;

    changeGuestPolicy(policyRule);

    notify(intl.formatMessage(intlMessages.feedbackMessage) + intl.formatMessage(messageId), 'success');
  }

  render() {
    const {
      setIsOpen,
      intl,
      guestPolicy,
      isOpen,
      onRequestClose,
      priority,
    } = this.props;

    return (
      <Styled.GuestPolicyModal
        onRequestClose={() => setIsOpen(false)}
        contentLabel={intl.formatMessage(intlMessages.ariaModalTitle)}
        title={intl.formatMessage(intlMessages.guestPolicyTitle)}
        {...{
          isOpen,
          onRequestClose,
          priority,
        }}
      >
        <Styled.Container
          data-test="guestPolicySettingsModal"
        >
          <Styled.Description>
            {intl.formatMessage(intlMessages.guestPolicyDescription)}
          </Styled.Description>

          <Styled.Content>
            <Styled.GuestPolicyButton
              color="primary"
              disabled={guestPolicy === ASK_MODERATOR}
              label={intl.formatMessage(intlMessages.askModerator)}
              aria-describedby={guestPolicy === ASK_MODERATOR ? 'selected-btn-desc' : 'policy-btn-desc'}
              aria-pressed={guestPolicy === ASK_MODERATOR}
              data-test="askModerator"
              onClick={() => {
                this.handleChangePolicy(ASK_MODERATOR, intlMessages.askModerator);
                setIsOpen(false);
              }}
            />
            <Styled.GuestPolicyButton
              color="primary"
              disabled={guestPolicy === ALWAYS_ACCEPT}
              label={intl.formatMessage(intlMessages.alwaysAccept)}
              aria-describedby={guestPolicy === ALWAYS_ACCEPT ? 'selected-btn-desc' : 'policy-btn-desc'}
              aria-pressed={guestPolicy === ALWAYS_ACCEPT}
              data-test="alwaysAccept"
              onClick={() => {
                this.handleChangePolicy(ALWAYS_ACCEPT, intlMessages.alwaysAccept);
                setIsOpen(false);
              }}
            />
            <Styled.GuestPolicyButton
              color="primary"
              disabled={guestPolicy === ALWAYS_DENY}
              label={intl.formatMessage(intlMessages.alwaysDeny)}
              aria-describedby={guestPolicy === ALWAYS_DENY ? 'selected-btn-desc' : 'policy-btn-desc'}
              aria-pressed={guestPolicy === ALWAYS_DENY}
              data-test="alwaysDeny"
              onClick={() => {
                this.handleChangePolicy(ALWAYS_DENY, intlMessages.alwaysDeny);
                setIsOpen(false);
              }}
            />
          </Styled.Content>
          <div id="policy-btn-desc" aria-hidden className="sr-only">
            {intl.formatMessage(intlMessages.policyBtnDesc)}
          </div>
        </Styled.Container>
      </Styled.GuestPolicyModal>
    );
  }
}

GuestPolicyComponent.propTypes = propTypes;

export default injectIntl(GuestPolicyComponent);
