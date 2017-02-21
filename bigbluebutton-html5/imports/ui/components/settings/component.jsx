import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from '/imports/ui/components/modal/component';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import ClosedCaptions from '/imports/ui/components/settings/submenus/closed-captions/component';
import Audio from '/imports/ui/components/settings/submenus/audio/component';
import Application from '/imports/ui/components/settings/submenus/application/component';
import Participants from '/imports/ui/components/settings/submenus/participants/component';
import Video from '/imports/ui/components/settings/submenus/video/component';

import Button from '../button/component';
import Icon from '../icon/component';
import styles from './styles';
import cx from 'classnames';

const propTypes = {
};

export default class Settings extends Component {
  constructor(props) {
    super(props);

    console.log('CONSTRUCTOR SETTINGS', props);
    this.state = {
      current: {
        audio: props.audio,
        video: props.video,
        application: props.application,
        cc: props.cc,
        participants: props.participants,
      },
      selectedTab: 3,
    };

    this.handleSettingsApply = props.updateSettings;
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
            console.log('SETTINGS', this.state.current);
            this.handleSettingsApply(this.state.current);
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
    console.log(key, newSettings);
    let settings = {
      current: this.state.current,
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
          <Audio
            settings={this.state.current.audio}
            handleUpdateSettings={this.handleUpdateSettings}/>
        </TabPanel>
        <TabPanel className={styles.tabPanel}>
          <Video
            handleUpdateSettings={this.handleUpdateSettings}
            settings={this.state.current.video}
            />
        </TabPanel>
        <TabPanel className={styles.tabPanel}>
          <Application />
        </TabPanel>
        <TabPanel className={styles.tabPanel}>
          <ClosedCaptions
            settings={this.state.current.cc}
            handleUpdateSettings={this.handleUpdateSettings}
            locales={this.props.locales}/>
        </TabPanel>
        <TabPanel className={styles.tabPanel}>
          <Participants
            settings={this.state.current.participants}
            handleUpdateSettings={this.handleUpdateSettings}/>
        </TabPanel>
      </Tabs>
    );
  }
}

Settings.propTypes = propTypes;
