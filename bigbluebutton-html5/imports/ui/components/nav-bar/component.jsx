import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import Button from '../button/component';
import RecordButton from './recordbutton/component';
import SettingsDropdown from '../modals/dropdown/component';

const propTypes = {
  presentationTitle: PropTypes.string.isRequired,
  hasUnreadMessages: PropTypes.bool.isRequired,
  beingRecorded: PropTypes.bool.isRequired,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  beingRecorded: false,
};

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.handleToggleUserList = this.handleToggleUserList.bind(this);
  }

  handleToggleUserList() {
    this.props.toggleUserList();
  }

  clickEvent() {
    console.log("Clicked button");
    return <Dropdown beingClicked={true} />;
  }

  render() {
    const { presentationTitle, beingRecorded } = this.props;
    document.title = presentationTitle;

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
            <RecordButton beingRecorded={beingRecorded}/>
          </div>
        </div>
        <div className={styles.right}>
          <SettingsDropdown />
        </div>
      </div>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;

export default NavBar;
