import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import AudioService from '/imports/ui/components/audio/service';
import Styled from './styles';

const SELECT_RANDOM_USER_COUNTDOWN = Meteor.settings.public.selectRandomUser.countdown;

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
  numAvailableViewers: PropTypes.number.isRequired,
  randomUserReq: PropTypes.func.isRequired,
};

class RandomUserSelect extends Component {
  constructor(props) {
    super(props);

    if (props.currentUser.presenter) {
      props.randomUserReq();
    }

    if (SELECT_RANDOM_USER_COUNTDOWN) {
      this.state = {
        count: 0,
      };
      this.play = this.play.bind(this);
    }
  }

  iterateSelection() {
    if (this.props.mappedRandomlySelectedUsers.length > 1) {
      const that = this;
      setTimeout(delay(that.props.mappedRandomlySelectedUsers, 1), that.props.mappedRandomlySelectedUsers[1][1]);
      function delay(arr, num) {
        that.setState({
          count: num,
        });
        if (num < that.props.mappedRandomlySelectedUsers.length - 1) {
          setTimeout(() => { delay(arr, num + 1); }, arr[num + 1][1]);
        }
      }
    }
  }

  componentDidMount() {
    const { keepModalOpen, toggleKeepModalOpen, currentUser } = this.props;

    if (currentUser.presenter && !keepModalOpen) {
      toggleKeepModalOpen();
    }

    if (SELECT_RANDOM_USER_COUNTDOWN && !currentUser.presenter) {
      this.iterateSelection();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (SELECT_RANDOM_USER_COUNTDOWN) {
      if (this.props.currentUser.presenter && this.state.count === 0) {
        this.iterateSelection();
      }

      if ((prevState.count !== this.state.count) && this.props.keepModalOpen) {
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

  reselect() {
    if (SELECT_RANDOM_USER_COUNTDOWN) {
      this.setState({
        count: 0,
      });
    }
    this.props.randomUserReq();
  }

  render() {
    const {
      keepModalOpen,
      toggleKeepModalOpen,
      intl,
      setIsOpen,
      numAvailableViewers,
      currentUser,
      clearRandomlySelectedUser,
      mappedRandomlySelectedUsers,
      isOpen,
      priority,
    } = this.props;

    const counter = SELECT_RANDOM_USER_COUNTDOWN ? this.state.count : 0;
    if (mappedRandomlySelectedUsers.length < counter + 1) return null;

    const selectedUser = SELECT_RANDOM_USER_COUNTDOWN ? mappedRandomlySelectedUsers[counter][0] :
      mappedRandomlySelectedUsers[mappedRandomlySelectedUsers.length - 1][0];
    const countDown = SELECT_RANDOM_USER_COUNTDOWN ?
      mappedRandomlySelectedUsers.length - this.state.count - 1 : 0;

    let viewElement;
    let title;

    const amISelectedUser = currentUser.userId === selectedUser.userId;
    if (numAvailableViewers < 1 || (currentUser.presenter && amISelectedUser)) { // there's no viewers to select from,
      // or when you are the presenter but selected, which happens when the presenter ability is passed to somebody
      // and people are entering and leaving the meeting
      // display modal informing presenter that there's no viewers to select from
      viewElement = (
        <Styled.ModalViewContainer>
          <div data-test="noViewersSelectedMessage">
            {intl.formatMessage(messages.noViewers)}
          </div>
        </Styled.ModalViewContainer>
      );
      title = intl.formatMessage(messages.randUserTitle);
    } else { // viewers are available
      if (!selectedUser) return null; // rendering triggered before selectedUser is available

      // display modal with random user selection
      viewElement = (
        <Styled.ModalViewContainer>
          <Styled.ModalAvatar aria-hidden style={{ backgroundColor: `${selectedUser.color}` }}>
            {selectedUser.name.slice(0, 2)}
          </Styled.ModalAvatar>
          <Styled.SelectedUserName data-test="selectedUserName">
            {selectedUser.name}
          </Styled.SelectedUserName>
          {currentUser.presenter
            && countDown === 0
            && (
            <Styled.SelectButton
              label={intl.formatMessage(messages.reselect)}
              color="primary"
              size="md"
              onClick={() => this.reselect()}
              data-test="selectAgainRadomUser"
            />
            )}
        </Styled.ModalViewContainer>
      );
      title = countDown == 0
        ? amISelectedUser
          ? `${intl.formatMessage(messages.selected)}`
          : numAvailableViewers == 1 && currentUser.presenter
            ? `${intl.formatMessage(messages.onlyOneViewerTobeSelected)}`
            : `${intl.formatMessage(messages.randUserTitle)}`
        : `${intl.formatMessage(messages.whollbeSelected)} ${countDown}`;
    }
    if (keepModalOpen) {
      return (
        <ModalSimple
          onRequestClose={() => {
            if (currentUser.presenter) clearRandomlySelectedUser();
            toggleKeepModalOpen();
            setIsOpen(false);
          }}
          contentLabel={intl.formatMessage(messages.ariaModalTitle)}
          title={title}
          {...{
            isOpen,
            priority,
          }}
        >
          {viewElement}
        </ModalSimple>
      );
    } else {
      return null;
    }
  }
}

RandomUserSelect.propTypes = propTypes;
export default injectIntl(RandomUserSelect);
