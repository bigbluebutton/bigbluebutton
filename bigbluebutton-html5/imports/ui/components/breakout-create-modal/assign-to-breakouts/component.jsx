import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired
};

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const defaultProps = {
  onCheck: () => {},
  onUncheck: () => {},
};

const MIN_BREAKOUT_ROOMS = 2;
const MAX_BREAKOUT_ROOMS = 12;

class Assign extends Component {

  constructor(props) {
    super(props);

     const {users} = this.props;
     let allUsers = users.map(user => ({
                      userId: user.userId,
                      userName: user.name,
                      isModerator: user.role === ROLE_MODERATOR,
                      room: 0,
                      color:user.color
                    }));

    this.state = {
        numberOfRooms: MIN_BREAKOUT_ROOMS,
        currentStep: 0,
        users: allUsers,
        channels:[{}],
        breakoutroom:null,
    };
    this.createchannels = this.createchannels.bind(this);
    this.channelName = this.channelName.bind(this);
    this.onChange = this.onChange.bind(this);
    this.changeNumberOfRooms = this.changeNumberOfRooms.bind(this);
    this.resetChannels = this.resetChannels.bind(this);
  }


  componentWillMount() {
    this.resetChannels(MIN_BREAKOUT_ROOMS);
  }
  componentWillUpdate(nextProps, nextState) {
   
   this.state.breakoutroom=null;
   console.log("update",this.state.breakoutroom);
   
   
  }
  

  changeNumberOfRooms(event) {
    var numberOfRooms = Number.parseInt(event.target.value, 10);
    if(numberOfRooms >= MAX_BREAKOUT_ROOMS){
      numberOfRooms = MAX_BREAKOUT_ROOMS;
    }

    const oldNumberofRooms = this.state.numberOfRooms;
    if(oldNumberofRooms != numberOfRooms){
      this.resetChannels(numberOfRooms);
    }
  }

  resetChannels(numberOfRooms) {
    const {users} = this.state;
    const {meetingName} = this.props;
    //clearing all channels
    let newChannels = [];
    for (let i = 0; i < numberOfRooms; i++) {
      newChannels[i]={name:meetingName + ":" + i, userId:[]};
    }

    let refreshedUsers = users.map(user => {
      user.room = 0;
      return user;
    });


    this.setState({
      numberOfRooms: numberOfRooms,
      currentStep: 0,
      users: refreshedUsers,
      channels: newChannels
    });
    
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


  channelName(ev){
    const {channels, currentStep} = this.state;
    channels[currentStep-1].name = ev.target.value;
  }

  
  _next = () => {
    const {numberOfRooms, channels, users} = this.state;
    var {currentStep} = this.state;
    currentStep = currentStep >= numberOfRooms-1? numberOfRooms: currentStep + 1;

    this.setState({
      currentStep: currentStep,
      numberOfRooms: numberOfRooms,
      users:users,
      channels: channels
    })
  }
    
  _prev = () => {
    const {numberOfRooms, channels, users} = this.state;
    var {currentStep} = this.state;
    currentStep = currentStep <= 0? 0: currentStep - 1;

    this.setState({
      currentStep: currentStep,
      numberOfRooms: numberOfRooms,
      users:users,
      channels: channels
    })
  }

  renderPreviousButton() {
    let currentStep = this.state.currentStep;
    if(currentStep !== 0){
      return (
        <button 
          className={styles.pbtn}
          type="button" onClick={this._prev}>
        Previous
        </button>
      )
    }
    return  null;
  }

  renderNextButton(){
    let {numberOfRooms, currentStep} = this.state;

    if(currentStep < numberOfRooms){
      return (
        <button 
          className={styles.nbtn}
          type="button" onClick={this._next}>
        Next
        </button>        
      )
    }
    return(
      <button 
        className={styles.nbtn}
        type="button" 
        onClick={this.createchannels}
        >
      Create
      </button>        
    );
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
    //closeModal();
  }

  render() {

    const {users, currentStep, channels, numberOfRooms,breakoutroom} = this.state;
    console.log(this.state.breakoutroom,breakoutroom);
    

    {if (currentStep != 0){
      return( <div className="form-group">
      <div className={styles.heading}>Breakout Channel {currentStep } of {numberOfRooms}</div>
      <label htmlFor="username" className={styles.name}>Channel Name</label>
      <input
        className="form-control"
        id="channelname"
        name="channelname"
        type="text"
        placeholder={channels[currentStep-1].name}
        value={breakoutroom==null?null:breakoutroom}
        //value={channels[currentStep-1].name}
        onChange={this.channelName}
      className={styles.input}
        />
        <div className={styles.userList}>

      {users.map((u,idx) => 

        <div  className={styles.Join}>
        {}
        {u.room == this.state.currentStep || u.room == 0 ?
          <label htmlFor="freeJoinCheckbox"
          className={styles.JoinLabel}
          key="free-join-breakouts">
          <input
            type="checkbox"
          // id="freeJoinCheckbox"
            className={styles.JoinCheckbox}
          id={`itemId${idx}`}
          defaultChecked={u.room === currentStep}
          onChange={this.onChange(u, currentStep)}
          />
          <span aria-hidden  className={styles.JoinLabel}>{u.userName}</span>
          </label>
        :
          null}
        </div>

      )}
      </div>
      <div className={styles.btns}>
      {this.renderNextButton()}
      {this.renderPreviousButton()}

      </div>
      </div>);
    }
    else{
      return ( <div>
        <div className={styles.inputheading}>How many breakout channels do you want?</div> 

        <div className={styles.number}>
          <select
            id="numberOfRooms"
            name="numberOfRooms"
            className={styles.num}
            value={numberOfRooms}
            onChange={this.changeNumberOfRooms}
          >
            {
              _.range(MIN_BREAKOUT_ROOMS, MAX_BREAKOUT_ROOMS + 1).map(item => (<option key={_.uniqueId('value-')}>{item}</option>))
            }
          </select>
          <div className={styles.btns}>
          {this.renderNextButton()}
        </div>
          </div>
        </div>);
    }}
          
        }
    }

Assign.propTypes = propTypes;
Assign.defaultProps = defaultProps;

export default Assign;