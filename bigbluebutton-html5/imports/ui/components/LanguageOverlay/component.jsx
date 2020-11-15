import React, { Component } from 'react';
import Meeting from "/imports/ui/services/meeting";
import AudioManager from '/imports/ui/services/audio-manager';
import styles from "./styles.scss"

class LanguageOverlay extends Component{

    state = {
        languages: [{name: "None", extension:-1}],
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
                {this.state.languages.map(function (language) {
                    return <li className={styles.languageOption} key={language.extension} onClick={() => {
                        this.clickHandler(language)
                    }}> <span>{language.name}</span>  {this.props.current && language.extension === this.props.current.extension && <span>&#x2713;</span> } </li>
                },this)}
            </ul>
        </div>);
    }
    componentDidMount() {
        Meeting.getLanguages().then(languages => {
            if(this.props.filteredLanguages) {
                let filteredLanguageExtensions = new Set(this.props.filteredLanguages
                    .map(language => language.extension));
                languages = languages.filter(language => !filteredLanguageExtensions.has(language.extension));
            }
            this.state.languages = languages
            this.state.languages.push({name: "Original", extension:-1})
            this.setState(this.state)
            harborRender()
        });

    }
}

export default LanguageOverlay
