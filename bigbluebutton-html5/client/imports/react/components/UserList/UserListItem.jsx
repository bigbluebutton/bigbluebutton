import {Button} from '../Button.jsx';
import {Icon} from '../Icon.jsx';
import {EmojiIcon} from '../EmojiIcon.jsx';
import {Tooltip} from '../Tooltip.jsx';
import classNames from 'classnames';

export let UserListItem = React.createClass({

  handleKick(user) {
    return user.actions.kick(user);
  },

  handleMuteUnmute(user) {
    return user.actions.mute(user);
  },

  handleOpenPrivateChat(user) {
    return user.actions.openChat(user);
  },

  handleSetPresenter(user) {
    return user.actions.setPresenter(user);
  },

  render() {
    const user = this.props.user;

    return (
      <tr className={classNames(
        'user-list-item',
        user.isCurrent ? 'is-current' : null,
        user.unreadMessagesCount ? 'has-messages' : null
      )}>
        {this.renderStatusIcons()}
        {this.renderUserName()}
        {this.renderSharingStatus()}
      </tr>
    );
  },

  renderStatusIcons() {
    const user = this.props.user;
    let statusIcons = [];

    if(user.emoji !== 'none' && !user.isPresenter) {
      statusIcons.push((
        <EmojiIcon key="1" iconName={user.emoji}/>
      ));
    }

    if (this.props.currentUser.isModerator && !user.isPresenter) {
      statusIcons.push((
        <Icon key="1" iconName="projection-screen" onClick={this.handleSetPresenter.bind(this, user)} title={`Set ${user.name} as presenter`}/>
      ));
    }

    if (user.isPresenter) {
      statusIcons.push((<Icon key="2" iconName="projection-screen" title={`${user.name} is the presenter`}/>));
    } else if (user.isModerator) {
      statusIcons.push((<Icon key="3" iconName="torso" title={`${user.name} is a moderator`}/>));
    }

    return (
      <td className="user-list-item-status">
        {statusIcons.map(i => i)}
      </td>
    );
  },

  renderUserName() {
    const user = this.props.user;

    let userName = user.name;

    if (user.isCurrent) {
      userName = userName.concat(' (you)');
    }

    return (
      <td className="user-list-item-name" onClick={() => this.handleOpenPrivateChat(user)}>
        <Tooltip title={userName}>
          {userName} {this.renderUnreadBadge()}
        </Tooltip>
      </td>
    );
  },

  renderUnreadBadge() {
    const unreadMessagesCount = this.props.user.unreadMessagesCount;

    if (!unreadMessagesCount) {
      return;
    }

    return (
      <span className="user-list-item-messages">
        {(unreadMessagesCount > 9) ? '9+' : unreadMessagesCount}
      </span>
    );
  },

  renderSharingStatus() {
    const user = this.props.user;
    const { sharingStatus, name: userName } = user;
    const currentUser = this.props.currentUser;

    let icons = {
      mic: null,
      webcam: null,
      lock: null,
      kick: null,
    };

    if (sharingStatus.isInAudio) {
      if (sharingStatus.isListenOnly) {
        icons.mic = (<Icon iconName="volume-none"
        title={`${userName} is only listening`}/>);
      } else {
        if (sharingStatus.isMuted) {
          if (user.isCurrent) {
            icons.mic = (
              <Button className="muteIcon"
                onClick={() => this.handleMuteUnmute(user)}
                componentClass="span">
                <Icon prependIconName="ion-" iconName="ios-mic-off"
                  title={`${userName} is muted`}/>
              </Button>
            );
          } else {
            icons.mic = (<Icon prependIconName="ion-" iconName="ios-mic-off"
                  title={`${userName} is muted`}/>);
          }
        } else {
          let talkingStatusIcon = <Icon prependIconName="ion-"
            iconName="ios-mic-outline" title={`${userName} is not talking`}/>;

          if (sharingStatus.isTalking) {
            talkingStatusIcon = <Icon prependIconName="ion-" iconName="ios-mic"
            title={`${userName} is talking`}/>;
          }

          if (user.isCurrent) {
            icons.mic = (
              <Button
                onClick={() => this.handleMuteUnmute(user)}
                componentClass="span">
                {talkingStatusIcon}
              </Button>
            );
          } else {
            icons.mic = (
              <Button componentClass="span">
                {talkingStatusIcon}
              </Button>
            );
          }
        }
      }
    }

    if (!user.isCurrent && currentUser.isModerator) {
      icons.kick = (
        <Button className="kickUser" onClick={() => this.handleKick(user)} componentClass="span">
          <Icon iconName="x-circle" title={`Kick ${userName}`} className="icon usericon"/>
        </Button>
      );
    }

    if (sharingStatus.isWebcamOpen) {
      icons.webcam = (<Icon iconName="video" title={`${userName} is sharing their webcam`}/>);
    }

    if (sharingStatus.isLocked) {
      icons.lock = (<Icon iconName="lock" title={`${userName} is locked`}/>);
    }

    return (
      <td className="user-list-item-sharing">
        <table className="user-list-item-sharing-list">
          <tbody>
            <tr>
              {Object.keys(icons).map((key) => {
                return (<td key={key}>{icons[key]}</td>);
              })}
            </tr>
          </tbody>
        </table>
      </td>
    );
  },
});;
