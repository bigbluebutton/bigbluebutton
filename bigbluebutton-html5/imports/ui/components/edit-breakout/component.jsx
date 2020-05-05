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
     const {breakoutRoomUsers} = this.props;
     const {originalBreakoutRoomUsers} = Object.assign({}, breakoutRoomUsers);
     const {unassignedUsersInMasterChannel} = this.props;
    this.onChange = this.onChange.bind(this);
  }

  render() {
      return( <div className="form-group">
        {breakoutRoomUsers.map((u,idx) => 

          <div  className={styles.Join}>
            <label htmlFor="freeJoinCheckbox"
            className={styles.JoinLabel}
            key="free-join-breakouts">
            <input
              type="checkbox"
              className={styles.JoinCheckbox}
              id={`itemId${idx}`}
              defaultChecked={true}
              onChange={this.onChange(u)}
            />
            <span aria-hidden  className={styles.JoinLabel}>{u.userName}</span>
            </label>
          </div>

      )}

        {unassignedUsersInMasterChannel.map((u,idx) => 

        <div  className={styles.Join}>
          <label htmlFor="freeJoinCheckbox"
          className={styles.JoinLabel}
          key="free-join-breakouts">
          <input
            type="checkbox"
            className={styles.JoinCheckbox}
            id={`itemId${idx}`}
            defaultChecked={false}
            onChange={this.onChange(u)}
          />
          <span aria-hidden  className={styles.JoinLabel}>{u.userName}</span>
          </label>
        </div>

        )}
      <div className={styles.btns}>
        {this.renderCancelButton()}
        {this.renderUpdateButton()}
      </div>
    </div>);
  }     



  onChange(user, room) {

    const {channels, currentStep, users} = this.state
  
    return (ev) => {

      const check = ev.target.checked;
      let d=null;
      if (check) {
        user.room=room;
        channels[currentStep-1].userId = users.filter(user=>user.room==currentStep).map(user=>(user.userId));
      }
      else{
      user.room=0;
      channels[currentStep-1].userId.filter((u,i)=>{ u==user.userId ;  d=i });
      channels[currentStep-1].userId.splice(d,1);
      console.log(check,user,room);
    }
    };
  }


  
  _update = () => {
    
  }
    
  _cancel = () => {
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
          type="button" onClick={this._prev}>
        Update
        </button>
    )
  }

  createchannels(){
    const {createBreakoutRoom, closeModal} = this.props;
    const {channels} = this.state;
    let seq = 1;
    let rooms = channels.map(ch => ({
                              name: ch.name,
                              sequence: seq++,
                              freeJoin: false,
                              users: ch.userId
                            }));
    createBreakoutRoom(rooms, 525600, false);
    closeModal();
  }

}

Assign.propTypes = propTypes;
Assign.defaultProps = defaultProps;

export default Assign;