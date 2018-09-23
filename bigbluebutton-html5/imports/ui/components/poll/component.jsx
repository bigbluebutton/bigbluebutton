import React, { Component } from 'react';
import { Link } from 'react-router';
import Button from '/imports/ui/components/button/component';
import Icon from '/imports/ui/components/icon/component';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import { styles } from './styles.scss';

const intlMessages = defineMessages({
  pollPaneTitle: {
    id: 'app.poll.pollPaneTitle',
    description: 'heading label for the poll menu',
  },
  hidePollDesc: {
    id: 'app.poll.hidePollDesc',
    description: 'aria label description for hide poll button',
  },
  customPollLabel: {
    id: 'app.poll.customPollLabel',
    description: 'label for custom poll button',
  },
  startCustomLabel: {
    id: 'app.poll.startCustomLabel',
    description: 'label for button to start custom poll',
  },
  customPollInstruction: {
    id: 'app.poll.customPollInstruction',
    description: 'instructions for using custom poll',
  },
  quickPollInstruction: {
    id: 'app.poll.quickPollInstruction',
    description: 'instructions for using pre configured polls',
  },
  customPlaceholder: {
    id: 'app.poll.customPlaceholder',
    description: 'custom poll input field placeholder text',
  },
  truefalse: {
    id: 'app.poll.truefalse',
    description: 'label for true / false poll',
  },
  yesno: {
    id: 'app.poll.yesno',
    description: 'label for Yes / No poll',
  },
  ab: {
    id: 'app.poll.ab',
    description: 'label for A / B poll',
  },
  abc: {
    id: 'app.poll.abc',
    description: 'label for A / B / C poll',
  },
  abcd: {
    id: 'app.poll.abcd',
    description: 'label for A / B / C / D poll',
  },
  abcde: {
    id: 'app.poll.abcde',
    description: 'label for A / B / C / D / E poll',
  },
});

class Poll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customPollReq: false,
    };

    this.pollOptions = [];

    this.toggleCustomFields = this.toggleCustomFields.bind(this);
    this.renderQuickPollBtns = this.renderQuickPollBtns.bind(this);
    this.renderCustomInputs = this.renderCustomInputs.bind(this);
    this.setCustomInputStrings = this.setCustomInputStrings.bind(this);
    this.getCustomInputs = this.getCustomInputs.bind(this);
    this.getCustomInput = this.getCustomInput.bind(this);
  }

  getCustomInputs(fn, amount) {
    const inputs = [];
    while (amount--) inputs.push(fn());
    return inputs;
  }

  getCustomInput() {
    const { intl } = this.props;
    return (
      <input
        key={_.uniqueId('custom-poll-')}
        placeholder={intl.formatMessage(intlMessages.customPlaceholder)}
      />
    );
  }

  setCustomInputStrings(menu) {
    this.pollOptions = [];

    for (let i = 0; i < (menu.children.length - 1); i++) {
      this.pollOptions.push(menu.children[i].value === '' ? null : menu.children[i].value);
    }

    this.pollOptions = this.pollOptions.filter(option => option);
  }

  toggleCustomFields() {
    const { customPollReq } = this.state;
    customPollReq ? this.setState({ customPollReq: false }) : this.setState({ customPollReq: true });
  }

  renderQuickPollBtns() {
    const { pollTypes, startPoll, intl } = this.props;
    const btns = [];

    Object.entries(pollTypes).forEach(([key, value]) => {
      let label = '';

      switch (key) {
        case 'YN': label = intl.formatMessage(intlMessages.yesno); break;
        case 'TF': label = intl.formatMessage(intlMessages.truefalse); break;
        case 'A2': label = intl.formatMessage(intlMessages.ab); break;
        case 'A3': label = intl.formatMessage(intlMessages.abc); break;
        case 'A4': label = intl.formatMessage(intlMessages.abcd); break;
        case 'A5': label = intl.formatMessage(intlMessages.abcde); break;
        default: break;
      }

      btns.push(<Button
        label={label}
        color="primary"
        className={styles.pollBtn}
        key={_.uniqueId('quick-poll-')}
        onClick={() => { startPoll(value); }}
      />);
    });

    return btns;
  }

  renderCustomInputs() {
    const { intl } = this.props;
    const MAX_POLL_CHOICES = 5;

    return (
      <div
        className={styles.customInputWrapper}
        ref={(node) => { this.customInputWrapper = node; }}
      >
        { this.getCustomInputs(this.getCustomInput, MAX_POLL_CHOICES) }
        <Button
          onClick={() => { this.setCustomInputStrings(this.customInputWrapper); }}
          label={intl.formatMessage(intlMessages.startCustomLabel)}
        />
      </div>
    );
  }

  render() {
    const { intl } = this.props;
    const { customPollReq } = this.state;

    return (
      <div className={styles.pollmenu}>
        <header className={styles.header}>
          <Link
            to="/users"
            role="button"
            aria-label={intl.formatMessage(intlMessages.hidePollDesc)}
          >
            <Icon iconName="left_arrow" />{intl.formatMessage(intlMessages.pollPaneTitle)}
          </Link>
        </header>

        <div className={styles.instructions}>
          {intl.formatMessage(intlMessages.quickPollInstruction)}
        </div>

        <div className={styles.grid}>
          {this.renderQuickPollBtns()}
        </div>

        <div className={styles.instructions}>
          {intl.formatMessage(intlMessages.customPollInstruction)}
        </div>

        <Button
          className={styles.customBtn}
          color="primary"
          onClick={this.toggleCustomFields}
          label={intl.formatMessage(intlMessages.customPollLabel)}
        />

        {!customPollReq ? null : this.renderCustomInputs()}
      </div>
    );
  }
}

export default injectIntl(Poll);
