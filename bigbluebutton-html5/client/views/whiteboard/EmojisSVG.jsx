import React from 'react';

EmojisSVG = React.createClass ({
  render() {
    if(this.props.emoji == "happy-face") {
      return ( <svg width={this.props.size} height={this.props.size} viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="14" stroke="white" strokeWidth="3" fill="transparent"/>
        <circle cx="19" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
        <circle cx="31" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
        <path d="m18 30 C 21 33, 29 33, 32 30" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" fill="none" />
      </svg> 
      );
    }
    else if(this.props.emoji == "neutral-face") {
      return (
        <svg width={this.props.size} height={this.props.size} viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="14" stroke="white" strokeWidth="3" fill="transparent"/>
          <circle cx="19" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
          <circle cx="31" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
          <path d="m18 30 l 14 0" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
        </svg>
      );
    }
    else if(this.props.emoji == "confused-face") {
      return(
          <svg width={this.props.size} height={this.props.size} viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="14" stroke="white" strokeWidth="3" fill="transparent"/>
            <circle cx="19" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
            <circle cx="31" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
            <path d="M18 30 C 20 28, 22 28, 25 30 S 30 32, 32 30" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
          </svg>
      );
    }
    else if(this.props.emoji == "sad-face") {
      return(
          <svg width={this.props.size} height={this.props.size} viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="14" stroke="white" strokeWidth="3" fill="transparent"/>
            <circle cx="19" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
            <circle cx="31" cy="22" r="1" stroke="white" strokeWidth="2" fill="white"/>
            <path d="m18 30 C 21 27, 29 27, 32 30" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" fill="none" />
          </svg>
      );
    }
    else if(this.props.emoji == "clock") {
      return (
        <svg width={this.props.size} height={this.props.size} viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="14" stroke="white" strokeWidth="3" fill="transparent"/>
          <path d="m25 25 l 0 -8" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
          <path d="m25 25 l 5 5" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round" />
        </svg>
      );
    }
    else if(this.props.emoji == "hand") {
      return (
        <span rel="tooltip" data-placement="bottom" title="{{title}}">
          <i className="ion-android-hand"></i>
        </span>
      );
    }
    else {
      console.log("This shouldn't be happening");
      return ( <span></span> );
    }
  }
});
