import React, { Component } from 'react';
import { styles } from './styles.scss';
import { defineMessages, injectIntl } from 'react-intl';

class Translations extends Component{
    toggleLanguagesPanel = () => {
        if(Session.get("openPanel") === "userlist"){
            Session.set('openPanel', "translations" )
            window.dispatchEvent(new Event('panelChanged'));
        }else if(Session.get("openPanel") ===  "translations"){
            Session.set('openPanel', 'userlist' );
            window.dispatchEvent(new Event('panelChanged'));
        }else {
            Session.set('openPanel', 'userlist' );
            window.dispatchEvent(new Event('panelChanged'));
            setTimeout(function (){
                Session.set('openPanel', 'translations' );
                window.dispatchEvent(new Event('panelChanged'));
            },200);
        }
    };
    render() {
        return (
            <div key={"translation-options"}>
                <h2 className={styles.smallTitle}>Translations</h2>
                <div className={styles.translationContainer}>
                    <img
                        className="icon-bbb-languages"
                        src='/html5client/svgs/translations.svg'
                    /><span className={styles.optionName} onClick={this.toggleLanguagesPanel}>Languages</span>
                </div>
            </div>
        );
    }
}

export default Translations;
