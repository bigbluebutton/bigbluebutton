import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

const propTypes = {
  presentationTitle: PropTypes.string.isRequired,
  hasUnreadMessages: PropTypes.bool.isRequired,
};

const defaultProps = {
  presentationTitle: 'Default Presentation Title',
  hasUnreadMessages: false,
};

export default class Navbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { presentationTitle } = this.props;
    return (
      <div>
        <Link to="/html5client/users">
          <i className="icon-bbb-user"></i>
        </Link>
        <h1>{presentationTitle}</h1>
      </div>
    );
  }
}

Navbar.propTypes = propTypes;
Navbar.defaultProps = defaultProps;
