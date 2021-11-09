import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import AudioService from '/imports/ui/components/audio/service';
import { styles } from './styles';

const SELECT_RANDOM_USER_COUNTDOWN = Meteor.settings.public.selectRandomUser.countdown;

let endTime = 0;

const messages = defineMessages({
  noViewers: {
    id: 'app.modal.randomUser.noViewers.description',
    description: 'Label displayed when no viewers are avaiable',
  },
  selected: {
    id: 'app.modal.randomUser.selected.description',
    description: 'Label shown to the selected user',
  },
  randUserTitle: {
    id: 'app.modal.randomUser.title',
    description: 'Modal title label',
  },
  whollbeSelected: {
    id: 'app.modal.randomUser.who',
    description: 'Label shown during the selection',
  },
  onlyOneViewerTobeSelected: {
    id: 'app.modal.randomUser.alone',
    description: 'Label shown when only one viewer to be selected',
  },
  allowRepeat: {
    id: 'app.modal.randomUser.allowRepeat.label',
    description: 'asks user whether they want to allow repetition in random user selection',
  },
  restart: {
    id: 'app.modal.randomUser.restart.label',
    description: 'suggest user to start non-repetitive selection again',
  },
  reselect: {
    id: 'app.modal.randomUser.reselect.label',
    description: 'select new random user button label',
  },
  ariaModalTitle: {
    id: 'app.modal.randomUser.ariaLabel.title',
    description: 'modal title displayed to screen reader',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  mountModal: PropTypes.func.isRequired,
  numAvailableViewers: PropTypes.number.isRequired,
  randomUserReq: PropTypes.func.isRequired,
};

// Keeps track of whether the array
// of users for animation contains
// all same values
let allSame = true;

class RandomUserSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allowRepeat: false,
      count: 0,
    };

    if (SELECT_RANDOM_USER_COUNTDOWN) {
      this.play = this.play.bind(this);
    }
  }

  iterateSelection() {
    if ( !allSame ) {

      const count = this.state.count;
      const iterations = this.props.mappedRandomlySelectedUsers.length -1;
      const delay = this.props.mappedRandomlySelectedUsers[count][1];

      if (count < iterations ) {
        setTimeout(() => { 
          this.setState({ count: count + 1 }); 
        }, delay);
      }

      // In case timeouts use outdated values, fix
      if (count === iterations + 1) this.setState({ count: iterations });
    }
  }

  componentDidMount() {
    allSame = (this.props.mappedRandomlySelectedUsers[0][1] === this.props.mappedRandomlySelectedUsers[1][1]);
    if (SELECT_RANDOM_USER_COUNTDOWN) {
      this.iterateSelection();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    allSame = (this.props.mappedRandomlySelectedUsers[0][1] === this.props.mappedRandomlySelectedUsers[1][1]);

    if (SELECT_RANDOM_USER_COUNTDOWN) {
      this.iterateSelection();

      if (
        // Use loose comparison in case number
        // got reassigned to same value
        (prevState.count != this.state.count)
        && this.props.keepModalOpen
        && !allSame
      ) {
        this.play();
      }
    }
  }

  play() {
    AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
      + Meteor.settings.public.app.basename
      + Meteor.settings.public.app.instanceId}`
      + '/resources/sounds/Poll.mp3');
  }

  reselect(refresh) {
    if (SELECT_RANDOM_USER_COUNTDOWN) {
      this.setState({
        count: 0,
      });
    }
    this.props.randomUserReq(this.state.allowRepeat, refresh);
  }

  getLabel(countDown, amISelectedUser, currentUser, numAvailableViewers, intl){
    let label = ``;

    // Inform the moderateor that there is only one user
    if (numAvailableViewers === 1 && currentUser.presenter) {
      label = `${intl.formatMessage(messages.onlyOneViewerTobeSelected)}`;
    }

    // Displayed during Animation
    else if (SELECT_RANDOM_USER_COUNTDOWN && countDown !== 0) {
      label = `${intl.formatMessage(messages.whollbeSelected)} ${ (!allSame) ? countDown : ''}`;
    }

    // Shown to the chosen one
    else if (amISelectedUser && countDown === 0) {
      label = `${intl.formatMessage(messages.selected)}`;
    }

    // Informs about choice
    else label = `${intl.formatMessage(messages.randUserTitle)}`;

    return label;
  }

  render() {
    const {
      keepModalOpen,
      toggleKeepModalOpen,
      intl,
      mountModal,
      numAvailableViewers,
      currentUser,
      clearRandomlySelectedUser,
      mappedRandomlySelectedUsers,
    } = this.props;

    const counter = this.state.count;
    if (mappedRandomlySelectedUsers.length < counter + 1) return null;

    const selectedUser = mappedRandomlySelectedUsers[counter][0];
    const countDown = mappedRandomlySelectedUsers.length - this.state.count - 1;

    let viewElement;

    const amISelectedUser = (currentUser.userId === selectedUser.userId);
    if (numAvailableViewers < 1 || (currentUser.presenter && amISelectedUser)) {
      // there's no viewers to select from,
      // or when you are the presenter but selected,
      // which happens when the presenter ability is passed to somebody
      // and people are entering and leaving the meeting
      // display modal informing presenter that there's no viewers to select from
      viewElement = (
        <div className={styles.modalViewContainer}>
          <div className={styles.modalViewTitle}>
            {intl.formatMessage(messages.randUserTitle)}
          </div>
          <div>{intl.formatMessage(messages.noViewers)}</div>
          <br />
          <Button
            onClick={() => this.reselect(true)}
            label={intl.formatMessage(messages.restart)}
            color="primary"
            size="md"
            className={styles.selectBtn}
          />
        </div>
      );
    } else { // viewers are available
      if (!selectedUser) return null; // rendering triggered before selectedUser is available

      // display modal with random user selection
      viewElement = (
        <div className={styles.modalViewContainer}>
          <div className={styles.modalViewTitle}>
            {  this.getLabel(countDown, amISelectedUser, currentUser, numAvailableViewers, intl, this.state.count) }
          </div>
          <div aria-hidden className={styles.modalAvatar} style={{ backgroundColor: `${selectedUser.color}` }}>
            {selectedUser.name.slice(0, 2)}
          </div>
          <div className={styles.selectedUserName}>
            {selectedUser.name}
          </div>
          { (currentUser.presenter && (
              countDown === 0 // Buttons are only available when the animation is not in process
              || numAvailableViewers === 1 // When there is only one user we still want to shw the buttons
              || !SELECT_RANDOM_USER_COUNTDOWN // If animations are off we always show buttons
              ) )
            ? (
              <>
                <div>
                  <input
                    type="checkbox"
                    name="allowRepeat"
                    onChange={() => this.setState({ allowRepeat: !this.state.allowRepeat })}
                    defaultChecked={ this.state.allowRepeat }/>
                  <label htmlFor="allowRepeat">{intl.formatMessage(messages.allowRepeat)}</label>
                  <br />
                </div>
                <Button
                  label={intl.formatMessage(messages.reselect)}
                  color="primary"
                  size="md"
                  className={styles.selectBtn}
                  onClick={() => this.reselect(false)}
                />
              </>
            )
            : null}
        </div>
      );
    }
    if (keepModalOpen) {
      return (
        <Modal
          hideBorder
          onRequestClose={() => {
            if (currentUser.presenter) clearRandomlySelectedUser();
            toggleKeepModalOpen();
            mountModal(null);
          }}
          contentLabel={intl.formatMessage(messages.ariaModalTitle)}
        >
          {viewElement}
        </Modal>
      );
    } else {
      return null;
    }
  }
}

RandomUserSelect.propTypes = propTypes;
export default injectIntl(RandomUserSelect);

