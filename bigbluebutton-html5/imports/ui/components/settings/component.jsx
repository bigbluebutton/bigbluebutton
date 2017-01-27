import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from '/imports/ui/components/modal/component';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import ClosedCaptions from '/imports/ui/components/settings/submenus/closed-captions/container';
import Audio from '/imports/ui/components/settings/submenus/audio/container';
import Application from '/imports/ui/components/settings/submenus/application/container';
import Participants from '/imports/ui/components/settings/submenus/participants/container';

import Button from '../button/component';
import Icon from '../icon/component';
import styles from './styles';
import cx from 'classnames';

const propTypes = {
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  sidebarRight: PropTypes.element,
  media: PropTypes.element,
  actionsbar: PropTypes.element,
  captions: PropTypes.element,
  modal: PropTypes.element,
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: {
        audio: {},
        cc: {},
      },
      selectedTab: 4,

      // handleSettingsApply: Service.updateSetting(),
    };

    this.handleUpdateSettings = this.handleUpdateSettings.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  render() {
    return (
      <Modal
        title="Settings"
        confirm={{
          callback: (() => {
            // this.commit(this.state.current);
            // this.setState({ activeSubmenu: 0, focusSubmenu: 0 });
            // console.log('SHOULD APPLY SETTINGS CHANGES');
            // this.props.handleSaveFontState();
          }),
          label: 'Save',
          description: 'Saves the changes and close the settings menu',
        }}
        dismiss={{
          callback: (() => {
            // this.setState({ activeSubmenu: 0, focusSubmenu: 0 });
            // console.log('SHOULD DISCART SETTINGS CHANGES');
            // this.props.handleRevertFontState();
          }),
          label: 'Cancel',
          description: 'Discart the changes and close the settings menu',
        }}>
          {this.renderModalContent()}
      </Modal>
    );
  }

  handleUpdateSettings(key, newSettings) {
    let settings = {
      current: {},
    };
    settings.current[key] = newSettings;
    this.setState(settings, () => console.log(this.state));
  }

  handleSelect(tab) {
    this.setState({
      selectedTab: tab,
    });
  }

  renderModalContent() {
    return (
      <Tabs
        className={styles.tabs}
        onSelect={this.handleSelect}
        selectedIndex={this.state.selectedTab}
      >
        <TabList className={styles.tabList}>
          <Tab className={styles.tabSelector}>
            <Icon iconName='audio' className={styles.icon}/>
            <span>Audio</span>
          </Tab>
          <Tab className={styles.tabSelector}>
            <Icon iconName='video' className={styles.icon}/>
            Video
          </Tab>
          <Tab className={styles.tabSelector}>
            <Icon iconName='application' className={styles.icon}/>
            Application
            </Tab>
          <Tab className={styles.tabSelector}>
            <Icon iconName='user' className={styles.icon}/>
            Closed Captions
          </Tab>
          <Tab className={styles.tabSelector}>
            <Icon iconName='user' className={styles.icon}/>
            Participants
          </Tab>
        </TabList>
        <TabPanel className={styles.tabPanel}>
          <Audio handleUpdateSettings={this.handleUpdateSettings}/>
        </TabPanel>
        <TabPanel className={styles.tabPanel}>
          <h2>Hello from Video</h2>
        </TabPanel>
        <TabPanel className={styles.tabPanel}>
          <Application />
        </TabPanel>
        <TabPanel className={styles.tabPanel}>
          <ClosedCaptions/>
        </TabPanel>
        <TabPanel className={styles.tabPanel}>
          <Participants/>
        </TabPanel>
      </Tabs>
    );
  }
}

App.propTypes = propTypes;
