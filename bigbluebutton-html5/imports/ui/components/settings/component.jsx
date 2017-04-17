import React, { Component } from 'react';
import Modal from '/imports/ui/components/modal/component';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { defineMessages, injectIntl } from 'react-intl';
import ClosedCaptions from '/imports/ui/components/settings/submenus/closed-captions/component';
import Audio from '/imports/ui/components/settings/submenus/audio/component';
import Application from '/imports/ui/components/settings/submenus/application/container';
import Participants from '/imports/ui/components/settings/submenus/participants/component';
import Video from '/imports/ui/components/settings/submenus/video/component';
import _ from 'lodash';

import Icon from '../icon/component';
import styles from './styles';

const intlMessages = defineMessages({
  appTabLabel: {
    id: 'app.settings.applicationTab.label',
    description: 'label for application tab',
  },
  audioTabLabel: {
    id: 'app.settings.audioTab.label',
    description: 'label for audio tab',
  },
  videoTabLabel: {
    id: 'app.settings.videoTab.label',
    description: 'label for video tab',
  },
  closecaptionTabLabel: {
    id: 'app.settings.closedcaptionTab.label',
    description: 'label for closed-captions tab',
  },
  usersTabLabel: {
    id: 'app.settings.usersTab.label',
    description: 'label for participants tab',
  },
});

const propTypes = {
};

class Settings extends Component {
  constructor(props) {
    super(props);

    const audio = props.audio;
    const video = props.video;
    const application = props.application;
    const cc = props.cc;
    const participants = props.participants;

    this.state = {
      current: {
        audio: _.clone(audio),
        video: _.clone(video),
        application: _.clone(application),
        cc: _.clone(cc),
        participants: _.clone(participants),
      },
      saved: {
        audio: _.clone(audio),
        video: _.clone(video),
        application: _.clone(application),
        cc: _.clone(cc),
        participants: _.clone(participants),
      },
      selectedTab: 0,
    };

    this.updateSettings = props.updateSettings;
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
            this.updateSettings(this.state.current);
          }),
          label: 'Save',
          description: 'Saves the changes and close the settings menu',
        }}
        dismiss={{
          callback: (() => {

            this.setHtmlFontSize(this.state.saved.application.fontSize);
          }),
          label: 'Cancel',
          description: 'Discart the changes and close the settings menu',
        }}>
          {this.renderModalContent()}
      </Modal>
    );
  }

  handleUpdateSettings(key, newSettings) {
    let settings = this.state;
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
      intl,
    } = this.props;

    return (
      <Tabs
        className={styles.tabs}
        onSelect={this.handleSelectTab}
        selectedIndex={this.state.selectedTab}
        role="presentation"
      >
        <TabList className={styles.tabList}>
          <Tab className={styles.tabSelector} aria-labelledby="appTab">
            <Icon iconName='application' className={styles.icon}/>
            <span id="appTab">{intl.formatMessage(intlMessages.appTabLabel)}</span>
          </Tab>
          <Tab className={styles.tabSelector} aria-labelledby="audioTab">
            <Icon iconName='unmute' className={styles.icon}/>
            <span id="audioTab">{intl.formatMessage(intlMessages.audioTabLabel)}</span>
          </Tab>
          <Tab className={styles.tabSelector} aria-labelledby="videoTab">
            <Icon iconName='video' className={styles.icon}/>
            <span id="videoTab">{intl.formatMessage(intlMessages.videoTabLabel)}</span>
          </Tab>
          <Tab className={styles.tabSelector} aria-labelledby="ccTab">
            <Icon iconName='user' className={styles.icon}/>
            <span id="ccTab">{intl.formatMessage(intlMessages.closecaptionTabLabel)}</span>
          </Tab>
          { isModerator ?
            <Tab className={styles.tabSelector} aria-labelledby="usersTab">
              <Icon iconName='user' className={styles.icon}/>
              <span id="usersTab">{intl.formatMessage(intlMessages.usersTabLabel)}</span>
            </Tab>
            : null }
        </TabList>
        <TabPanel className={styles.tabPanel}>
          <Application
            handleUpdateSettings={this.handleUpdateSettings}
            settings={this.state.current.application}
            />
        </TabPanel>
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
export default injectIntl(Settings);
