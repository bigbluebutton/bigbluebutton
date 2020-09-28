import {styles} from "./styles.scss";
import NewLanguage from  "./NewLanguage/component"
import Language from "./LanguageField/component";
import React, { Component } from 'react';

class Translations extends Component{
    createEditForm = () => {
        this.state.languages.push({name:"?", edit:"true"})
        this.setState(this.state)
    }

    state ={
        languages: [{name:"English", edit:false}]
    }
    render() {
        return (
            <div key={"translation"} className={styles.translationPanel}>
                <span>Translations</span>
                {this.state.languages.map(function (language) {
                    if(language.edit){
                        return <NewLanguage/>
                    }else{
                        return <Language name={language.name}/>
                    }
                })}
                <div>
                    {/*<span className={styles.addLanguage} onClick={this.createEditForm}>+ Add Language</span> */}
                </div>
            </div>
        );
    }
}

export default Translations
