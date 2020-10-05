import React, { Component } from 'react';
import MeetingService from "../../services/Meetings";

class LanguageOverlay extends Component{

    state = {
        language: []
    }

    render() {
       return(
        <div>
            <ul>
                {this.state.language.map(function (language) {
                    return <li>{language}</li>
                })}
            </ul>
        </div>);
    }
    componentDidMount() {
        const service = new MeetingService();
        let breakouts = service.findBreakouts()
        breakouts = breakouts.map((room)=>{
            return room.name
        })
        this.state.language = breakouts
        this.setState(this.state)
        harborRender()
    }
}

export default LanguageOverlay
