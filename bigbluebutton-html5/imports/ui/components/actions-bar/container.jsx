import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ActionsBar from './component';
import Service from './service';
import { joinListenOnly } from '/imports/api/phone';

class ActionsBarContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      voiceAudio: false,
    }
  }

  componentDidMount(){
    if(this.props.isInVoiceAudio){
      this.setState({voiceAudio: true});
    }else{
      this.setState({voiceAudio: false});
    }
  }

  render() {
    const handleJoinListenOnly = () => joinListenOnly();
    const isInVoiceAudio = Service.isInVoiceAudio();
    //console.log(isInVoiceAudio);

    return (
      <ActionsBar
       handleJoinListenOnly={handleJoinListenOnly}
       isInVoiceAudio={isInVoiceAudio}
      {...this.props}>
        {this.props.children}
      </ActionsBar>
    );
  }
}

export default createContainer(() => {
  let data = Service.isUserPresenter();
  return data;
}, ActionsBarContainer);
