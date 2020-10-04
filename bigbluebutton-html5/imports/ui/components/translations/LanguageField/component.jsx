import React, { Component } from 'react';
import {styles} from "./styles.scss"

class Language extends Component{

    delete = () =>{
        let func = this.props.deletionHandler
        func(this.props.index)
    }

    render() {
        let del = "";
        if(!this.props.active){
            del = <span className={styles.deleteButton} onClick={this.delete}> &#x1f5d1;</span>
        }
        return(
            <div className={styles.languageContainer}>
                <p>{this.props.name} </p>
                {del}
            </div>
        );
    }

}

export default Language
