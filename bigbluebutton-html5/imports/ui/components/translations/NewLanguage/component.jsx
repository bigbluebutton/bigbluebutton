import React, { Component } from 'react';
import {styles} from "./styles.scss"

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
        return(
            <div className={styles.languageContainer}>
                <input placeholder={"New Language"} value={this.state.name} onChange={this.handleChange}/>
                <button className={styles.check} onClick={this.creationHandler}>confirm</button>
            </div>
        );
    }

}

export default NewLanguage
