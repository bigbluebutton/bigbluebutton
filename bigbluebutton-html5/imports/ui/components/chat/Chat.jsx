import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Chat extends Component {
  render() {
    return (
      <div>
        You are chatting with {this.props.currentChat}
      </div>
    );
  }
}
