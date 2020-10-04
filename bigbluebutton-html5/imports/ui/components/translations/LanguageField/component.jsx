import React, { Component } from 'react';
import {styles} from "./styles.scss"

class Language extends Component{

    render() {
        return(
            <div className={styles.languageContainer}>
                <p>{this.props.name} </p>
                <span className={styles.deleteButton}> &#x1f5d1;</span>
            </div>
        );
    }

}

export default Language
