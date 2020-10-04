import {styles} from "./styles.scss";
import NewLanguage from  "./NewLanguage/component"
import Language from "./LanguageField/component";
import React, { Component } from 'react';
import { makeCall } from '/imports/ui/services/api';
import MeetingService from "../../services/Meetings";

class Translations extends Component{

    componentDidMount() {
        const service = new MeetingService();
        let breakouts = service.findBreakouts()
        breakouts = breakouts.map((room)=>{
            return {name: room.name, edit:false}
        });
        console.log(breakouts)
        this.setState({languages: breakouts })
    }

    createEditForm = () => {
        if( this.state.languages.length < 8 ){
            this.state.languages.push({name:"?", edit:"true"})
            this.setState(this.state)
        }

    }
    createTranslationChannel(name){
        let param1 = [{
            name: name,
            freeJoin: true,
            sequence: 1,
            users: []
        }];
        makeCall('createBreakoutRoom', param1, 999, false)
    }
    creationHandler = (name, index) =>{
        if(!name.length)
            return
        this.state.languages[index].name = name
        this.state.languages[index].edit = false;
        this.setState(this.state)
        //this.createTranslationChannel(name)
    }

    deletionHandler = (index)=>{
        this.state.languages.splice(index,1)
    }

    state ={
        languages: []
    }
    render() {
        return (
            <div key={"translation"} className={styles.translationPanel}>
                <span>Translations</span>
                {this.state.languages.map(function (language, index) {
                    if(language.edit){
                        return <NewLanguage key={index} index={index} creationHandler={this.creationHandler}/>
                    }else{
                        return <Language name={language.name} key={index} index={index} deletionHandler={this.deletionHandler}/>
                    }
                }, this)}
                <div>
                    <span className={styles.addLanguage} onClick={this.createEditForm}>+ Add Language</span>
                </div>
                <div className={styles.buttonContainer}>

                </div>
            </div>
        );
    }
}

export default Translations
