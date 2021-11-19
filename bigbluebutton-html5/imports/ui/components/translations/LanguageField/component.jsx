import React, { Component } from 'react';
import Styled from './styles';

class Language extends Component{

    delete = () =>{
        let func = this.props.deletionHandler
        func(this.props.index)
    }

    render() {
        let del = "";
        if(!this.props.active){
            del = <Styled.DeleteButton onClick={this.delete}> &#x1f5d1;</Styled.DeleteButton>
        }
        return(
            <Styled.LanguageContainer>
                <p>{this.props.name} </p>
                {del}
            </Styled.LanguageContainer>
        );
    }

}

export default Language
