import React, { Component } from 'react';
import Modal from '/imports/ui/components/modal/fullscreen/component';
import {
  Tab, Tabs, TabList, TabPanel,
} from 'react-tabs';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import DataSaving from '/imports/ui/components/settings/submenus/data-saving/component';
import Application from '/imports/ui/components/settings/submenus/application/component';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { withModalMounter } from '../modal/service';
import Icon from '../icon/component';
import { styles } from './styles';

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
  usersTabLabel: {
    id: 'app.settings.usersTab.label',
    description: 'label for participants tab',
  },
  SettingsLabel: {
    id: 'app.settings.main.label',
    description: 'General settings label',
  },
  CancelLabel: {
    id: 'app.settings.main.cancel.label',
    description: 'Discard the changes and close the settings menu',
  },
  CancelLabelDesc: {
    id: 'app.settings.main.cancel.label.description',
    description: 'Settings modal cancel button description',
  },
  SaveLabel: {
    id: 'app.settings.main.save.label',
    description: 'Save the changes and close the settings menu',
  },
  SaveLabelDesc: {
    id: 'app.settings.main.save.label.description',
    description: 'Settings modal save button label',
  },
  dataSavingLabel: {
    id: 'app.settings.dataSavingTab.label',
    description: 'label for data savings tab',
  },
  savedAlertLabel: {
    id: 'app.settings.save-notification.label',
    description: 'label shown in toast when settings are saved',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  dataSaving: PropTypes.shape({
    viewParticipantsWebcams: PropTypes.bool,
    viewScreenshare: PropTypes.bool,
  }).isRequired,
  application: PropTypes.shape({
    chatAudioAlerts: PropTypes.bool,
    chatPushAlerts: PropTypes.bool,
    userJoinAudioAlerts: PropTypes.bool,
    fallbackLocale: PropTypes.string,
    fontSize: PropTypes.string,
    locale: PropTypes.string,
  }).isRequired,
  updateSettings: PropTypes.func.isRequired,
  availableLocales: PropTypes.objectOf(PropTypes.array).isRequired,
  mountModal: PropTypes.func.isRequired,
};

class Settings extends Component {
  static setHtmlFontSize(size) {
    document.getElementsByTagName('html')[0].style.fontSize = size;
  }

  constructor(props) {
    super(props);

    const {
      dataSaving, application,
    } = props;

    this.state = {
      current: {
        dataSaving: _.clone(dataSaving),
        application: _.clone(application),
      },
      saved: {
        dataSaving: _.clone(dataSaving),
        application: _.clone(application),
      },
      selectedTab: 0,
    };

    this.updateSettings = props.updateSettings;
    this.handleUpdateSettings = this.handleUpdateSettings.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
  }

  componentWillMount() {
    const { availableLocales } = this.props;
    availableLocales.then((locales) => {
      this.setState({ availableLocales: locales });
    });
  }

  handleUpdateSettings(key, newSettings) {
    const settings = this.state;
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
      intl,
    } = this.props;

    const {
      selectedTab,
      availableLocales,
      current,
    } = this.state;

    return (
      <Tabs
        className={styles.tabs}
        onSelect={this.handleSelectTab}
        selectedIndex={selectedTab}
        role="presentation"
        selectedTabPanelClassName={styles.selectedTab}
      >
        <TabList className={styles.tabList}>
          <Tab
            className={styles.tabSelector}
            aria-labelledby="appTab"
            selectedClassName={styles.selected}
          >
            <Icon iconName="application" className={styles.icon} />
            <span id="appTab">{intl.formatMessage(intlMessages.appTabLabel)}</span>
          </Tab>
          {/* <Tab className={styles.tabSelector} aria-labelledby="videoTab"> */}
          {/* <Icon iconName='video' className={styles.icon}/> */}
          {/* <span id="videoTab">{intl.formatMessage(intlMessages.videoTabLabel)}</span> */}
          {/* </Tab> */}
          <Tab
            className={styles.tabSelector}
            aria-labelledby="dataSavingTab"
            selectedClassName={styles.selected}
          >
            <Icon iconName="network" className={styles.icon} />
            <span id="dataSaving">{intl.formatMessage(intlMessages.dataSavingLabel)}</span>
          </Tab>
          {/* { isModerator ? */}
          {/* <Tab className={styles.tabSelector} aria-labelledby="usersTab"> */}
          {/* <Icon iconName="user" className={styles.icon} /> */}
          {/* <span id="usersTab">{intl.formatMessage(intlMessages.usersTabLabel)}</span> */}
          {/* </Tab> */}
          {/* : null } */}
        </TabList>
        <TabPanel className={styles.tabPanel}>
          <Application
            availableLocales={availableLocales}
            handleUpdateSettings={this.handleUpdateSettings}
            settings={current.application}
          />
        </TabPanel>
        {/* <TabPanel className={styles.tabPanel}> */}
        {/* <Video */}
        {/* handleUpdateSettings={this.handleUpdateSettings} */}
        {/* settings={this.state.current.video} */}
        {/* /> */}
        {/* </TabPanel> */}
        <TabPanel className={styles.tabPanel}>
          <DataSaving
            settings={current.dataSaving}
            handleUpdateSettings={this.handleUpdateSettings}
          />
        </TabPanel>
      </Tabs>
    );
  }

  render() {
    const {
      intl,
      mountModal,
    } = this.props;
    const {
      current,
      saved,
    } = this.state;
    return (
      <Modal
        title={intl.formatMessage(intlMessages.SettingsLabel)}
        confirm={{
          callback: () => {
            this.updateSettings(current, intl.formatMessage(intlMessages.savedAlertLabel));
            /* We need to use mountModal(null) here to prevent submenu state updates,
            *  from re-opening the modal.
            */
            mountModal(null);
          },
          label: intl.formatMessage(intlMessages.SaveLabel),
          description: intl.formatMessage(intlMessages.SaveLabelDesc),
        }}
        dismiss={{
          callback: () => {
            Settings.setHtmlFontSize(saved.application.fontSize);
            mountModal(null);
          },
          label: intl.formatMessage(intlMessages.CancelLabel),
          description: intl.formatMessage(intlMessages.CancelLabelDesc),
        }}
      >
        {this.renderModalContent()}
      </Modal>
    );
  }
}

Settings.propTypes = propTypes;
export default withModalMounter(injectIntl(Settings));
