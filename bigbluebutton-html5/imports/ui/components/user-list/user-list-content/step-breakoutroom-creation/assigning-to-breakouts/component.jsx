import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';


import UserAvatar from '/imports/ui/components/user-avatar/component';
import NumberOfBreakouts from '../number-of-breakouts/component';
const propTypes = {

  users: PropTypes.arrayOf(PropTypes.object).isRequired,
//  createChannelState:PropTypes.objectOf(propTypes.any),
 // room: PropTypes.number.isRequired,
  // onCheck: PropTypes.func,
  // onUncheck: PropTypes.func,
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
       // numberOfRooms:  '',
        currentStep:1,
       // roomSelected:0,
       createChannelState:{},
       unasssignedUsers:[],
       channels:[{}],
        room:0,
        assign:false,
       
      users:[],
    };
   // this.setState({users:props.props.users});
   this.createchannels=this.createchannels.bind(this);
   this.channelName=this.channelName.bind(this);
   this.onChage = this.onChage.bind(this);
   this.toggleChange=this.toggleChange.bind(this);
}
componentDidUpdate(prevProps, prevState) {
 // const { users } = this.props;
  const {currentStep,createChannelState,unasssignedUsers,users}=this.state;

 createChannelState.currentStep=currentStep;

 createChannelState.unasssignedUsers=users.filter(user=>user.room==0).map(user=>(user.userId));


 
 
 
 
}
componentDidMount() {
  this.setRoomUsers();
}



setRoomUsers() {
  const { users, numberOfRooms} = this.props;
  const {currentStep}=this.state;
  const channels =[];
 for (let i = 0; i < numberOfRooms; i++) {
   
  channels[i]={name:i+1,userId:[]};
 }
 
  const { users: stateUsers } = this.state;
  const createChannelState={
    userInput:numberOfRooms,
    currentStep:currentStep,
    unasssignedUsers:[],
    channels:[],

  }
 // createChannelState.channels[0]={name:currentStep, roomusers:[]};
//  const channels =[];
//  for (let i = 0; i < numberOfRooms; i++) {
   
//   channels[i]={name:null,userId:[]};
//  }
//  createChannelState.channels=channels;

  
  const stateUsersId = stateUsers.map(user => user.userId);
  const roomUsers = users
    .filter(user => !stateUsersId.includes(user.userId))
    .map(user => ({
      userId: user.userId,
      userName: user.name,
      isModerator: user.role === ROLE_MODERATOR,
      room: 0,
      color:user.color
    }));

  this.setState({
    users: [
      ...stateUsers,
      ...roomUsers,
    ],
    createChannelState:{userInput:numberOfRooms,
      currentStep:currentStep,
      channels:channels,
  }
  });
  
  
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
  const {createChannelState,currentStep,users}=this.state
 
  return (ev) => {

    const check = ev.target.checked;
    
    if (check) {
      user.room=room;
      createChannelState.channels[currentStep-1].userId= users.filter(user=>user.room==currentStep).map(user=>(user.userId));
      
     // return onCheck(userId, room);
    }
    else{
    user.room=0;
    console.log(check,user,room);
   // return onUncheck(userId, room);
  }
  };
}


channelName(ev){
  const {createChannelState}=this.state;
  createChannelState.channels[createChannelState.currentStep-1].name=ev.target.value;

  
}

_next = () => {
  let numberOfRooms=this.props.numberOfRooms;
  let currentStep = this.state.currentStep
  currentStep = currentStep >= numberOfRooms-1? numberOfRooms: currentStep + 1
  this.setState({
    currentStep: currentStep
  })
}
  
_prev = () => {
  let currentStep = this.state.currentStep
  currentStep = currentStep <= 0? 0: currentStep - 1
  this.setState({
    currentStep: currentStep
  })
}

previousButton() {
let currentStep = this.state.currentStep;
if(currentStep !==0){
  return (
    <button 
      className={styles.pbtn}
      //className="btn btn-secondary" 
      type="button" onClick={this._prev}>
    Previous
    </button>
  )
}
return  null;
}

nextButton(){
  let numberOfRooms=this.props.numberOfRooms;
let currentStep = this.state.currentStep;
if(currentStep < numberOfRooms){
  return (
    <button 
      className={styles.nbtn}
     // className="btn btn-primary float-right" 
      type="button" onClick={this._next}>
    Next
    </button>        
  )
}
return(
  <button 
    className={styles.nbtn}
   // className="btn btn-primary float-right" 
    type="button" 
    onClick={this.createchannels}
    >
  Create
  </button>        
);
}
createchannels(){
  const {users,createChannelState}=this.state;
  console.log(createChannelState,users);
  
}

    render() {
 // const {users}=this.props.props.users;
//  const {}=this.state
//const {users}=this.props.props.users;
//this.setState({users:this.props.props.users});
const {users, currentStep, channelName,createChannelState}=this.state;
{if (currentStep!=0){
  return( <div className="form-group">
  <div className={styles.heading}>Breakout Channel {currentStep } of {this.props.numberOfRooms}</div>
<label htmlFor="username" className={styles.name}>Channel Name</label>
<input
  className="form-control"
  id="channelname"
  name="channelname"
  type="text"
  placeholder="Enter channel name"
  value={channelName}
  onChange={this.channelName}
 className={styles.input}
  />

    {users.map((u,idx) => 

// <div key={u.userId}>{u.username} 1</div>
<div  className={styles.Join}>



{}
{u.room==this.state.currentStep || u.room==0?<label htmlFor="freeJoinCheckbox"
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
 defaultChecked={u.room === currentStep}
 onChange={this.onChage(u, currentStep)}
// onChange={this.onselect()}
// aria-label={u.name}
 // aria-label={intl.formatMessage(intlMessages.freeJoinLabel)}
/>
{/* <span aria-hidden>{intl.formatMessage(intlMessages.freeJoinLabel)}</span> */}

{/* <div className={styles.avatarWrapper}>
<UserAvatar
          className={styles.avatar}
         color={u.color}
          moderator={u.isModerator}
        >
          {u.userName.toLowerCase().slice(0, 1)}
        </UserAvatar>
        </div> */}
<span aria-hidden  className={styles.JoinLabel}>{u.userName}</span>

</label>
:
null}
</div>

)}
<div className={styles.btns}>
{this.nextButton()}
{this.previousButton()}

</div>






 
</div>);
}
else{
  return(
  <NumberOfBreakouts
  currentStep={this.state.currentStep} 
  numberOfRoomsSelected= {this.props.numberOfRooms}
  />);
}}
       
    }
}

Assign.propTypes = propTypes;
Assign.defaultProps = defaultProps;

export default Assign;