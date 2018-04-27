import React, { Component } from 'react';
import ModalBase from '/imports/ui/components/modal/base/component';
import Button from '/imports/ui/components/button/component';
import Auth from '/imports/ui/services/auth';
import { log } from '/imports/ui/services/api';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles';
import Rating from './rating/component';


const intlMessages = defineMessages({
  title: {
    id: 'app.feedback.title',
    description: 'title for feedback screen',
  },
  subtitle: {
    id: 'app.feedback.subtitle',
    description: 'subtitle for feedback screen',
  },
  textarea: {
    id: 'app.feedback.textarea',
    description: 'placeholder for textarea',
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
  static getComment() {
    const textarea = document.getElementById('feedbackComment');
    const comment = textarea.value;
    return comment;
  }

  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
    };
    this.setSelectedStar = this.setSelectedStar.bind(this);
    this.sendFeedback = this.sendFeedback.bind(this);
  }
  setSelectedStar(starNumber) {
    this.setState({
      selected: starNumber,
    });
  }
  sendFeedback() {
    const {
      selected,
    } = this.state;

    const {
      router,
      userName,
    } = this.props;

    if (selected <= 0) {
      router.push('/logout');
      return;
    }

    const message = {
      rating: selected,
      userId: Auth.userID,
      meetingId: Auth.meetingID,
      comment: FeedbackScreen.getComment(),
      userName,
    };

    log('info', JSON.stringify(message));
    router.push('/logout');
  }


  render() {
    const {
      intl,
    } = this.props;

    return (
      <span>
        <ModalBase
          overlayClassName={styles.overlay}
          className={styles.modal}
          contentLabel={intl.formatMessage(intlMessages.title)}
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
            <div className={styles.rating}>
              <Rating
                total="5"
                onRate={this.setSelectedStar}
              />
              <textarea
                cols="30"
                rows="5"
                id="feedbackComment"
                disabled={this.state.selected === 0}
                className={styles.textarea}
                placeholder={intl.formatMessage(intlMessages.textarea)}
                aria-describedby="textareaDesc"
              />
            </div>
            <div>
              <Button
                color="primary"
                onClick={this.sendFeedback}
                label={intl.formatMessage(intlMessages.confirmLabel)}
                description={intl.formatMessage(intlMessages.confirmDesc)}
              />
            </div>
            <div id="textareaDesc" hidden>{intl.formatMessage(intlMessages.textarea)}</div>
          </div>
        </ModalBase>
      </span>
    );
  }
}

export default withRouter(injectIntl(FeedbackScreen));
