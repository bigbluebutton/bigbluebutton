import React, { Component } from 'react';
import Meeting from "../../services/Meetings";
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
                    }}> <span>{language.name}</span>  {this.props.current && language.extension === this.props.current.extension && <span>&#x2713;</span> } </li>
                },this)}
            </ul>
        </div>);
    }
    componentDidMount() {
        const service = new MeetingService();
        let breakouts = service.getLanguages()
        if(this.props.other){
            breakouts = breakouts.filter((c)=>{
                return !(c.extension === this.props.other.extension)
            });
        }
        this.state.language = breakouts
        this.state.language.push({name: "None", sequence:-1})
        this.setState(this.state)
        harborRender()
    }
}

export default LanguageOverlay
