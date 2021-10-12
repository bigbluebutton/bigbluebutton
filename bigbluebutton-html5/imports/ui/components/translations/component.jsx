import {styles} from "./styles.scss";
import NewLanguage from  "./NewLanguage/component"
import Language from "./LanguageField/component";
import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { makeCall } from '/imports/ui/services/api';
import Meeting from "/imports/ui/services/meeting";
import Button from '/imports/ui/components/button/component';
import AudioManager from '/imports/ui/services/audio-manager';

const intlMessages = defineMessages({
    translationsTitle: {
        id: 'app.translation.translations.title',
        description: 'Translation title',
        defaultMessage: 'Translation',
    },
    confirmAllLangugagesWarning: {
        id: 'app.translation.warning.confirmAllLanguages',
        description: 'Warning that ask user to confirm all languages',
        defaultMessage: 'Please confirm all languages.',
    },
    addLangugagesWarning: {
        id: 'app.translation.warning.addLanguages',
        description: 'Warning that ask user to add a language',
        defaultMessage: 'Please add a language.',
    },
    startTranslationLabel: {
        id: 'app.translation.startTranslation',
        description: 'Label for start translation button',
        defaultMessage: 'Start Translation',
    },
    addLanguageLabel: {
        id: 'app.translation.addLanguage',
        description: 'Label for add language button',
        defaultMessage: '+ Add Language',
    },
    endTranslationLabel: {
        id: 'app.translation.endTranslation',
        description: 'Label for end translation button',
        defaultMessage: 'End Translation',
    },
    speechDetectionThresholdInfo: {
        id: 'app.translation.speechDetectionThresholdInfo',
        description: 'Translator speech detection threshold info',
        defaultMessage: 'Translator speech detection threshold info',
    },
    speechDetectionThresholdExplanation: {
        id: 'app.translation.speechDetectionThresholdExplanation',
        description: 'Translator speech detection threshold explanation',
        defaultMessage: 'Translator speech detection threshold explanation',
    },
});

class Translations extends Component{

    componentDidMount() {
        Meeting.getLanguages().then(breakouts=>{
            breakouts = breakouts.map((room)=>{
                return {name: room.name, edit:false}
            });
            let active = breakouts.length > 0;
            this.setState({languages: breakouts, active: active })
        })
    }

    componentDidUpdate() {
        // TranslationManager.$languagesChanged.next(null);
    }

    createEditForm = () => {
        if( this.state.languages.length < 8 ){
            this.state.languages.push({name:"?", edit:"true"})
            this.setState(this.state)
        }

    }

    creationHandler = (name, index) =>{
        if(!name.length)
            return
        this.state.languages[index].name = name;
        this.state.languages[index].edit = false;
        this.setState(this.state)

    }

    deletionHandler = (index)=>{
        this.state.languages.splice(index,1)
        this.setState(this.state)
    }

    startTranslation = () => {
        let inedit = this.state.languages.filter(language => language.edit);
        if (!inedit.length) {
            let languages = this.state.languages.map(language => language.name);
            if (languages.length) {
                Meeting.setLanguages(languages);
                this.setState({
                    active: true,
                    warning: null,
                });
            } else {
                this.setState({ warning: intlMessages.addLangugagesWarning });
            }
        } else {
            this.setState({ warning: intlMessages.confirmAllLangugagesWarning });
        }
    }

    endTranslation = () =>{
        Meeting.clearLanguages();
        this.state.languages = [];
        this.state.active = false
        this.state.warning = ""
        this.setState(this.state)
        // also remove participants from translation rooms
        AudioManager.translatorChannelOpen = false;
        AudioManager.resetCurrentTranslatorChannelExtension();
    }

    state ={
        languages: [],
        active: false,
        warning: null,
        speechDetectionThreshold: AudioManager.$translatorSpeechDetectionThresholdChanged.value,
    }

    componentWillUnmount() {
        window.dispatchEvent(new Event('panelChanged'));
    }

    updateThreshold() {
        AudioManager.$translatorSpeechDetectionThresholdChanged.next(this.state.speechDetectionThreshold);
    }

    setThreshold(pEvent) {
        this.setState({speechDetectionThreshold: pEvent.target.value});
    }

    handleSubmit(pEvent) {
        pEvent.preventDefault();
    }

    render() {
        const {
            intl,
        } = this.props;

        let button;
        let add = ""
        if(!this.state.active){
            button =  <button  onClick={this.startTranslation}>{intl.formatMessage(intlMessages.startTranslationLabel)}</button>;
            add =     <div> <span className={styles.addLanguage} onClick={this.createEditForm}>{intl.formatMessage(intlMessages.addLanguageLabel)}</span></div>;
        }else{
            button =  <button  onClick={this.endTranslation}>{intl.formatMessage(intlMessages.endTranslationLabel)}</button>;
        }
        return (
            <div key={"translation"} className={styles.translationPanel}>
                <Button
                    onClick={() => {
                        Session.set('idChatOpen', '');
                        Session.set('openPanel', 'userlist');
                        window.dispatchEvent(new Event('panelChanged'));
                    }}
                    aria-label=""
                    label={intl.formatMessage(intlMessages.translationsTitle)}
                    icon="left_arrow"
                    className={styles.hideBtn}
                />
                {this.state.languages.map(function (language, index) {
                    if(language.edit){
                        return <NewLanguage
                            key={index}
                            index={index}
                            creationHandler={this.creationHandler}
                            intl={intl}
                        />
                    }else{
                        return (<div style={{margin: "0 0 10px 0"}}>
                            <Language
                            active={this.state.active}
                            name={language.name}
                            key={index}
                            index={index}
                            deletionHandler={this.deletionHandler}
                            intl={intl}
                        />

                        </div>);
                    }
                }, this)}
                {add}
                {button}
                <p>
                    {this.state.warning
                        ? (
                            intl.formatMessage(this.state.warning)
                        )
                        : null
                    }
                </p>
              <div className={styles.speechDetectionThresholdWrapper}>
                <div>{intl.formatMessage(intlMessages.speechDetectionThresholdInfo)}:</div>
                <form onSubmit={this.handleSubmit}>
                    <input id="speechDetectionThreshold" type="number" value={this.state.speechDetectionThreshold} onChange={this.setThreshold.bind(this)} />
                    <input type="submit" onClick={ this.updateThreshold.bind(this) } value="Set" />
                </form>
                <div className={styles.speechDetectionThresholdExplanation}>
                    {intl.formatMessage(intlMessages.speechDetectionThresholdExplanation)}
                </div>
              </div>
            </div>
        );
    }
}

export default injectIntl(Translations);
