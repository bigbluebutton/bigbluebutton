import React, { Component } from 'react';
import MeetingService from "../../services/Meetings";
import AudioManager from '/imports/ui/services/audio-manager';

class LanguageOverlay extends Component{

    state = {
        language: []
    }

    render() {
       return(
        <div>
            <ul>
                {this.state.language.map(function (language) {
                    return <li onClick={() => AudioManager.openTranslatorChannel(language.sequence)}> {language.name} </li>
                })}
            </ul>
        </div>);
    }
    componentDidMount() {
        const service = new MeetingService();
        let breakouts = service.findBreakouts()
        this.state.language = breakouts
        this.setState(this.state)
        harborRender()
    }
}

export default LanguageOverlay
