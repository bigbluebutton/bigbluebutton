import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Assign from '../assigning-to-breakouts/container';
import styles from './styles.scss';

import Button from '/imports/ui/components/button/component';
import HoldButton from '/imports/ui/components/presentation/presentation-toolbar/zoom-tool/holdButton/component';
const propTypes = {

 // users: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelect: PropTypes.func,
};

const defaultProps = {
  onSelect:()=>{},
};

const MIN_BREAKOUT_ROOMS = 2;
const MAX_BREAKOUT_ROOMS = 12;



class numberOfBreakouts extends Component {
constructor(props) {
    super(props);

    this.changeNumberOfRooms = this.changeNumberOfRooms.bind(this);
    this.state = {

      numberOfRooms: MIN_BREAKOUT_ROOMS,
      seletedId: '',
      users: [],
      durationTime: 15,
      freeJoin: false,
      formFillLevel: 1,
      roomSelected: 0,
      preventClosing: true,
      valid: true,
      record: false,
      numberOfRoomsIsValid: true,
          
        currentStep: 0,
       
        username: '',
        password: '',
      
    };
}


changeNumberOfRooms(event) {
  
  
  const numberOfRooms = Number.parseInt(event.target.value, 10);
  this.setState({
    numberOfRooms,
    numberOfRoomsIsValid: numberOfRooms <= MAX_BREAKOUT_ROOMS
    && numberOfRooms >= MIN_BREAKOUT_ROOMS,
  });
}




_next = () => {
  let currentStep = this.state.currentStep
  currentStep = currentStep >= 4? 5: currentStep + 1
  this.setState({
    currentStep: currentStep
  })
  
}

nextButton(){
  let currentStep = this.state.currentStep;
  if(currentStep ==0){
    return (
      <button 
        className={styles.nbtn}
       // className="btn btn-primary float-right" 
        type="button" onClick={this._next}>
      Next
      </button>        
    )
  }
  
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
return null;
}

    render() {

      const{numberOfRoomsSelected}=this.props
      const {
        numberOfRooms,
        currentStep,
        durationTime,
        numberOfRoomsIsValid,
      } = this.state;


      
       { if (currentStep !== 0) {
          
          
          return ( <Assign   
            users={this.props.users}
            currentStep={this.props.currentStep} 
            numberOfRooms={numberOfRooms}
            handleChange={this.handleChange}
           
          
         />)
         }
         return ( <div>
          <div className={styles.heading}>How many breakout channels do you want?</div> 

        <div  className={styles.number}>
          <select
            id="numberOfRooms"
            name="numberOfRooms"
            className={styles.num}
            value={!numberOfRoomsSelected||numberOfRooms?numberOfRooms:numberOfRoomsSelected}
           // value={this.props.numberOfRooms}
            onChange={this.changeNumberOfRooms}
          //  aria-label={intl.formatMessage(intlMessages.numberOfRooms)}
          >
            {
              _.range(MIN_BREAKOUT_ROOMS, MAX_BREAKOUT_ROOMS + 1).map(item => (<option key={_.uniqueId('value-')}>{item}</option>))
            }
          </select>
          <div className={styles.btns}>
          {this.nextButton()}
        {/* {this.previousButton()} */}
        
        </div>
          </div>



          </div>);
        } ;
    }
}

numberOfBreakouts.propTypes = propTypes;
numberOfBreakouts.defaultProps = defaultProps;


export default numberOfBreakouts;