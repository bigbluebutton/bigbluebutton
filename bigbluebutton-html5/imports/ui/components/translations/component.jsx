import {styles} from "./styles.scss";
import NewLanguage from  "./NewLanguage/component"
import Language from "./LanguageField/component";
import React, { Component } from 'react';
import { makeCall } from '/imports/ui/services/api';
import Meeting from "/imports/ui/services/meeting";

class Translations extends Component{

    componentDidMount() {
        let breakouts = Meeting.findBreakouts()
        breakouts = breakouts.map((room)=>{
            return {name: room.name, edit:false}
        });
        let active = breakouts.length > 0;
        this.setState({languages: breakouts, active: active })
    }

    createEditForm = () => {
        if( this.state.languages.length < 8 ){
            this.state.languages.push({name:"?", edit:"true"})
            this.setState(this.state)
        }

    }
    createTranslationChannel(name,sequence){
        return {
            name: name,
            freeJoin: true,
            sequence: sequence,
            users: []
        };
    }
    creationHandler = (name, index) =>{
        if(!name.length)
            return
        this.state.languages[index].name = name;
        this.state.languages[index].edit = false;
        this.setState(this.state)
    }

    deletionHandler = (index)=>{
        this.state.languages.splice(index,1)
        this.setState(this.state)
    }

    startTranslation = () => {
        let inedit = this.state.languages.filter((language)=>{
            return language.edit
        });
        if(inedit.length){
            this.state.warning = "Please confirm all languages."
            this.setState(this.state)
            return
        }
        let i = 1;
        let val = this.state.languages.map((language)=>{
            return this.createTranslationChannel(language.name,i++)
        })
        if(!val.length){
            this.state.warning = "Please add a language."
            this.setState(this.state)
            return
        }
        makeCall('createBreakoutRoom', val, 999, false)
        this.state.active = true
        this.setState(this.state)
    }

    endTranslation = () =>{
        makeCall('endAllBreakouts');
        this.state.languages = [];
        this.state.active = false
        this.state.warning = ""
        this.setState(this.state)
    }

    state ={
        languages: [],
        active: false,
        warning: ""
    }
    render() {
        let button;
        let add = ""
        if(!this.state.active){
            button =  <button  onClick={this.startTranslation}> Start Translation</button>;
            add =     <div> <span className={styles.addLanguage} onClick={this.createEditForm}>+ Add Language</span></div>
        }else{
            button =  <button  onClick={this.endTranslation}> End Translation</button>;
        }
        return (
            <div key={"translation"} className={styles.translationPanel}>
                <span>Translations</span>
                {this.state.languages.map(function (language, index) {
                    if(language.edit){
                        return <NewLanguage  key={index} index={index} creationHandler={this.creationHandler}/>
                    }else{
                        return <Language active={this.state.active} name={language.name} key={index} index={index} deletionHandler={this.deletionHandler}/>
                    }
                }, this)}
                {add}
                {button}
                <p>{this.state.warning}</p>
            </div>
        );
    }
}

export default Translations
