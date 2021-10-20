import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

export const LessonContext = React.createContext();

const messages = defineMessages({
  ariaModalTitle: {
    id: 'app.modal.randomUser.ariaLabel.title',
    description: 'modal title displayed to screen reader',
  },
  submitLabel: {
    id: 'app.polling.submitLabel',
    description: 'confirm button label',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  mountModal: PropTypes.func.isRequired,
  numAvailableViewers: PropTypes.number.isRequired,
};

class TekSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subj: '',
      gr: '',
      lsn: '1',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault()
    const data = this.state
    data.meetingId = this.props.meeting;
    data.currentUser = this.props.currentUser;
    console.log('Received', data);
    fetch('https://tutorcalculator.mindriselearningonline.com/api/lesson/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  render() {
    const {
      intl,
      mountModal,
      numAvailableViewers,
      currentUser,
      meeting,
    } = this.props;
    const subjects = ['Math', 'Reading', 'Science', 'Social Studies', 'Algebra', 'Biology', 'History', 'ELA 1', 'ELA 2', 'EnglishLanguageArts'];
    const grades = ['3', '4', '5', '6', '7', '8', 'HS'];
    const lessons = [];
    lessons.push('HW');
    for (let i = 1; i <= 30; i += 1) {
      lessons.push(i.toString());
    }

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={() => mountModal(null)}
        hideBorder
        contentLabel={intl.formatMessage(messages.ariaModalTitle)}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.title}>
              Input the Subject     /     Grade     /     Lesson:
            </div>
          </div>
        </div>
        <form id="myform" onSubmit={this.handleSubmit.bind(this)}>
          <div className={styles.columns}>
            <div>
              <span className={styles.columnheader}>Subject: </span>
              <select name="subj" onChange={this.handleChange.bind(this)}>
                <option value="" selected disabled hidden>Select Subject</option>
                {subjects.map((subject) => <option value={subject}>{subject}</option>)}
              </select>
            </div>
            <div>
              <span className={styles.columnheader}>Grade: </span>
              <select name="gr" onChange={this.handleChange.bind(this)}>
                <option value="" selected disabled hidden>Select Grade</option>
                {grades.map((grade) => <option value={grade}>{grade}</option>)}
              </select>
            </div>
            <div>
              <span className={styles.columnheader}>Lesson: </span>
              <select name="lsn" onChange={this.handleChange.bind(this)}>
                <option value="" selected disabled hidden>Select Lesson</option>
                {lessons.map((lsn) => <option value={lsn}>{lsn}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.footer}>
            <Button
              color="primary"
              className={styles.confirmBtn}
              label={intl.formatMessage(messages.submitLabel)}
              onClick={() => {
                mountModal(null);
              }}
            />
          </div>
        </form>
      </Modal>
    );
  }
}

TekSelect.propTypes = propTypes;
export default injectIntl(TekSelect);
