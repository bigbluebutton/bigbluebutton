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
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Styled from './styles';
import { formatLocaleCode } from '/imports/utils/string-utils';
import { setUseCurrentLocale } from '../../core/local-states/useCurrentLocale';
import Transcription from '/imports/ui/components/settings/submenus/transcription/component';
import RoomModeTab, { isRoomModeChangePending } from '/imports/ui/components/settings/submenus/room-mode/component';
import UnsavedChangesModal from '/imports/ui/components/common/modal/unsaved-changes/component';
import { SETTINGS_TABS, getSettingsTabs } from './enums';
import { applyAudioDeviceSelection, getAudioDeviceSelection } from './service';
import { notify } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';

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
  roomModeTabLabel: {
    id: 'app.settings.roomModeTab.label',
    description: 'Label of the room modes tab in the settings window',
  },
  changeRoomModeLabel: {
    id: 'app.settings.roomMode.changeLabel',
    description: 'Footer button of the room modes tab: applies the picked room mode',
  },
  unsavedPickMessage: {
    id: 'app.settings.roomMode.unsavedPick.message',
    description: 'Dialog on Save while a room mode pick is pending: the mode was not changed',
  },
  unsavedPickIgnoreMessage: {
    id: 'app.settings.roomMode.unsavedPick.ignoreMessage',
    description: 'Dialog on Save while a room mode pick is pending: what ignoring it does',
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
  deviceChangeFailed: {
    id: 'app.audioNotification.deviceChangeFailed',
    description: 'Device change failed',
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
  availableLocales: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({}))).isRequired,
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
  isAudioDeviceTestEnabled: PropTypes.bool.isRequired,
  isRoomModeTabEnabled: PropTypes.bool,
  roomMode: PropTypes.string,
  // A pick handed over to the Room modes tab, pre-selected.
  initialRoomModeChange: PropTypes.shape({
    pick: PropTypes.string,
    edits: PropTypes.shape({}),
  }),
};

const defaultProps = {
  isRoomModeTabEnabled: false,
  roomMode: '',
  initialRoomModeChange: null,
};

class Settings extends Component {
  static setHtmlFontSize(size) {
    document.getElementsByTagName('html')[0].style.fontSize = size;
  }

  static markUnsaved(unsavedKeys, key, changed) {
    const otherKeys = unsavedKeys.filter((k) => k !== key);
    return changed ? [...otherKeys, key] : otherKeys;
  }

  constructor(props) {
    super(props);

    const {
      dataSaving, application, audio, selectedTab, transcription,
      initialRoomModeChange, roomMode,
    } = props;

    const tabs = this.getVisibleTabs();
    const resolvedTabIndex = tabs.indexOf(selectedTab);
    // Not part of the settings: the devices live in the audio manager.
    const audioDeviceSelection = getAudioDeviceSelection();
    // Restored on close. Kept out of the saved settings: the application tab only
    // reports a font size the user picks, so an untouched one would read as changed.
    this.openingFontSize = document.getElementsByTagName('html')[0].style.fontSize;

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
      audioDeviceSelection,
      savedAudioDeviceSelection: audioDeviceSelection,
      selectedTab: resolvedTabIndex >= 0 ? resolvedTabIndex : 0,
      unsavedModalOpen: false,
      // Keys edited away from their saved value: one edit must not clear another's.
      unsavedKeys: initialRoomModeChange && isRoomModeChangePending(initialRoomModeChange, roomMode)
        ? ['roomMode'] : [],
      // Not a setting: applied to the room from the room modes tab, not saved.
      roomModeChange: initialRoomModeChange ?? { pick: null, edits: {} },
      roomModeReady: false,
      // A mode's settings are open in the tab: their edits are not kept yet.
      roomModeEditing: false,
      roomModeApplying: false,
      // What confirming the unsaved-changes dialog goes on to do.
      unsavedConfirm: null,
    };
    // The room modes tab hands over how to apply its pick.
    this.roomModeApply = null;
    // A tab asked for on open may be gated on data still loading (the room
    // modes tab waits for the current user): selected once it shows up.
    this.pendingTab = resolvedTabIndex >= 0 ? null : selectedTab;

    this.updateSettings = props.updateSettings;
    this.handleUpdateSettings = this.handleUpdateSettings.bind(this);
    this.handleAudioDeviceSelectionChange = this.handleAudioDeviceSelectionChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);
    this.displaySettingsStatus = this.displaySettingsStatus.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleIgnoreChanges = this.handleIgnoreChanges.bind(this);
    this.performClose = this.performClose.bind(this);
    this.handleRoomModeChange = this.handleRoomModeChange.bind(this);
    this.handleRoomModeReady = this.handleRoomModeReady.bind(this);
    this.handleRoomModeEditing = this.handleRoomModeEditing.bind(this);
    this.registerRoomModeApply = this.registerRoomModeApply.bind(this);
    this.handleChangeRoomMode = this.handleChangeRoomMode.bind(this);
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
  }

  componentDidUpdate() {
    if (this.pendingTab == null) return;
    const index = this.getVisibleTabs().indexOf(this.pendingTab);
    if (index < 0) return;
    this.pendingTab = null;
    this.setState({ selectedTab: index });
  }

  handleUpdateSettings(key, newSettings) {
    const { saved } = this.state;
    const changed = JSON.stringify(saved[key]) !== JSON.stringify(newSettings);

    this.setState((prevState) => ({
      current: {
        ...prevState.current,
        [key]: newSettings,
      },
      unsavedKeys: Settings.markUnsaved(prevState.unsavedKeys, key, changed),
    }));
  }

  handleAudioDeviceSelectionChange(audioDeviceSelection) {
    const { savedAudioDeviceSelection } = this.state;
    const changed = audioDeviceSelection.inputDeviceId !== savedAudioDeviceSelection.inputDeviceId
      || audioDeviceSelection.outputDeviceId !== savedAudioDeviceSelection.outputDeviceId;

    this.setState((prevState) => ({
      audioDeviceSelection,
      unsavedKeys: Settings.markUnsaved(prevState.unsavedKeys, 'audioDevices', changed),
    }));
  }

  handleSave() {
    const { unsavedKeys } = this.state;

    // Save applies the settings, not the room mode tab's pick: say it goes.
    if (unsavedKeys.includes('roomMode')) {
      this.setState({ unsavedModalOpen: true, unsavedConfirm: 'save' });
      return;
    }
    this.performSave();
  }

  handleRoomModeChange(roomModeChange) {
    const { roomMode } = this.props;
    const pending = isRoomModeChangePending(roomModeChange, roomMode);

    this.setState((prevState) => ({
      roomModeChange,
      unsavedKeys: Settings.markUnsaved(prevState.unsavedKeys, 'roomMode', pending),
    }));
  }

  handleRoomModeReady(roomModeReady) {
    this.setState({ roomModeReady });
  }

  handleRoomModeEditing(roomModeEditing) {
    this.setState({ roomModeEditing });
  }

  async handleChangeRoomMode() {
    if (!this.roomModeApply) return;

    this.setState({ roomModeApplying: true });
    try {
      await this.roomModeApply();
    } catch {
      // The tab told the moderator; the window stays open to try again.
      this.setState({ roomModeApplying: false });
      return;
    }
    // Settings changed in other tabs go with the change, as Save would take
    // them; without any, the window closes as Cancel does, dropping previews.
    const { unsavedKeys } = this.state;
    if (unsavedKeys.some((key) => key !== 'roomMode')) {
      this.performSave();
      return;
    }
    this.performClose();
  }

  handleSelectTab(tab) {
    const { roomModeApplying } = this.state;

    // The window stays on the room modes tab until its change lands or fails.
    if (roomModeApplying) return;
    this.pendingTab = null;
    this.setState({
      selectedTab: tab,
    });
  }

  handleClose() {
    const { unsavedKeys, roomModeApplying } = this.state;

    // The room mode is being changed: the window stays until it lands or fails.
    if (roomModeApplying) return;
    if (unsavedKeys.length > 0) {
      this.setState({ unsavedModalOpen: true, unsavedConfirm: 'close' });
      return;
    }
    this.performClose();
  }

  handleIgnoreChanges() {
    const { unsavedConfirm } = this.state;

    // From Save, only the room mode pick is ignored: the settings are saved.
    this.setState({ unsavedModalOpen: false, unsavedConfirm: null }, () => {
      if (unsavedConfirm === 'save') {
        this.performSave();
        return;
      }
      this.performClose();
    });
  }

  getVisibleTabs() {
    const {
      isShowAudioFiltersEnabled, isAudioDeviceTestEnabled, isScreenSharingEnabled, isVideoEnabled,
      isGladiaEnabled, isRoomModeTabEnabled,
    } = this.props;

    return getSettingsTabs({
      isShowAudioFiltersEnabled,
      isAudioDeviceTestEnabled,
      isDataSavingTabEnabled: isScreenSharingEnabled || isVideoEnabled,
      isGladiaEnabled,
      isRoomModeTabEnabled,
    });
  }

  performClose() {
    const { saved } = this.state;
    const { setIsOpen } = this.props;
    Settings.setHtmlFontSize(this.openingFontSize);
    document.getElementsByTagName('html')[0].lang = saved.application.locale;
    setIsOpen(false);
  }

  performSave() {
    const { setIsOpen } = this.props;

    this.saveSettings();
    /* We need to use setIsOpen(false) here to prevent submenu state updates,
    *  from re-opening the modal.
    */
    setIsOpen(false);
  }

  saveSettings() {
    const { intl, setLocalSettings } = this.props;
    const {
      current, saved, audioDeviceSelection, savedAudioDeviceSelection,
    } = this.state;

    this.updateSettings(current, intlMessages.savedAlertLabel, setLocalSettings);
    applyAudioDeviceSelection(savedAudioDeviceSelection, audioDeviceSelection, () => {
      notify(intl.formatMessage(intlMessages.deviceChangeFailed), true);
    });

    if (saved.application.locale !== current.application.locale) {
      const { language } = formatLocaleCode(saved.application.locale);
      const newLanguage = current.application.locale;
      setUseCurrentLocale(newLanguage);
      document.body.classList.remove(`lang-${language}`);
    }
  }

  registerRoomModeApply(apply) {
    this.roomModeApply = apply;
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
      isShowAudioFiltersEnabled,
      roomMode,
    } = this.props;

    const {
      selectedTab,
      current,
      saved,
      allLocales,
      audioDeviceSelection,
      roomModeChange,
      roomModeApplying,
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
            savedFontSize={saved.application.fontSize}
            openingFontSize={this.openingFontSize}
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
            showProcessing={isShowAudioFiltersEnabled}
            deviceSelection={audioDeviceSelection}
            onDeviceSelectionChange={this.handleAudioDeviceSelectionChange}
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
      [SETTINGS_TABS.ROOM_MODE]: {
        ariaId: 'roomModeTab',
        labelMsg: intlMessages.roomModeTabLabel,
        dataTest: 'roomModeTabButton',
        panel: (
          <RoomModeTab
            currentMode={roomMode}
            change={roomModeChange}
            onChange={this.handleRoomModeChange}
            registerApply={this.registerRoomModeApply}
            onReadyChange={this.handleRoomModeReady}
            onEditingChange={this.handleRoomModeEditing}
            applying={roomModeApplying}
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
      isOpen,
      modalHeight,
      modalWidth,
    } = this.props;
    const {
      unsavedModalOpen, unsavedConfirm, selectedTab,
      roomModeChange, roomModeReady, roomModeApplying, roomModeEditing,
    } = this.state;
    const { roomMode } = this.props;
    // The room modes tab applies its pick to the room instead of saving settings.
    const onRoomModeTab = this.getVisibleTabs()[selectedTab] === SETTINGS_TABS.ROOM_MODE;

    if (unsavedModalOpen) {
      return (
        <UnsavedChangesModal
          isOpen={unsavedModalOpen}
          onCancel={() => this.setState({ unsavedModalOpen: false, unsavedConfirm: null })}
          // From Save, only the room mode pick is dropped: the dialog says so.
          message={unsavedConfirm === 'save' ? intlMessages.unsavedPickMessage : undefined}
          ignoreMessage={unsavedConfirm === 'save' ? intlMessages.unsavedPickIgnoreMessage : undefined}
          onConfirm={this.handleIgnoreChanges}
        />
      );
    }

    return (
      <ModalSimple
        title={intl.formatMessage(intlMessages.SettingsLabel)}
        modalIsOpen={isOpen}
        documentTitle={intl.formatMessage(intlMessages.SettingsLabel)}
        onRequestClose={this.handleClose}
        contentStyle={{ width: `min(${modalWidth}, 90vw)`, height: modalHeight }}
        showDividers
        allowScroll={false}
        footerContent={(
          <>
            <BBButton
              variant="secondary"
              label={intl.formatMessage(intlMessages.CancelLabel)}
              disabled={roomModeApplying}
              onClick={this.performClose}
            />
            {onRoomModeTab ? (
              <BBButton
                variant="primary"
                dataTest="settingsRoomModeChangeButton"
                label={intl.formatMessage(intlMessages.changeRoomModeLabel)}
                disabled={!roomModeReady || roomModeApplying || roomModeEditing
                  || !isRoomModeChangePending(roomModeChange, roomMode)}
                onClick={this.handleChangeRoomMode}
              />
            ) : (
              <BBButton
                variant="primary"
                dataTest="saveSettingsButton"
                label={intl.formatMessage(intlMessages.SaveLabel)}
                onClick={this.handleSave}
              />
            )}
          </>
        )}
      >
        {this.renderModalContent()}
      </ModalSimple>
    );
  }
}

Settings.propTypes = propTypes;
Settings.defaultProps = defaultProps;
export default injectIntl(Settings);
