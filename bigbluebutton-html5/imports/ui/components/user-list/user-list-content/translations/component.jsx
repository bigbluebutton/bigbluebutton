import React, { Component } from 'react';
import { styles } from './styles.scss';
import { defineMessages, injectIntl } from 'react-intl';

class Translations extends Component{
    toggleLanguagesPanel = () => {

        Session.get("openPanel") ===  "translations" ? Session.set('openPanel', 'userlist' ) : Session.set('openPanel', "translations" );
        window.dispatchEvent(new Event('panelChanged'));
    };
    render() {
        return (
            <div key={"translation-options"}>
                <h2 className={styles.smallTitle}>Translations</h2>
                <div className={styles.translationContainer}>
                    <span className={styles.optionName} onClick={this.toggleLanguagesPanel}>Languages</span>
                </div>
            </div>
        );
    }
}

export default Translations;
