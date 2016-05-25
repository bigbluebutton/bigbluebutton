import React, { Component } from 'react';
import styles from './styles.scss';
import { Link } from 'react-router';

export default class UserList extends Component {
  render() {
    return (
      <div>
        <ul>
          <li><b>USER-LIST</b></li>
          <li>
            <Link to="/users/chat">Open Public chat</Link>
          </li>
          <li>
            <Link to={`/users/chat/${'fred-dixon'}`}>Open Private Chat With Fred</Link>
          </li>
          <li>
            <Link to={`/users/chat/${'tiago-jacobs'}`}>Open Private Chat With Tiago</Link>
          </li>
        </ul>
      </div>
    );
  }
}
