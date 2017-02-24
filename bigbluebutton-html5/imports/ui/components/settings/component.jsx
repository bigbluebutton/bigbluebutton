import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from '/imports/ui/components/modal/component';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import ClosedCaptions from '/imports/ui/components/settings/submenus/closed-captions/component';
import Audio from '/imports/ui/components/settings/submenus/audio/component';
import Application from '/imports/ui/components/settings/submenus/application/container';
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

    this.state = {
      current: {
        audio: props.audio,
        video: props.video,
        application: props.application,
        cc: props.cc,
        participants: props.participants,
      },
      saved: {
        audio: props.audio,
        video: props.video,
        application: props.application,
        cc: props.cc,
        participants: props.participants,
      },
      selectedTab: 2,
    };

    this.handleSettingsApply = props.updateSettings;
    this.handleUpdateSettings = this.handleUpdateSettings.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
  }

  setHtmlFontSize(size) {
    document.getElementsByTagName('html')[0].style.fontSize = size;
  };

  render() {
    return (
      <Modal
        title="Settings"
        confirm={{
          callback: (() => {
            this.handleSettingsApply(this.state.current);
          }),
          label: 'Save',
          description: 'Saves the changes and close the settings menu',
        }}
        dismiss={{
          callback: (() => {
            // this.setHtmlFontSize(this.state.saved.application.fontSize);
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
      current: this.state.current,
    };
    settings.current[key] = newSettings;
    this.setState(settings);
  }

  handleSelectTab(tab) {
    this.setState({
      selectedTab: tab,
    });
  }

  renderModalContent() {
    const {
      isModerator,
    } = this.props;

    return (
      <Tabs
        className={styles.tabs}
        onSelect={this.handleSelectTab}
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
          { isModerator ?
            <Tab className={styles.tabSelector}>
              <Icon iconName='user' className={styles.icon}/>
              Participants
            </Tab>
            : null }
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
          <Application
            handleUpdateSettings={this.handleUpdateSettings}
            settings={this.state.current.application}
            />
        </TabPanel>
        <TabPanel className={styles.tabPanel}>
          <ClosedCaptions
            settings={this.state.current.cc}
            handleUpdateSettings={this.handleUpdateSettings}
            locales={this.props.locales}/>
        </TabPanel>
        { isModerator ?
          <TabPanel className={styles.tabPanel}>
            <Participants
              settings={this.state.current.participants}
              handleUpdateSettings={this.handleUpdateSettings}/>
          </TabPanel>
          : null }
      </Tabs>
    );
  }
}

Settings.propTypes = propTypes;
