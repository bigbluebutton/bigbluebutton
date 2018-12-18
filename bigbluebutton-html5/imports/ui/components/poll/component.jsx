import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import { Session } from 'meteor/session';
import Button from '/imports/ui/components/button/component';
import LiveResult from './live-result/component';
import { styles } from './styles.scss';

const intlMessages = defineMessages({
  pollPaneTitle: {
    id: 'app.poll.pollPaneTitle',
    description: 'heading label for the poll menu',
  },
  closeLabel: {
    id: 'app.poll.closeLabel',
    description: 'label for poll pane close button',
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
  activePollInstruction: {
    id: 'app.poll.activePollInstruction',
    description: 'instructions displayed when a poll is active',
  },
  customPlaceholder: {
    id: 'app.poll.customPlaceholder',
    description: 'custom poll input field placeholder text',
  },
  tf: {
    id: 'app.poll.tf',
    description: 'label for true / false poll',
  },
  yn: {
    id: 'app.poll.yn',
    description: 'label for Yes / No poll',
  },
  a2: {
    id: 'app.poll.a2',
    description: 'label for A / B poll',
  },
  a3: {
    id: 'app.poll.a3',
    description: 'label for A / B / C poll',
  },
  a4: {
    id: 'app.poll.a4',
    description: 'label for A / B / C / D poll',
  },
  a5: {
    id: 'app.poll.a5',
    description: 'label for A / B / C / D / E poll',
  },
});

const MAX_CUSTOM_FIELDS = Meteor.settings.public.poll.max_custom;

class Poll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customPollReq: false,
      isPolling: false,
      customPollValues: [],
    };

    this.inputEditor = [];

    this.toggleCustomFields = this.toggleCustomFields.bind(this);
    this.renderQuickPollBtns = this.renderQuickPollBtns.bind(this);
    this.renderCustomView = this.renderCustomView.bind(this);
    this.renderInputFields = this.renderInputFields.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleBackClick = this.handleBackClick.bind(this);
  }

  componentDidUpdate() {
    const { currentUser } = this.props;

    if (!currentUser.presenter) {
      Session.set('openPanel', 'userlist');
      Session.set('forcePollOpen', false);
    }
  }


  handleInputChange(index, event) {
    // This regex will replace any instance of 2 or more consecutive white spaces
    // with a single white space character.
    const option = event.target.value.replace(/\s{2,}/g, ' ').trim();
    this.inputEditor[index] = option === '' ? '' : option;
    this.setState({ customPollValues: this.inputEditor });
  }

  handleBackClick() {
    const { stopPoll } = this.props;

    stopPoll();
    this.inputEditor = [];
    this.setState({
      isPolling: false,
      customPollValues: this.inputEditor,
    }, document.activeElement.blur());
  }

  toggleCustomFields() {
    const { customPollReq } = this.state;

    this.inputEditor = [];

    return this.setState({ customPollReq: !customPollReq });
  }

  renderQuickPollBtns() {
    const { pollTypes, startPoll, intl } = this.props;

    const btns = pollTypes.map((type) => {
      if (type === 'custom') return;

      const label = intl.formatMessage(
        // regex removes the - to match the message id
        intlMessages[type.replace(/-/g, '').toLowerCase()],
      );

      return (
        <Button
          label={label}
          color="default"
          className={styles.pollBtn}
          key={_.uniqueId('quick-poll-')}
          onClick={() => {
            this.setState({ isPolling: true }, () => startPoll(type));
          }}
        />);
    });

    return btns;
  }

  renderCustomView() {
    const { intl, startCustomPoll } = this.props;
    const isDisabled = _.compact(this.inputEditor).length < 2;

    return (
      <div className={styles.customInputWrapper}>
        {this.renderInputFields()}
        <Button
          onClick={() => {
            if (this.inputEditor.length > 1) {
              this.setState({ isPolling: true }, () => startCustomPoll('custom', _.compact(this.inputEditor)));
            }
          }}
          label={intl.formatMessage(intlMessages.startCustomLabel)}
          color="primary"
          aria-disabled={isDisabled}
          className={styles.btn}
        />
      </div>
    );
  }

  renderInputFields() {
    const { intl } = this.props;
    const { customPollValues } = this.state;
    let items = [];

    items = _.range(1, MAX_CUSTOM_FIELDS + 1).map((ele, index) => {
      const id = index;
      return (
        <input
          key={`custom-poll-${id}`}
          placeholder={intl.formatMessage(intlMessages.customPlaceholder)}
          className={styles.input}
          onChange={event => this.handleInputChange(id, event)}
          defaultValue={customPollValues[id]}
        />
      );
    });

    return items;
  }

  renderActivePollOptions() {
    const {
      intl, publishPoll, stopPoll, currentUser, currentPoll, getUser,
    } = this.props;

    return (
      <div>
        <div className={styles.instructions}>
          {intl.formatMessage(intlMessages.activePollInstruction)}
        </div>
        <LiveResult
          {...{
            publishPoll,
            stopPoll,
            currentUser,
            getUser,
            currentPoll,
          }}
          handleBackClick={this.handleBackClick}
        />
      </div>
    );
  }

  renderPollOptions() {
    const { intl } = this.props;
    const { customPollReq } = this.state;

    return (
      <div>
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
          color="default"
          onClick={this.toggleCustomFields}
          label={intl.formatMessage(intlMessages.customPollLabel)}
        />
        {!customPollReq ? null : this.renderCustomView()}
      </div>
    );
  }

  render() {
    const {
      intl, stopPoll, currentPoll, currentUser,
    } = this.props;

    const { isPolling } = this.state;

    if (!currentUser.presenter) return null;

    return (
      <div>
        <header className={styles.header}>
          <Button
            tabIndex={0}
            label={intl.formatMessage(intlMessages.pollPaneTitle)}
            icon="left_arrow"
            aria-label={intl.formatMessage(intlMessages.hidePollDesc)}
            className={styles.hideBtn}
            onClick={() => {
              Session.set('openPanel', 'userlist');
            }}
          />

          <Button
            label={intl.formatMessage(intlMessages.closeLabel)}
            onClick={() => {
              if (currentPoll) {
                stopPoll();
              }
              Session.set('openPanel', 'userlist');
              Session.set('forcePollOpen', false);
            }}
            className={styles.closeBtn}
            icon="close"
            size="sm"
            hideLabel
          />

        </header>
        {
          (isPolling || (!isPolling && currentPoll))
            ? this.renderActivePollOptions() : this.renderPollOptions()
        }
      </div>
    );
  }
}

export default injectIntl(Poll);

Poll.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.instanceOf(Object).isRequired,
  pollTypes: PropTypes.instanceOf(Array).isRequired,
  startPoll: PropTypes.func.isRequired,
  startCustomPoll: PropTypes.func.isRequired,
  stopPoll: PropTypes.func.isRequired,
  publishPoll: PropTypes.func.isRequired,
};
