import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import { withRouter } from 'react-router';
import { Button } from '../shared/Button.jsx';
import { Icon } from '../shared/Icon.jsx';

const propTypes = {
  presentationTitle: PropTypes.string.isRequired,
  hasUnreadMessages: PropTypes.bool.isRequired,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
};

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.handleToggleUserList = this.handleToggleUserList.bind(this);
  }

  handleToggleUserList() {
    /*
      TODO: Find out how to get the current route here
      so we can change the click behavior
    */
    this.props.router.push('/html5client/users');
  }

  render() {
    const { presentationTitle } = this.props;
    return (
      <div>
        <button onClick={this.handleToggleUserList}>
          <i className="icon-bbb-user"></i>
        </button>
        <span>{presentationTitle}</span>
        <span id="settingsButtonPlaceHolder"></span>
      </div>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;

export default withRouter(NavBar);
