import React, { Component } from 'react';
import MeetingService from "../../services/Meetings";
import AudioManager from '/imports/ui/services/audio-manager';
import styles from "./styles.scss"

class LanguageOverlay extends Component{

    state = {
        language: [{name:"None", sequence:-1}]
    }

    clickHandler = (language) => {
        let handler = this.props.clickHandler;
        handler(language);
        this.forceUpdate()
    }

    render() {

       return(
        <div>
            <ul>
                {this.state.language.map(function (language) {
                    return <li className={styles.languageOption} onClick={() => {
                        this.clickHandler(language)
                    }}> {language.name}  {this.props.current && language.name === this.props.current.name && <span>&#x2713;</span> } </li>
                },this)}
            </ul>
        </div>);
    }
    componentDidMount() {
        const service = new MeetingService();
        let breakouts = service.findBreakouts()
        this.state.language = breakouts
        this.state.language.push({name: "None", sequence:-1})
        this.setState(this.state)
        harborRender()
    }
}

export default LanguageOverlay
