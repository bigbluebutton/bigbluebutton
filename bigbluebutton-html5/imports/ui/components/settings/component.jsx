import React, { Component } from 'react';
import ModalFullscreen from '/imports/ui/components/common/modal/fullscreen/component';
import { defineMessages, injectIntl } from 'react-intl';
import DataSaving from '/imports/ui/components/settings/submenus/data-saving/component';
import Application from '/imports/ui/components/settings/submenus/application/component';
import Notification from '/imports/ui/components/settings/submenus/notification/component';
import Transcription from '/imports/ui/components/settings/submenus/transcription/component';
import { clone } from 'radash';
import PropTypes from 'prop-types';
import Styled from './styles';
import { formatLocaleCode } from '/imports/utils/string-utils';

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
  notificationLabel: {
    id: 'app.submenu.notification.SectionTitle', // set menu label identical to section title
    description: 'label for notification tab',
  },
  dataSavingLabel: {
    id: 'app.settings.dataSavingTab.label',
    description: 'label for data savings tab',
  },
  transcriptionLabel: {
    id: 'app.settings.transcriptionTab.label',
    description: 'label for transcriptions tab',
  },
  savedAlertLabel: {
    id: 'app.settings.save-notification.label',
    description: 'label shown in toast when settings are saved',
  },
  on: {
    id: 'app.switch.onLabel',
    description: 'label for toggle switch on state',
  },
  off: {
    id: 'app.switch.offLabel',
    description: 'label for toggle switch off state',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  dataSaving: PropTypes.shape({
    viewParticipantsWebcams: PropTypes.bool,
    viewScreenshare: PropTypes.bool,
  }).isRequired,
  transcription: PropTypes.shape({
    partialUtterances: PropTypes.bool,
    minUtteraceLength: PropTypes.number,
  }).isRequired,
  application: PropTypes.shape({
    chatAudioAlerts: PropTypes.bool,
    chatPushAlerts: PropTypes.bool,
    userJoinAudioAlerts: PropTypes.bool,
    userLeaveAudioAlerts: PropTypes.bool,
    userLeavePushAlerts: PropTypes.bool,
    guestWaitingAudioAlerts: PropTypes.bool,
    guestWaitingPushAlerts: PropTypes.bool,
    paginationEnabled: PropTypes.bool,
    darkTheme: PropTypes.bool,
    fallbackLocale: PropTypes.string,
    fontSize: PropTypes.string,
    locale: PropTypes.string,
    microphoneConstraints: PropTypes.objectOf(Object),
  }).isRequired,
  updateSettings: PropTypes.func.isRequired,
  availableLocales: PropTypes.objectOf(PropTypes.array).isRequired,
  showToggleLabel: PropTypes.bool.isRequired,
  isReactionsEnabled: PropTypes.bool.isRequired,
  isGladiaEnabled: PropTypes.bool.isRequired,
};

class Settings extends Component {
  static setHtmlFontSize(size) {
    document.getElementsByTagName('html')[0].style.fontSize = size;
  }

  constructor(props) {
    super(props);

    const {
      dataSaving, application, transcription, selectedTab,
    } = props;

    this.state = {
      current: {
        dataSaving: clone(dataSaving),
        application: clone(application),
        transcription: clone(transcription),
      },
      saved: {
        dataSaving: clone(dataSaving),
        application: clone(application),
        transcription: clone(transcription),
      },
      selectedTab: Number.isFinite(selectedTab) && selectedTab >= 0 && selectedTab <= 2
        ? selectedTab
        : 0,
    };

    this.updateSettings = props.updateSettings;
    this.handleUpdateSettings = this.handleUpdateSettings.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
    this.displaySettingsStatus = this.displaySettingsStatus.bind(this);
  }

  componentDidMount() {
    const { availableLocales } = this.props;

    availableLocales.then((locales) => {
      this.setState({ allLocales: locales });
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

  displaySettingsStatus(status, textOnly = false) {
    const { intl } = this.props;
    if (textOnly) {
      return status ? intl.formatMessage(intlMessages.on)
        : intl.formatMessage(intlMessages.off);
    }
    return (
      <Styled.ToggleLabel aria-hidden>
        {status ? intl.formatMessage(intlMessages.on)
          : intl.formatMessage(intlMessages.off)}
      </Styled.ToggleLabel>
    );
  }

  renderModalContent() {
    const {
      intl,
      isModerator,
      isPresenter,
      showGuestNotification,
      showToggleLabel,
      layoutContextDispatch,
      selectedLayout,
      isScreenSharingEnabled,
      isVideoEnabled,
      isReactionsEnabled,
      isGladiaEnabled,
    } = this.props;

    const {
      selectedTab,
      current,
      allLocales,
    } = this.state;

    const isDataSavingTabEnabled = isScreenSharingEnabled || isVideoEnabled;

    return (
      <Styled.SettingsTabs
        onSelect={this.handleSelectTab}
        selectedIndex={selectedTab}
        role="presentation"
      >
        <Styled.SettingsTabList>
          <Styled.SettingsTabSelector
            aria-labelledby="appTab"
            selectedClassName="is-selected"
          >
            <Styled.SettingsIcon iconName="application" />
            <span id="appTab">{intl.formatMessage(intlMessages.appTabLabel)}</span>
          </Styled.SettingsTabSelector>
          <Styled.SettingsTabSelector
            selectedClassName="is-selected"
          >
            <Styled.SettingsIcon iconName="alert" />
            <span id="notificationTab">{intl.formatMessage(intlMessages.notificationLabel)}</span>
          </Styled.SettingsTabSelector>
          {isDataSavingTabEnabled
            ? (
              <Styled.SettingsTabSelector
                aria-labelledby="dataSavingTab"
                selectedClassName="is-selected"
              >
                <Styled.SettingsIcon iconName="network" />
                <span id="dataSaving">{intl.formatMessage(intlMessages.dataSavingLabel)}</span>
              </Styled.SettingsTabSelector>
            )
            : null}
          {isGladiaEnabled
            ? (
              <Styled.SettingsTabSelector
                aria-labelledby="transcriptionTab"
                selectedClassName="is-selected"
              >
                <Styled.SettingsIcon iconName="closed_caption" />
                <span id="transcriptionTab">{intl.formatMessage(intlMessages.transcriptionLabel)}</span>
              </Styled.SettingsTabSelector>
              )
              : null}
        </Styled.SettingsTabList>
        <Styled.SettingsTabPanel selectedClassName="is-selected">
          <Application
            allLocales={allLocales}
            handleUpdateSettings={this.handleUpdateSettings}
            settings={current.application}
            showToggleLabel={showToggleLabel}
            displaySettingsStatus={this.displaySettingsStatus}
            layoutContextDispatch={layoutContextDispatch}
            selectedLayout={selectedLayout}
            isPresenter={isPresenter}
            isReactionsEnabled={isReactionsEnabled}
          />
        </Styled.SettingsTabPanel>
        <Styled.SettingsTabPanel selectedClassName="is-selected">
          <Notification
            handleUpdateSettings={this.handleUpdateSettings}
            settings={current.application}
            showGuestNotification={showGuestNotification}
            showToggleLabel={showToggleLabel}
            displaySettingsStatus={this.displaySettingsStatus}
            {...{ isModerator }}
          />
        </Styled.SettingsTabPanel>
        {isDataSavingTabEnabled
          ? (
            <Styled.SettingsTabPanel selectedClassName="is-selected">
              <DataSaving
                settings={current.dataSaving}
                handleUpdateSettings={this.handleUpdateSettings}
                showToggleLabel={showToggleLabel}
                displaySettingsStatus={this.displaySettingsStatus}
                isScreenSharingEnabled={isScreenSharingEnabled}
                isVideoEnabled={isVideoEnabled}
              />
            </Styled.SettingsTabPanel>
          )
          : null}
        {isGladiaEnabled
          ? (
            <Styled.SettingsTabPanel selectedClassName="is-selected">
              <Transcription
                handleUpdateSettings={this.handleUpdateSettings}
                settings={current.transcription}
                displaySettingsStatus={this.displaySettingsStatus}
              />
            </Styled.SettingsTabPanel>
            )
            : null}
      </Styled.SettingsTabs>
    );
  }

  render() {
    const {
      intl,
      setIsOpen,
      isOpen,
      priority,
    } = this.props;
    const {
      current,
      saved,
    } = this.state;
    return (
      <ModalFullscreen
        title={intl.formatMessage(intlMessages.SettingsLabel)}
        confirm={{
          callback: () => {
            this.updateSettings(current, intlMessages.savedAlertLabel);

            if (saved.application.locale !== current.application.locale) {
              const { language } = formatLocaleCode(saved.application.locale);
              document.body.classList.remove(`lang-${language}`);
            }

            /* We need to use setIsOpen(false) here to prevent submenu state updates,
            *  from re-opening the modal.
            */
            setIsOpen(false);
          },
          label: intl.formatMessage(intlMessages.SaveLabel),
          description: intl.formatMessage(intlMessages.SaveLabelDesc),
        }}
        dismiss={{
          callback: () => {
            Settings.setHtmlFontSize(saved.application.fontSize);
            document.getElementsByTagName('html')[0].lang = saved.application.locale;
            setIsOpen(false);
          },
          label: intl.formatMessage(intlMessages.CancelLabel),
          description: intl.formatMessage(intlMessages.CancelLabelDesc),
        }}
        {...{
          isOpen,
          priority,
        }}
      >
        {this.renderModalContent()}
      </ModalFullscreen>
    );
  }
}

Settings.propTypes = propTypes;
export default injectIntl(Settings);
