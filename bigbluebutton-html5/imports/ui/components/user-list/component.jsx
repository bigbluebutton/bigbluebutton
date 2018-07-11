import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { styles } from './styles';
import CustomLogo from './custom-logo/component';
import UserContent from './user-list-content/component';

const propTypes = {
  openChats: PropTypes.arrayOf(String).isRequired,
  users: PropTypes.arrayOf(Object).isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  meeting: PropTypes.shape({}),
  isBreakoutRoom: PropTypes.bool,
  getAvailableActions: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
  isPublicChat: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  assignPresenter: PropTypes.func.isRequired,
  removeUser: PropTypes.func.isRequired,
  toggleVoice: PropTypes.func.isRequired,
  changeRole: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
};
const SHOW_BRANDING = Meteor.settings.public.app.branding.displayBrandingArea;
const defaultProps = {
  compact: false,
  isBreakoutRoom: false,
  // This one is kinda tricky, meteor takes sometime to fetch the data and passing down
  // So the first time its create, the meeting comes as null, sending an error to the client.
  meeting: {},
};

class UserList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      intl,
      openChats,
      users,
      compact,
      currentUser,
      isBreakoutRoom,
      setEmojiStatus,
      assignPresenter,
      removeUser,
      toggleVoice,
      changeRole,
      meeting,
      getAvailableActions,
      normalizeEmojiName,
      isMeetingLocked,
      isPublicChat,
      roving,
      CustomLogoUrl,
      handleEmojiChange,
      getEmojiList,
      getEmoji,
    } = this.props;

    return (
      <div className={styles.userList}>
        {
          SHOW_BRANDING
          && !this.props.compact
          && CustomLogoUrl
          ? <CustomLogo CustomLogoUrl={CustomLogoUrl} /> : null
        }
        {<UserContent
          {...{
          intl,
          openChats,
          users,
          compact,
          currentUser,
          isBreakoutRoom,
          setEmojiStatus,
          assignPresenter,
          removeUser,
          toggleVoice,
          changeRole,
          meeting,
          getAvailableActions,
          normalizeEmojiName,
          isMeetingLocked,
          isPublicChat,
          roving,
          handleEmojiChange,
          getEmojiList,
          getEmoji,
        }
      }
        />}
      </div>
    );
  }
}

UserList.propTypes = propTypes;
UserList.defaultProps = defaultProps;

export default withRouter(injectWbResizeEvent(injectIntl(UserList)));
