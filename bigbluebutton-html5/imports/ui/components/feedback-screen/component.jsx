import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ModalBase from '/imports/ui/components/modal/base/component';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Rating from './rating/component';
import { withRouter } from 'react-router';
import { styles } from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.feedback.title',
    description: 'Join mic audio button label',
  },
  subtitle: {
    id: 'app.feedback.subtitle',
    description: 'Join mic audio button label',
  },
  textarea: {
    id: 'app.feedback.textarea',
    description: 'Join mic audio button label',
  },
  confirmLabel: {
    id: 'app.leaveConfirmation.confirmLabel',
    description: 'Confirmation button label',
  },
  confirmDesc: {
    id: 'app.leaveConfirmation.confirmDesc',
    description: 'adds context to confim option',
  },
});

class FeedbackScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: 0,
    };
  }

  render() {
    const {
      intl,
      router,
    } = this.props;

    return (
      <span>
        <ModalBase
          overlayClassName={styles.overlay}
          className={styles.modal}
        >
          <header
            className={styles.header}
          >
            <h3 className={styles.title}>
              {intl.formatMessage(intlMessages.title)}
              <div className={styles.separator} />
            </h3>
          </header>
          <div className={styles.content}>
            <h4 className={styles.subtitle}>
              {intl.formatMessage(intlMessages.subtitle)}
            </h4>
            <div className={styles.banana}>
              <Rating
                numberStar="5"
                selected={this.state.selected}
                onRate={(starNumber) => {
                  this.setState({
                    selected: starNumber,
                  });
                }}
              />
              <textarea
                cols="30"
                rows="5"
                disabled={this.state.selected === 0}
                className={styles.textarea}
                placeholder={intl.formatMessage(intlMessages.textarea)}
              />
            </div>
            <div>
              <Button
                color="primary"
                onClick={() => router.push('/logout')}
                label={intl.formatMessage(intlMessages.confirmLabel)}
                description={intl.formatMessage(intlMessages.confirmDesc)}
              />
            </div>
          </div>
        </ModalBase>
      </span>
    );
  }
}

export default withRouter(injectIntl(FeedbackScreen));
