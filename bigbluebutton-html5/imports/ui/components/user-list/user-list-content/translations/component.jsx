import React, { Component } from 'react';
import { styles } from './styles.scss';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';

class Translations extends Component{
    toggleLanguagesPanel = () => {
        if (Session.get("openPanel") === "translations") {
            Session.set('openPanel', "userlist")
            window.dispatchEvent(new Event('panelChanged'));
        } else {
            Session.set('openPanel', 'translations');
            window.dispatchEvent(new Event('panelChanged'));
        }
    }
    componentDidMount() {
        window.addEventListener('panelChanged',()=>{
           this.forceUpdate()
        });
    }


    render() {
        let active = ""
        if(Session.get("openPanel") ===  "translations"){
            active = styles.active
        }
        return (
            <div key={"translation-options"}>
                <h2 className={styles.smallTitle}>Translations</h2>
                <div className={cx(styles.translationContainer, active)}>
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
