import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

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
    const {breakoutRoomUsers, unassignedUsersInMasterChannel} = this.props;
      return( <div className="form-group">
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
            <span aria-hidden  className={styles.JoinLabel}>{u.name}</span>
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
          <span aria-hidden  className={styles.JoinLabel}>{u.name}</span>
          </label>
        </div>

        )}
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
    closeModal();
  }

  renderCancelButton() {
    return (
        <button 
          className={styles.pbtn}
          type="button" onClick={this.cancel}>
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