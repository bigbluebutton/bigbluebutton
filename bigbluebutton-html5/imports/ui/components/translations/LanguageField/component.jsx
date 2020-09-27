import React, { Component } from 'react';
import {styles} from "./styles.scss"

class Language extends Component{

    render() {
        return(
            <div className={styles.languageContainer}>
                <text>{this.props.name}</text>
            </div>
        );
    }

}

export default Language
