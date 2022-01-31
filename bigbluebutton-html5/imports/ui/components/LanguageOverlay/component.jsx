import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import Meeting from "/imports/ui/services/meeting";
import AudioManager from '/imports/ui/services/audio-manager';
import Styled from './styles';

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
    connectionSettingUp: {
        id: 'app.translation.language.connection.settingUp',
        description: 'Symbol when connection to translation/translator channel is setting up',
        defaultMessage: '...',
    },
    connectionEstablished: {
        id: 'app.translation.language.connection.established',
        description: 'Symbol when connection to translation/translator channel is established',
        defaultMessage: '✓',
    },
});

class LanguageOverlay extends Component{

    state = {
        languages: [{name: "Floor", extension:-1}],
        isConnecting: false,
    }

    clickHandler = (language) => {
        if (language.extension > 0) {
            this.setState({ isConnecting: true });
        } else {
            this.setState({ isConnecting: false });
        }

        let handler = this.props.clickHandler;
        handler(language, () => {
            this.setState({ isConnecting: false });
        });
    }

    render() {
        const {
            isConnecting,
        } = this.state;

        const {
            intl,
        } = this.props;

        const connectionMessage = intl.formatMessage(isConnecting ? intlMessages.connectionSettingUp : intlMessages.connectionEstablished);
        const filteredLanguageExtensions = new Set(this.props.filteredLanguages.map(language => language.extension));

        return(
            <Styled.LanguageOverlay>
                <ul>
                    {this.state.languages.map(function (language) {
                        let languageMarker = null;
                        const languageIsFiltered = language.extension !== -1 && filteredLanguageExtensions.has(language.extension);

                        if (languageIsFiltered) {
                            languageMarker = this.props.filterMarker;
                        } else if (this.props.current && language.extension === this.props.current.extension) { //language language is selected
                            languageMarker = connectionMessage;
                        } else if (this.props.current === null && language.extension === -1) { //if no language is select use standart language(-1)
                            languageMarker = connectionMessage;
                        }

                        return (
                            <Styled.LanguageOption
                                filtered={languageIsFiltered}
                                key={language.extension}
                                onClick={languageIsFiltered ? null : () => this.clickHandler(language)}
                            >
                            <span>
                                {language.name}
                            </span>
                                <span>
                                {languageMarker}
                            </span>
                            </Styled.LanguageOption>
                        );
                    },this)}
                </ul>
            </Styled.LanguageOverlay>);
    }
    componentDidMount() {
        const {
            intl,
        } = this.props;

        Meeting.getLanguages().then(languages => {
            languages.push({
                name: intl.formatMessage(this.props.translator ? intlMessages.noneLanguage : intlMessages.originLanguage),
                extension: -1,
            });

            this.setState({languages: languages})
            harborRender()
        });
    }
}

export default LanguageOverlay;