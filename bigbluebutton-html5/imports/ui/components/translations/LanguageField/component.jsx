import React, { Component } from 'react';
import {styles} from "./styles.scss"
import { makeCall } from '/imports/ui/services/api';

class Language extends Component{

    createTranslationChannel(){
        console.log("create translation channel")
        let param1 = [{
            name: "Englisch",
            freeJoin: true,
            sequence: 1,
            users: []
        }];
        makeCall('createBreakoutRoom', param1, 999, false)
    }

    render() {
        console.log(this.props)
        return(
            <div className={styles.languageContainer} onClick={this.createTranslationChannel}>
                <p>{this.props.name}</p>
            </div>
        );
    }

}

export default Language
