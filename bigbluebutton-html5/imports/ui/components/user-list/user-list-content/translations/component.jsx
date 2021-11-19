import React, { Component } from 'react';
import Styled from './styles';
import { defineMessages } from 'react-intl';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';

const intlMessages = defineMessages({
    translationTitle: {
        id: 'app.translation.translation.title',
        description: 'Translation title',
        defaultMessage: 'Translation',
    },
    languagesTitle: {
        id: 'app.translation.languages.title',
        description: 'Languages title',
        defaultMessage: 'Languages',
    },
});

class Translations extends Component{
    toggleLanguagesPanel = () => {
        const {
            layoutContextDispatch,
            sidebarContentPanel,
        } = this.props;

        layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: sidebarContentPanel !== PANELS.TRANSLATIONS,
        });
        layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value:
            sidebarContentPanel === PANELS.TRANSLATIONS
                ? PANELS.NONE
                : PANELS.TRANSLATIONS,
        });
    }

    componentDidMount() {
        window.addEventListener('panelChanged',()=>{
            this.forceUpdate()
        });
    }


    render() {
        const {
            intl,
        } = this.props;

        return (
            <div key={"translation-options"}>
                <Styled.SmallTitle>
                    {intl.formatMessage(intlMessages.translationTitle)}
                </Styled.SmallTitle>
                <Styled.TranslationContainer active={Session.get("openPanel") ===  "translations"}>
                    <img
                        className="icon-bbb-languages"
                        src='/html5client/svgs/translations.svg'
                    />
                    <Styled.OptionName onClick={this.toggleLanguagesPanel}>
                        {intl.formatMessage(intlMessages.languagesTitle)}
                    </Styled.OptionName>
                </Styled.TranslationContainer>
            </div>
        );
    }
}

export default Translations;
