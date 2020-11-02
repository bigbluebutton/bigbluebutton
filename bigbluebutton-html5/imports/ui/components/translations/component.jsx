import {styles} from "./styles.scss";
import NewLanguage from  "./NewLanguage/component"
import Language from "./LanguageField/component";
import React, { Component } from 'react';
import { makeCall } from '/imports/ui/services/api';
import Meeting from "/imports/ui/services/meeting";
import Button from '/imports/ui/components/button/component';


class Translations extends Component{

    componentDidMount() {
        Meeting.getLanguages().then(breakouts=>{
            breakouts = breakouts.map((room)=>{
                return {name: room.name, edit:false}
            });
            let active = breakouts.length > 0;
            this.setState({languages: breakouts, active: active })
        })
    }

    createEditForm = () => {
        if( this.state.languages.length < 8 ){
            this.state.languages.push({name:"?", edit:"true"})
            this.setState(this.state)
        }

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
        let languages = this.state.languages.map(language => {
            return language.name;
        })
        if(!languages.length){
            this.state.warning = "Please add a language."
            this.setState(this.state)
            return
        }
        Meeting.setLanguages(languages);
        this.state.active = true
        this.setState(this.state)
    }

    endTranslation = () =>{
        Meeting.clearLanguages()
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
                <Button
                    onClick={() => {
                        Session.set('idChatOpen', '');
                        Session.set('openPanel', 'userlist');
                        window.dispatchEvent(new Event('panelChanged'));
                    }}
                    aria-label=""
                    label="Translations"
                    icon="left_arrow"
                    className={styles.hideBtn}
                />
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
