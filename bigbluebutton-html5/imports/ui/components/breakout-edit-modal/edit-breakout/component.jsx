import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import UserAvatar from '/imports/ui/components/user-avatar/component';
const propTypes = {
  breakoutRoomUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
  unassignedUsersInMasterChannel: PropTypes.arrayOf(PropTypes.object).isRequired
};

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const defaultProps = {
  onCheck: () => {},
  onUncheck: () => {},
};

class EditBreakout extends Component {

  constructor(props) {
    super(props);
    //  const {breakoutRoomUsers} = this.props;
    this.checkedUsers = [];
    this. uncheckedUsers = [];
    //  const {originalBreakoutRoomUsers} = Object.assign({}, breakoutRoomUsers);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    const {breakoutRoomUsers, unassignedUsersInMasterChannel,name} = this.props;
      return( <div className="form-group">
        <div className={styles.name}><b>{name} </b>  </div>
        <div className={styles.userList}>
        {breakoutRoomUsers.map((u,idx) => 
          <div  className={styles.Join}>
            <label htmlFor="freeJoinCheckbox" className={styles.JoinLabel} key="free-join-breakouts">
            <input
              type="checkbox"
              className={styles.JoinCheckbox}
              id={`itemId${idx}`}
              defaultChecked={true}
              onChange={this.onChange(u)}
            />
             <div className={styles.userContentContainer} >
             <div  className={styles.userAvatar}>
          <UserAvatar
          key={`user-avatar-${u.userId}`}
         // moderator={u.role === 'MODERATOR'}
          color={u.color}
        >
          {u.name.slice(0, 2).toLowerCase()}
        </UserAvatar>
        </div>
            <span aria-hidden  className={styles.username}> <b>{u.name}</b> </span>
            </div>
            </label>
          </div>

      )}

      {unassignedUsersInMasterChannel.map((u,idx) => 

        <div  className={styles.Join}>
          <label htmlFor="freeJoinCheckbox" className={styles.JoinLabel} key="free-join-breakouts">
          <input
            type="checkbox"
            className={styles.JoinCheckbox}
            id={`itemId${idx}`}
            defaultChecked={false}
            onChange={this.onChange(u)}
          />
           <div className={styles.userContentContainer} >
             <div  className={styles.userAvatar}>
          <UserAvatar
          key={`user-avatar-${u.userId}`}
         // moderator={u.role === 'MODERATOR'}
          color={u.color}
        >
          {u.name.slice(0, 2).toLowerCase()}
        </UserAvatar>
        </div>
          <span aria-hidden  className={styles.username}> <b>{u.name}</b> </span>
          </div>
          </label>
        </div>

        )}
          </div>
      <div className={styles.btns}>
        {this.renderCancelButton()}
        {this.renderUpdateButton()}
      </div>
    </div>);
  }     

  deleteFromArray(arr, userId){
    var index = arr.findIndex(u => u.userId == userId);
    if (index !== -1) arr.splice(index, 1);
  }

  onChange(user) {
    return (ev) => {
      const check = ev.target.checked;
      if (check) {
        if(this.uncheckedUsers.find(u => u.userId == user.userId)){
          deleteFromArray(this.uncheckedUsers, user.userId);
        }else{
          this.checkedUsers.push(user);
        }
      }else{
        if(this.checkedUsers.find(u => u.userId == user.userId)){
          deleteFromArray(this.checkedUsers, user.userId);
        }else{
          this.uncheckedUsers.push(user);
        }
      }
    };
  }

  
  _update = () => {
    const {
      sendInvitation,
      removeUser,
      getBreakoutMeetingUserId,
      breakoutId,
      closeModal
    } = this.props;

    //The userIds here are from the parent meeting. We need to get the corresponding user from the 
    //break out room. 
    this.uncheckedUsers.map((user) => {
    let breakoutUser = getBreakoutMeetingUserId(user.email, user.name, breakoutId);
    if(breakoutUser){
      console.log(`Removing user to channel: ${breakoutUser.userId}`);
      removeUser(breakoutUser.userId, breakoutId);
      }
    });

    this.checkedUsers.map(user => {
      console.log("Adding user to channel: " + user);
      sendInvitation(breakoutId, user.userId);
    });

    closeModal();
  } 
  
    
  _cancel = () => {
    const {closeModal}=this.props
    closeModal();
  }

  renderCancelButton() {
    return (
        <button 
          className={styles.pbtn}
          type="button" onClick={this._cancel}>
        Cancel
        </button>
    )
  }

  renderUpdateButton() {
    return (
        <button 
          className={styles.pbtn}
          type="button" onClick={this._update}>
        Update
        </button>
    )
  }

}

EditBreakout.propTypes = propTypes;
EditBreakout.defaultProps = defaultProps;

export default EditBreakout;