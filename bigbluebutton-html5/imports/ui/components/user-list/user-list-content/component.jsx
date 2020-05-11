import React, { PureComponent } from 'react';
// import  Assign from '../../../../ui/components/breakout-create-modal/assign-to-breakouts/container';
import PropTypes from 'prop-types';
import { styles } from './styles';
import ChannelsContainer from '/imports/ui/components/channels/container';
import Button from '/imports/ui/components/button/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import BreakoutCreateModalContainer from '/imports/ui/components/breakout-create-modal/container';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const propTypes = {
  activeChats: PropTypes.arrayOf(String).isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  isPublicChat: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  pollIsOpen: PropTypes.bool.isRequired,
  forcePollOpen: PropTypes.bool.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
  isBreakoutRecordable: PropTypes.bool.isRequired,
  mountModal: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
};
// const CHAT_ENABLED = Meteor.settings.public.chat.enabled;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

class UserContent extends PureComponent {
  constructor() {
    super();
    this.newCreateBreakouts = this.newCreateBreakouts.bind(this);
  }

  newCreateBreakouts() {
    const { mountModal } = this.props;
    return mountModal(<BreakoutCreateModalContainer />);
  }


  render() {
    const {
      compact,
      intl,
      currentUser,
      setEmojiStatus,
      roving,
      isPublicChat,
      activeChats,
      pollIsOpen,
      forcePollOpen,
      hasBreakoutRoom,
      pendingUsers,
      requestUserInformation,
    } = this.props;


    const isMasterChannel = !meetingIsBreakout();
    const isModerator = currentUser.role === ROLE_MODERATOR;
    return (
      <div
        data-test="userListContent"
        className={styles.content}
        role="complementary"
      > 


      {/* {isMasterChannel && isModerator ?   :null } */}
     
      <ChannelsContainer
          {...{
            compact,
            intl,
            currentUser,
            setEmojiStatus,
            roving,
            requestUserInformation,
          }}
        />

      </div>
    );
  }
}

UserContent.propTypes = propTypes;
UserContent.defaultProps = defaultProps;

export default withModalMounter(UserContent);
