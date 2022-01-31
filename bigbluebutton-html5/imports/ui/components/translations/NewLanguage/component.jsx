import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import Styled from './styles';

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
            <Styled.LanguageContainer>
                <input placeholder={intl.formatMessage(intlMessages.newLanguagePlaceholder)} value={this.state.name} onChange={this.handleChange}/>
                <Styled.CheckButton onClick={this.creationHandler}>{intl.formatMessage(intlMessages.confirmLanguageLabel)}</Styled.CheckButton>
            </Styled.LanguageContainer>
        );
    }

}

export default NewLanguage