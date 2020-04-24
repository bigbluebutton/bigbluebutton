import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Assign from '../assigning to breakouts/component';
import styles from './styles.scss';

import Button from '/imports/ui/components/button/component';
import HoldButton from '/imports/ui/components/presentation/presentation-toolbar/zoom-tool/holdButton/component';
const propTypes = {

  users: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {};

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
          
        currentStep: 1,
       
        username: '',
        password: '',
      
    };
}


changeNumberOfRooms(event) {
//  console.log(numberOfRooms);
  
  const numberOfRooms = Number.parseInt(event.target.value, 10);
  this.setState({
    numberOfRooms,
    numberOfRoomsIsValid: numberOfRooms <= MAX_BREAKOUT_ROOMS
    && numberOfRooms >= MIN_BREAKOUT_ROOMS,
  });

}


toggleChange = () => {
  this.setState({
    assign: !this.state.assign,
  });
}
    render() {
      const {
        numberOfRooms,
        durationTime,
        numberOfRoomsIsValid,
      } = this.state;
       { if (this.props.currentStep !== 0) {
          console.log(this.props);
          
         
          return ( <Assign   users={this.props.users}
            currentStep={this.props.currentStep} 
            handleChange={this.handleChange}
            email={this.state.email}
          
         />);}
          
        //  {this.props.users.map(user=>{user.assign=false, user.room=0})}
         return ( <div>
          <div className={styles.heading}>How many breakout channels do you want?</div> 

        


<div  className={styles.number}>
          <select
            id="numberOfRooms"
            name="numberOfRooms"
            className={styles.num}
            // className={cx(styles.inputRooms, !numberOfRoomsIsValid
            //   && styles.errorBorder)}
            value={numberOfRooms}
            onChange={this.changeNumberOfRooms}
          //  aria-label={intl.formatMessage(intlMessages.numberOfRooms)}
          >
            {
              _.range(MIN_BREAKOUT_ROOMS, MAX_BREAKOUT_ROOMS + 1).map(item => (<option key={_.uniqueId('value-')}>{item}</option>))
            }
          </select>
          </div>
          </div>);
        } ;
    }
}

numberOfBreakouts.propTypes = propTypes;
numberOfBreakouts.defaultProps = defaultProps;


export default numberOfBreakouts;