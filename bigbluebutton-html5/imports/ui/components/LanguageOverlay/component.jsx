import React, { Component } from 'react';

class LanguageOverlay extends Component{
    render() {
       return(
        <div>
            <ul>
                <li>Original</li>
                <li>English</li>
            </ul>
        </div>);
    }
    componentDidMount() {
        harborRender()
    }
}

export default LanguageOverlay
