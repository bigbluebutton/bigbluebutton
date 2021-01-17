import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import Meeting from "/imports/ui/services/meeting";
import AudioManager from '/imports/ui/services/audio-manager';
import styles from "./styles.scss"

const intlMessages = defineMessages({
    originLanguage: {
      id: 'app.translation.language.origin',
      description: 'Name of origin language',
      defaultMessage: 'Floor',
    },
    noneLanguage: {
      id: 'app.translation.language.none',
      description: 'Name of none language',
      defaultMessage: 'None',
    },
});

class LanguageOverlay extends Component{

    state = {
        languages: [{name: "Floor", extension:-1}],
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
                    }}> <span>{language.name}</span>{((this.props.current && language.extension === this.props.current.extension) || (this.props.current === null && language.extension === -1)) && <span>&#x2713;</span>}</li>
                },this)}
            </ul>
        </div>);
    }
    componentDidMount() {
        const {
            intl,
        } = this.props;

        Meeting.getLanguages().then(languages => {
            if(this.props.filteredLanguages) {
                let filteredLanguageExtensions = new Set(this.props.filteredLanguages
                    .map(language => language.extension));
                languages = languages.filter(language => !filteredLanguageExtensions.has(language.extension));
            }
            languages.push({
                name: intl.formatMessage(this.props.translator ? intlMessages.noneLanguage : intlMessages.originLanguage),
                extension: -1,
            });

            this.setState({languages: languages})
            harborRender()
        });
    }
}

export default LanguageOverlay
