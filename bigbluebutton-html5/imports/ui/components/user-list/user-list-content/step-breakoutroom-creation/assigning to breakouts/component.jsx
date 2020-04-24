import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import SortList from './useralign/sort-user-list/component';

const propTypes = {

  users: PropTypes.arrayOf(PropTypes.object).isRequired,

  room: PropTypes.number.isRequired,
  onCheck: PropTypes.func,
  onUncheck: PropTypes.func,
};

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const defaultProps = {
  onCheck: () => {},
  onUncheck: () => {},
};

class Assign extends Component {
constructor(props) {
    super(props);
  const {users,currentStep}=props
    this.state = {
        
       // currentStep: 1,
        numberOfRooms:  '',
       
        roomSelected:0,
        room:0,
        assign:false,
      users:[],
    };
    console.log(props);
   // this.setState({users:props.props.users});

   this.onChage = this.onChage.bind(this);
   this.toggleChange=this.toggleChange.bind(this);
}
componentDidUpdate(prevProps, prevState) {
  const { users } = this.props;
}
componentDidMount() {
  this.setRoomUsers();
}



setRoomUsers() {
  const { users} = this.props;
  const { users: stateUsers } = this.state;
  const stateUsersId = stateUsers.map(user => user.userId);
  const roomUsers = users
    .filter(user => !stateUsersId.includes(user.userId))
    .map(user => ({
      userId: user.userId,
      userName: user.name,
      isModerator: user.role === ROLE_MODERATOR,
      room: 0,
    }));

  this.setState({
    users: [
      ...stateUsers,
      ...roomUsers,
    ],
  });
  console.log(roomUsers);
  
}



getUserByRoom(room) {
  const { users } = this.state;
  return users.filter(user => user.room === room);
}

changeUserRoom(userId, room) {
  const { users } = this.props.users;

  const idxUser = users.findIndex(user => user.userId === userId);

  const usersCopy = [...users];

  usersCopy[idxUser].room = room;

  this.setState({
    users: usersCopy,
    valid: this.getUserByRoom(0).length !== users.length,
  });
}

renderSelectUserScreen() {
  const {
    users,
    roomSelected,
  } = this.state;
  return (
    <SortList
     // confirm={() => this.setState({ formFillLevel: 2 })}
      users={this.props.users}
      room={this.props.currentStep}
      onCheck={this.changeUserRoom}
      onUncheck={userId => this.changeUserRoom(userId, 0)}
    />
  );
}


toggleChange = (ev) => {
  const {
    onCheck,
    onUncheck,
  } = this.props;
  return (ev) => {
    const check = ev.target.checked;
    if (check) {
      return onCheck(userId, room);
    }
    return onUncheck(userId, room);
  };
  this.setState({
    checked: ev.target.checked
    
  });
  console.log(ev.target.checked);
  console.log(ev.target.value);
  
  console.log(this.props.users);
//  console.log(checked);
  
}


onChage(user, room) {
  const {
    onCheck,
    onUncheck,
  } = this.props;
 
  return (ev) => {

    const check = ev.target.checked;
    
    if (check) {
      user.room=room;
      console.log(check,user,room);
     // return onCheck(userId, room);
    }
    else{
    user.room=0;
    console.log(check,user,room);
   // return onUncheck(userId, room);
  }
  };
}
    render() {
 // const {users}=this.props.props.users;
//  const {}=this.state
//console.log(this.props.props.users);
//const {users}=this.props.props.users;
//this.setState({users:this.props.props.users});
const {users}=this.state;


        return( <div className="form-group">
          <div className={styles.heading}>Breakout Channel {this.props.currentStep } of  5</div>
        <label htmlFor="username" className={styles.name}>Channel Name</label>
        <input
          className="form-control"
          id="channelname"
          name="channelname"
          type="text"
          placeholder="Enter channel name"
          value={this.props.currentStep}
         // onChange={props.handleChange}
         className={styles.input}
          />
            {users.map((u,idx) => 
  
  // <div key={u.userId}>{u.username} 1</div>
  <div  className={styles.Join}>
<label htmlFor="freeJoinCheckbox"
 className={styles.JoinLabel}
 key="free-join-breakouts">
        <input
          type="checkbox"
         // id="freeJoinCheckbox"
          className={styles.JoinCheckbox}
         // onChange={this.toggleChange}
        //  checked={u.assign=true}
        //  unchecked={u.assign=false}
        //  unchecked
         
        // type="checkbox"
         id={`itemId${idx}`}
         defaultChecked={u.room === this.props.currentStep}
         onChange={this.onChage(u, this.props.currentStep)}
        // onChange={this.onselect()}
        // aria-label={u.name}
         // aria-label={intl.formatMessage(intlMessages.freeJoinLabel)}
        />
        {/* <span aria-hidden>{intl.formatMessage(intlMessages.freeJoinLabel)}</span> */}
        <span aria-hidden  className={styles.JoinLabel}>{u.userName}</span>
      </label>
      {}
      </div>
   
  )}

        
  
        
{/* {this.renderSelectUserScreen()} */}

  
         
      </div>);
    }
}

Assign.propTypes = propTypes;
Assign.defaultProps = defaultProps;

export default Assign;