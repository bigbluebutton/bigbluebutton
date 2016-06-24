import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import { withRouter } from 'react-router';
import Button from '../button/component';
import RecordButton from './recordbutton/component';

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
    this.props.router.push('/users');
  }

  render() {
    const { presentationTitle } = this.props;
    document.title = presentationTitle

    return (
      <div className={styles.navbar}>
        <div className={styles.left}>
        <Button
          onClick={this.handleToggleUserList}
          ghost={true}
          circle={true}
          hideLabel={true}
          label={'Toggle User-List'}
          icon={'user'}
          className={styles.btn}
        />
        </div>
        <div className={styles.center}>
          <h1 className={styles.presentationTitle}>{presentationTitle}</h1>
          <span className={styles.divideBar}> | </span>
          <div className={styles.record}>
            <RecordButton />
          </div>
        </div>
        <div className={styles.right}>
          <span id="settingsButtonPlaceHolder"></span>
        </div>
      </div>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;

export default withRouter(NavBar);
