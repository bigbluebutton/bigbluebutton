import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { styles } from './styles';

const messages = defineMessages({
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
};

class GradingSelectModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      grades: Users.find({
        meetingId: Auth.meetingID,
        presenter: { $ne: true },
        role: { $eq: 'VIEWER' },
      }, {
        fields: {
          userId: 1,
          name: 1,
          gradevalue: 1,
        },
      }).fetch(),
      smileys: [
        './resources/images/smiley1.png',
        './resources/images/smiley2.png',
        './resources/images/smiley3.png',
        './resources/images/smiley4.png',
        './resources/images/smiley5.png',
      ],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  // componentDidMount() {

  handleChange(e, userId) {
    console.log('new value:' + e + ' ' +e.value + ' ' + userId.toString());
    if ((userId === undefined) || (e.value === undefined)) return;
    const newgrades = this.state.grades.map(element => {
      if (element.userId === userId) {
        return {
          ...element,
          gradevalue: e.value,
        };
      } else return element;
    });
    this.setState({ grades: newgrades });

    document.querySelectorAll('.smileyspot').forEach(function(el) {
      el.style.display = 'none';
    });
    const diff = e.value - 1;
    const image = document.getElementById(e.target.userId + diff.toString());
    image.style.display = 'block';
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    const {
      mountModal, onConfirm, user, title, intl,
    } = this.props;

    const {
      smileys,
    } = this.state;

    const gradetype = ['Lesson', 'IP'];
    const lessons = [];
    const grades = this.props.grade ? [this.props.grade] : this.state.grades;
    for (let i = 0; i <= 99; i += 1) {
      if (i === 0) {
        lessons.push('GP');
      } else lessons.push(i.toString());
    }

    // const lessons = [...Array(100).keys()];

    return (
      <Draggable>
        <Modal
          overlayClassName={styles.overlay}
          className={styles.modal}
          onRequestClose={() => mountModal(null)}
          hideBorder
          contentLabel={title}
        >
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.title}>
                Assign Grades for your Students:
              </div>
            </div>
            <div className={styles.columns}>
              <div>
                <select name="gradetype">
                  <option value="" selected disabled hidden>Select Grade Type</option>
                  {gradetype.map((gt) => <option value={gt}>{gt}</option>)}
                </select>
                <select name="lessonnum">
                  <option value="" selected disabled hidden>Choose Problem</option>
                  {lessons.map((lesson) => <option value={lesson}>{lesson}</option>)}
                </select>
              </div>
              <div>
                <span className={styles.smileysbar}>N/A</span>
                <img src="./resources/images/smiley1.png" alt="logo" className={styles.smileysbar} />
                <img src="./resources/images/smiley2.png" alt="logo" className={styles.smileysbar} />
                <img src="./resources/images/smiley3.png" alt="logo" className={styles.smileysbar} />
                <img src="./resources/images/smiley4.png" alt="logo" className={styles.smileysbar} />
                <img src="./resources/images/smiley5.png" alt="logo" className={styles.smileysbar} />
              </div>
            </div>
            <div>
              <form onSubmit={this.handleSubmit}>
                <table className={styles.studentlist}>
                  <colgroup>
                    <col className={styles.cw50} />
                    <col className={styles.cw40} />
                    <col className={styles.cw10} />
                  </colgroup>
                  <tbody>
                    {grades.map((gradeitem, index) => (
                      <tr>
                        <td className={styles.studentname}>
                          {gradeitem.name}
                        </td>
                        <td>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="1"
                            defaultValue="0"
                            className={styles.slider}
                            name={gradeitem.userId}
                            onChange={this.handleChange.bind(this, gradeitem.userId)}
                            key={gradeitem.userId}
                          />
                        </td>
                        <td id={gradeitem.userId}>
                          {this.state.smileys.map((sm, i) => <img src={sm} id={"img" + i} className={styles.smileyspot} alt="logo" /> )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </form>
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
          </div>
        </Modal>
      </Draggable>
    );
  }
}

GradingSelectModal.propTypes = propTypes;
export default withModalMounter(injectIntl(GradingSelectModal));
