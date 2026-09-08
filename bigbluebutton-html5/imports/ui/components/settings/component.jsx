import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Langmap from 'langmap';
import About from '/imports/ui/components/settings/submenus/about/component';
import DataSaving from '/imports/ui/components/settings/submenus/data-saving/component';
import Application from '/imports/ui/components/settings/submenus/application/component';
import Audio from '/imports/ui/components/settings/submenus/audio/component';
import Notification from '/imports/ui/components/settings/submenus/notification/component';
import Shortcuts from '/imports/ui/components/settings/submenus/shortcuts/component';
import { clone } from 'radash';
import PropTypes from 'prop-types';
import Styled from './styles';
import { formatLocaleCode } from '/imports/utils/string-utils';
import { setUseCurrentLocale } from '../../core/local-states/useCurrentLocale';
import Transcription from '/imports/ui/components/settings/submenus/transcription/component';
import UnsavedChangesModal from '/imports/ui/components/common/modal/unsaved-changes/component';
import { SETTINGS_TABS, getSettingsTabs } from './enums';

const intlMessages = defineMessages({
  appTabLabel: {
    id: 'app.settings.applicationTab.label',
    description: 'label for application tab',
  },
  aboutTabLabel: {
    id: 'app.about.title',
    description: 'label for about tab',
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
  shortcutsLabel: {
    id: 'app.settings.shortcutsTab.label',
    description: 'label for shortcuts tab',
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
  transcriptionLabel: {
    id: 'app.settings.transcriptionTab.label',
    description: 'label for transcriptions tab',
  },
});

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  selectedTab: PropTypes.oneOf(Object.values(SETTINGS_TABS)),
  dataSaving: PropTypes.shape({
    viewParticipantsWebcams: PropTypes.bool,
    viewScreenshare: PropTypes.bool,
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
  audio: PropTypes.shape({
    processingMode: PropTypes.oneOf(['advanced', 'standard', 'original']),
  }).isRequired,
  updateSettings: PropTypes.func.isRequired,
  availableLocales: PropTypes.objectOf(PropTypes.array).isRequired,
  isReactionsEnabled: PropTypes.bool.isRequired,
  transcription: PropTypes.shape({
    partialUtterances: PropTypes.bool,
    minUtteraceLength: PropTypes.number,
  }).isRequired,
  isGladiaEnabled: PropTypes.bool.isRequired,
  fallbackLocales: PropTypes.objectOf(PropTypes.shape({
    englishName: PropTypes.string.isRequired,
    nativeName: PropTypes.string.isRequired,
  })).isRequired,
  isShowAudioFiltersEnabled: PropTypes.bool.isRequired,
};

class Settings extends Component {
  static setHtmlFontSize(size) {
    document.getElementsByTagName('html')[0].style.fontSize = size;
  }

  constructor(props) {
    super(props);

    const {
      dataSaving, application, audio, selectedTab, transcription,
    } = props;

    const tabs = this.getVisibleTabs();
    const resolvedTabIndex = tabs.indexOf(selectedTab);

    this.state = {
      current: {
        dataSaving: clone(dataSaving),
        application: clone(application),
        audio: clone(audio),
        transcription: clone(transcription),
      },
      saved: {
        dataSaving: clone(dataSaving),
        application: clone(application),
        audio: clone(audio),
      },
      selectedTab: resolvedTabIndex >= 0 ? resolvedTabIndex : 0,
      unsavedModalOpen: false,
      hasUnsavedChanges: false,
    };

    this.updateSettings = props.updateSettings;
    this.handleUpdateSettings = this.handleUpdateSettings.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
    this.displaySettingsStatus = this.displaySettingsStatus.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleIgnoreChanges = this.handleIgnoreChanges.bind(this);
    this.performClose = this.performClose.bind(this);
  }

  componentDidMount() {
    const { availableLocales, fallbackLocales } = this.props;

    availableLocales.then((locales) => {
      const tempAggregateLocales = locales
        .map((file) => file.name)
        .map((file) => file.replace('.json', ''))
        .map((file) => file.replace('_', '-'))
        .map((locale) => {
          const localeName = (Langmap[locale] || {}).nativeName
            || (fallbackLocales[locale] || {}).nativeName
            || locale;
          return {
            locale,
            name: localeName,
          };
        })
        .reverse()
        .filter((item, index, self) => index === self.findIndex((i) => (
          i.name === item.name
        )))
        .reverse();

      this.setState({ allLocales: tempAggregateLocales });
    });

    // needed because the initial value is null in the saved state
    const { saved } = this.state;
    saved.application.fontSize = document.getElementsByTagName('html')[0].style.fontSize;
    this.setState({ saved });
  }

  handleUpdateSettings(key, newSettings) {
    const { saved } = this.state;
    const hasUnsavedChanges = JSON.stringify(saved[key]) !== JSON.stringify(newSettings);

    this.setState((prevState) => ({
      current: {
        ...prevState.current,
        [key]: newSettings,
      },
      hasUnsavedChanges,
    }));
  }

  handleSelectTab(tab) {
    this.setState({
      selectedTab: tab,
    });
  }

  handleClose() {
    const { hasUnsavedChanges } = this.state;

    if (hasUnsavedChanges) {
      this.setState({ unsavedModalOpen: true });
      return;
    }
    this.performClose();
  }

  handleIgnoreChanges() {
    this.setState({ unsavedModalOpen: false }, () => {
      this.performClose();
    });
  }

  getVisibleTabs() {
    const {
      isShowAudioFiltersEnabled, isScreenSharingEnabled, isVideoEnabled, isGladiaEnabled,
    } = this.props;

    return getSettingsTabs({
      isShowAudioFiltersEnabled,
      isDataSavingTabEnabled: isScreenSharingEnabled || isVideoEnabled,
      isGladiaEnabled,
    });
  }

  performClose() {
    const { saved } = this.state;
    const { setIsOpen } = this.props;
    Settings.setHtmlFontSize(saved.application.fontSize);
    document.getElementsByTagName('html')[0].lang = saved.application.locale;
    setIsOpen(false);
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
      layoutContextDispatch,
      selectedLayout,
      isScreenSharingEnabled,
      isVideoEnabled,
      isReactionsEnabled,
      paginationToggleEnabled,
      isChatEnabled,
    } = this.props;

    const {
      selectedTab,
      current,
      allLocales,
    } = this.state;

    const tabs = this.getVisibleTabs();

    const tabConfig = {
      [SETTINGS_TABS.APPLICATION]: {
        ariaId: 'appTab',
        labelMsg: intlMessages.appTabLabel,
        panel: (
          <Application
            allLocales={allLocales}
            handleUpdateSettings={this.handleUpdateSettings}
            settings={current.application}
            displaySettingsStatus={this.displaySettingsStatus}
            layoutContextDispatch={layoutContextDispatch}
            selectedLayout={selectedLayout}
            isPresenter={isPresenter}
            isReactionsEnabled={isReactionsEnabled}
            paginationToggleEnabled={paginationToggleEnabled}
          />
        ),
      },
      [SETTINGS_TABS.AUDIO]: {
        ariaId: 'audioTab',
        labelMsg: intlMessages.audioTabLabel,
        panel: (
          <Audio
            handleUpdateSettings={this.handleUpdateSettings}
            settings={current.application}
            audioSettings={current.audio}
          />
        ),
      },
      [SETTINGS_TABS.NOTIFICATION]: {
        ariaId: 'notificationTab',
        labelMsg: intlMessages.notificationLabel,
        panel: (
          <Notification
            handleUpdateSettings={this.handleUpdateSettings}
            settings={current.application}
            showGuestNotification={showGuestNotification}
            displaySettingsStatus={this.displaySettingsStatus}
            isChatEnabled={isChatEnabled}
            {...{ isModerator }}
          />
        ),
      },
      [SETTINGS_TABS.DATA_SAVING]: {
        ariaId: 'dataSavingTab',
        spanId: 'dataSaving',
        labelMsg: intlMessages.dataSavingLabel,
        panel: (
          <DataSaving
            settings={current.dataSaving}
            handleUpdateSettings={this.handleUpdateSettings}
            displaySettingsStatus={this.displaySettingsStatus}
            isScreenSharingEnabled={isScreenSharingEnabled}
            isVideoEnabled={isVideoEnabled}
          />
        ),
      },
      [SETTINGS_TABS.TRANSCRIPTION]: {
        ariaId: 'transcriptionTab',
        labelMsg: intlMessages.transcriptionLabel,
        panel: (
          <Transcription
            handleUpdateSettings={this.handleUpdateSettings}
            settings={current.transcription}
            displaySettingsStatus={this.displaySettingsStatus}
          />
        ),
      },
      [SETTINGS_TABS.SHORTCUTS]: {
        ariaId: 'shortcutsTab',
        labelMsg: intlMessages.shortcutsLabel,
        dataTest: 'shortcutsTabButton',
        noPadding: true,
        panel: <Shortcuts />,
      },
      [SETTINGS_TABS.ABOUT]: {
        ariaId: 'aboutTab',
        labelMsg: intlMessages.aboutTabLabel,
        dataTest: 'aboutTabButton',
        panel: <About settings={current.application} />,
      },
    };

    return (
      <Styled.SettingsTabs
        onSelect={this.handleSelectTab}
        selectedIndex={selectedTab}
      >
        <Styled.SettingsTabList>
          {tabs.map((tabId) => {
            const {
              ariaId, spanId, labelMsg, dataTest,
            } = tabConfig[tabId];
            return (
              <Styled.SettingsTabSelector
                key={tabId}
                aria-labelledby={ariaId}
                selectedClassName="is-selected"
                data-test={dataTest}
              >
                <span id={spanId || ariaId}>{intl.formatMessage(labelMsg)}</span>
              </Styled.SettingsTabSelector>
            );
          })}
        </Styled.SettingsTabList>
        {tabs.map((tabId) => {
          const { panel, noPadding } = tabConfig[tabId];
          return (
            <Styled.SettingsTabPanel key={tabId} selectedClassName="is-selected" $noPadding={noPadding}>
              {panel}
            </Styled.SettingsTabPanel>
          );
        })}
      </Styled.SettingsTabs>
    );
  }

  render() {
    const {
      intl,
      setIsOpen,
      isOpen,
      setLocalSettings,
      modalHeight,
      modalWidth,
    } = this.props;
    const { current, saved, unsavedModalOpen } = this.state;

    if (unsavedModalOpen) {
      return (
        <UnsavedChangesModal
          isOpen={unsavedModalOpen}
          onCancel={() => this.setState({ unsavedModalOpen: false })}
          onConfirm={this.handleIgnoreChanges}
        />
      );
    }

    return (
      <Styled.Modal
        title={intl.formatMessage(intlMessages.SettingsLabel)}
        width={modalWidth}
        height={modalHeight}
        modalIsOpen={isOpen}
        documentTitle={intl.formatMessage(intlMessages.SettingsLabel)}
        confirm={{
          callback: () => {
            this.updateSettings(current, intlMessages.savedAlertLabel, setLocalSettings);

            if (saved.application.locale !== current.application.locale) {
              const { language } = formatLocaleCode(saved.application.locale);
              const newLanguage = current.application.locale;
              setUseCurrentLocale(newLanguage);
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
          callback: this.handleClose,
        }}
        onRequestClose={this.handleClose}
      >
        {this.renderModalContent()}
        <Styled.ActionsContainer>
          <Styled.ActionButton onClick={this.performClose}>
            {intl.formatMessage(intlMessages.CancelLabel)}
          </Styled.ActionButton>
          <Styled.ActionButton
            data-test="saveSettingsButton"
            onClick={() => {
              this.updateSettings(current, intlMessages.savedAlertLabel, setLocalSettings);
              if (saved.application.locale !== current.application.locale) {
                const { language } = formatLocaleCode(saved.application.locale);
                const newLanguage = current.application.locale;
                setUseCurrentLocale(newLanguage);
                document.body.classList.remove(`lang-${language}`);
              }
              setIsOpen(false);
            }}
          >
            {intl.formatMessage(intlMessages.SaveLabel)}
          </Styled.ActionButton>
        </Styled.ActionsContainer>
      </Styled.Modal>
    );
  }
}

Settings.propTypes = propTypes;
export default injectIntl(Settings);
