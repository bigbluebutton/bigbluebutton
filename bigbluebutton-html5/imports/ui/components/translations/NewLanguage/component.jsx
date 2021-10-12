import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import {styles} from "./styles.scss"

const intlMessages = defineMessages({
    newLanguagePlaceholder: {
        id: 'app.translation.newLanguage',
        description: 'New language placeholder',
        defaultMessage: 'New Language',
    },
    confirmLanguageLabel: {
        id: 'app.translation.confirmLanguage',
        description: 'Label for add language button',
        defaultMessage: 'confirm',
    },
});

class NewLanguage extends Component{

    state = {
        name: ""
    }
    creationHandler = () => {
        this.props.creationHandler(this.state.name, this.props.index);
    }
    handleChange = (event) => {
        this.setState({name: event.target.value});
    };
    render() {
        const {
            intl,
        } = this.props;

        return(
            <div className={styles.languageContainer}>
                <input placeholder={intl.formatMessage(intlMessages.newLanguagePlaceholder)} value={this.state.name} onChange={this.handleChange}/>
                <button className={styles.check} onClick={this.creationHandler}>{intl.formatMessage(intlMessages.confirmLanguageLabel)}</button>
            </div>
        );
    }

}

export default NewLanguage
