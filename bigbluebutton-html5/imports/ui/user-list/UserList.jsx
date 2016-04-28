import React, { Component } from 'react';
import { Link } from 'react-router';

export default class UserList extends Component {
  render() {
    return (
      <div>
        <ul>
          <li><b>USER-LIST</b></li>
          <li>
            <Link to="/html5client/users/chat">Open Public chat</Link>
          </li>
          <li>
            <Link to={`/html5client/users/chat/${'fred-dixon'}`}>Open Private Chat With Fred</Link>
          </li>
          <li>
            <Link to={`/html5client/users/chat/${'tiago-jacobs'}`}>Open Private Chat With Tiago</Link>
          </li>
        </ul>
        {this.props.children}
      </div>
    )
  }
}
