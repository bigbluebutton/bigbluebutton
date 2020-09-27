import React, { Component } from 'react';
import { styles } from './styles.scss';

class Translations extends Component{
    render() {
        return (
            <div>
                <h2 className={styles.smallTitle}>Translations</h2>
                <div className={styles.translationContainer}>
                    <span className={styles.optionName}>Languages</span>
                </div>
            </div>
        );
    }


}

export default Translations
