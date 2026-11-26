import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import Styled from './styles';
import {
  AudioFilterMode, AudioFilterOption, AudioMenuProps, AudioMenuSection, AudioMenuState,
} from './types';
import DeviceTest from './device-test/component';
import {
  isWasmProcessorSupported, isWasmProcessingConfigEnabled,
  getEffectiveAudioProcessingMode, isVoiceIsolationSupported,
} from '/imports/api/audio/client/bridge/service';
import Tooltip from '/imports/ui/components/common/tooltip/container';

const AUDIO_SECTION_TITLE_ID = 'audioProcessingSectionTitle';

const SECTIONS: AudioMenuSection[] = ['processing', 'deviceTest'];
const ARROW_STEPS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

const intlMessages = defineMessages({
  audioTabTitle: {
    id: 'app.submenu.audio.audioSectionTitle',
    description: 'Audio tab title',
  },
  audioTabSubtitle: {
    id: 'app.submenu.audio.audioSectionSubtitle',
    description: 'Audio tab subtitle',
  },
  advancedFilteringLabel: {
    id: 'app.submenu.audio.advancedFiltering',
    description: 'advanced audio filtering option label',
  },
  advancedFilteringSummary: {
    id: 'app.submenu.audio.advancedFilteringSummary',
    description: 'advanced audio filtering option description',
  },
  advancedFilteringIdealFor: {
    id: 'app.submenu.audio.advancedFilteringIdealFor',
    description: 'advanced audio filtering ideal use cases',
  },
  standardFilteringLabel: {
    id: 'app.submenu.audio.standardFiltering',
    description: 'standard audio filtering option label',
  },
  standardFilteringSummary: {
    id: 'app.submenu.audio.standardFilteringSummary',
    description: 'standard audio filtering option description',
  },
  standardFilteringIdealFor: {
    id: 'app.submenu.audio.standardFilteringIdealFor',
    description: 'standard audio filtering ideal use cases',
  },
  originalAudioLabel: {
    id: 'app.submenu.audio.originalAudio',
    description: 'original/unprocessed audio option label',
  },
  originalAudioSummary: {
    id: 'app.submenu.audio.originalAudioSummary',
    description: 'original/unprocessed audio option description',
  },
  originalAudioIdealFor: {
    id: 'app.submenu.audio.originalAudioIdealFor',
    description: 'original/unprocessed audio ideal use cases',
  },
  advancedFilteringDisabledReason: {
    id: 'app.submenu.audio.advancedFilteringDisabledReason',
    description: 'reason shown when advanced filtering is unavailable',
  },
  processingSectionLabel: {
    id: 'app.submenu.audio.processingSectionLabel',
    description: 'Label of the audio processing section switch',
  },
  deviceTestSectionLabel: {
    id: 'app.submenu.audio.deviceTestSectionLabel',
    description: 'Label of the device test section switch',
  },
  sectionsLabel: {
    id: 'app.submenu.audio.sectionsLabel',
    description: 'Accessible name of the audio tab section switch',
  },
  voiceIsolationLabel: {
    id: 'app.submenu.audio.voiceIsolation',
    description: 'voice isolation option label',
  },
  voiceIsolationSummary: {
    id: 'app.submenu.audio.voiceIsolationSummary',
    description: 'voice isolation option description',
  },
  voiceIsolationIdealFor: {
    id: 'app.submenu.audio.voiceIsolationIdealFor',
    description: 'voice isolation ideal use cases',
  },
  idealForLabel: {
    id: 'app.submenu.audio.idealForLabel',
    description: 'label for ideal audio option use cases',
  },
  experimentalBadge: {
    id: 'app.submenu.audio.experimentalBadge',
    description: 'badge shown on experimental audio options',
  },
});

const SECTION_LABELS = {
  processing: intlMessages.processingSectionLabel,
  deviceTest: intlMessages.deviceTestSectionLabel,
};

class AudioMenu extends BaseMenu {
  props!: AudioMenuProps;

  state: AudioMenuState;

  constructor(props: AudioMenuProps) {
    super(props);

    this.state = {
      settings: props.settings,
      audioSettings: props.audioSettings,
      audioFilterMode: getEffectiveAudioProcessingMode(),
      selectedSection: props.showProcessing ? 'processing' : 'deviceTest',
    };

    this.handleSectionKeyDown = this.handleSectionKeyDown.bind(this);
  }

  handleSectionKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const { selectedSection } = this.state;
    const step = ARROW_STEPS[event.key];
    if (!step) return;

    event.preventDefault();
    // In a right-to-left page the arrows point the other way.
    const direction = document.documentElement.dir === 'rtl' ? -step : step;
    const index = (SECTIONS.indexOf(selectedSection) + direction + SECTIONS.length) % SECTIONS.length;
    const nextSection = SECTIONS[index];
    this.setState({ selectedSection: nextSection });
    document.getElementById(`audio-section-tab-${nextSection}`)?.focus();
  }

  handleAudioFilterModeChange(mode: AudioFilterMode) {
    const { settings, audioSettings } = this.state;
    // The mode is the only record of the filter choice - getAudioConstraints()
    // derives the microphone constraints from it. Keeping a copy here would
    // leave the choice in the application group, which follows
    // userSettingsStorage and so can outlive the session-scoped audio group;
    // it would also masquerade as the pre-4.0 record that same fallback
    // exists to honour. Drop any such record: an explicit pick supersedes it.
    delete settings.microphoneConstraints;
    audioSettings.processingMode = mode;

    this.handleUpdateSettings('application', settings);
    this.handleUpdateSettings('audio', audioSettings);

    this.setState({
      settings,
      audioSettings,
      audioFilterMode: mode,
    });
  }

  renderAudioFilters() {
    const { intl } = this.props;
    const { audioFilterMode } = this.state;
    const wasmConfigEnabled = isWasmProcessingConfigEnabled();
    const wasmBrowserSupported = isWasmProcessorSupported();

    const options: AudioFilterOption[] = [];

    options.push(
      {
        value: 'original',
        titleMsg: intlMessages.originalAudioLabel,
        descMsg: intlMessages.originalAudioSummary,
        idealForMsg: intlMessages.originalAudioIdealFor,
        disabled: false,
        dataTest: 'originalAudioRadio',
      },
      {
        value: 'standard',
        titleMsg: intlMessages.standardFilteringLabel,
        descMsg: intlMessages.standardFilteringSummary,
        idealForMsg: intlMessages.standardFilteringIdealFor,
        disabled: false,
        dataTest: 'standardFilteringRadio',
      },
    );
    if (wasmConfigEnabled) {
      options.push({
        value: 'advanced',
        titleMsg: intlMessages.advancedFilteringLabel,
        descMsg: intlMessages.advancedFilteringSummary,
        idealForMsg: intlMessages.advancedFilteringIdealFor,
        disabled: !wasmBrowserSupported,
        disabledReasonMsg: intlMessages.advancedFilteringDisabledReason,
        dataTest: 'advancedFilteringRadio',
      });
    }
    if (wasmConfigEnabled && isVoiceIsolationSupported()) {
      options.push({
        value: 'voiceIsolation',
        titleMsg: intlMessages.voiceIsolationLabel,
        descMsg: intlMessages.voiceIsolationSummary,
        idealForMsg: intlMessages.voiceIsolationIdealFor,
        disabled: !wasmBrowserSupported,
        disabledReasonMsg: intlMessages.advancedFilteringDisabledReason,
        dataTest: 'voiceIsolationRadio',
      });
    }

    return (
      <Styled.FilterGroup
        aria-labelledby={AUDIO_SECTION_TITLE_ID}
        value={audioFilterMode}
        onChange={(e) => this.handleAudioFilterModeChange(e.target.value as AudioFilterMode)}
      >
        {options.map((option) => {
          const reasonId = `${option.dataTest}-reason`;
          const showReason = option.disabled && option.disabledReasonMsg;
          const optionElement = (
            <Styled.FilterOption key={option.value}>
              <Styled.FilterOptionHeader>
                <Styled.RoundRadio
                  value={option.value}
                  disabled={option.disabled}
                  inputProps={{
                    'data-test': option.dataTest,
                    // Tippy is configured with aria: null, so the tooltip alone
                    // never reaches assistive tech - and a disabled radio can be
                    // neither focused nor hovered to surface it.
                    ...(showReason ? { 'aria-describedby': reasonId } : {}),
                  } as React.InputHTMLAttributes<HTMLInputElement>}
                />
                <Styled.FilterOptionTitle>
                  {intl.formatMessage(option.titleMsg)}
                  {['advanced', 'voiceIsolation'].includes(option.value) && (
                    <Styled.ExperimentalBadge>
                      {intl.formatMessage(intlMessages.experimentalBadge)}
                    </Styled.ExperimentalBadge>
                  )}
                </Styled.FilterOptionTitle>
              </Styled.FilterOptionHeader>
              <Styled.FilterOptionDescription>
                {intl.formatMessage(option.descMsg)}
              </Styled.FilterOptionDescription>
              <Styled.FilterOptionDescription>
                <strong>{intl.formatMessage(intlMessages.idealForLabel)}</strong>
                {' '}
                {intl.formatMessage(option.idealForMsg)}
              </Styled.FilterOptionDescription>
              {showReason && option.disabledReasonMsg && (
                <div id={reasonId} hidden>
                  {intl.formatMessage(option.disabledReasonMsg)}
                </div>
              )}
            </Styled.FilterOption>
          );

          if (showReason && option.disabledReasonMsg) {
            return (
              <Tooltip key={option.value} title={intl.formatMessage(option.disabledReasonMsg)}>
                {optionElement}
              </Tooltip>
            );
          }

          return optionElement;
        })}
      </Styled.FilterGroup>
    );
  }

  renderProcessing() {
    const { intl } = this.props;

    return (
      <>
        <Styled.AudioTitle id={AUDIO_SECTION_TITLE_ID}>
          {intl.formatMessage(intlMessages.audioTabTitle)}
        </Styled.AudioTitle>
        <Styled.AudioSubtitle>
          {intl.formatMessage(intlMessages.audioTabSubtitle)}
        </Styled.AudioSubtitle>
        <Styled.Form>
          {this.renderAudioFilters()}
        </Styled.Form>
      </>
    );
  }

  renderSectionTabs() {
    const { intl } = this.props;
    const { selectedSection } = this.state;

    return (
      <Styled.SectionTabList
        role="tablist"
        aria-label={intl.formatMessage(intlMessages.sectionsLabel)}
        onKeyDown={this.handleSectionKeyDown}
      >
        {SECTIONS.map((section, index) => {
          const selected = section === selectedSection;

          return (
            <React.Fragment key={section}>
              {index > 0 && <Styled.SectionTabDivider aria-hidden />}
              <Styled.SectionTab
                type="button"
                role="tab"
                id={`audio-section-tab-${section}`}
                aria-selected={selected}
                aria-controls={`audio-section-panel-${section}`}
                tabIndex={selected ? 0 : -1}
                $selected={selected}
                onClick={() => this.setState({ selectedSection: section })}
                data-test={`${section}AudioSection`}
              >
                {intl.formatMessage(SECTION_LABELS[section])}
              </Styled.SectionTab>
            </React.Fragment>
          );
        })}
      </Styled.SectionTabList>
    );
  }

  render() {
    const {
      showProcessing,
      deviceSelection,
      onDeviceSelectionChange,
    } = this.props;
    const { selectedSection } = this.state;

    // The device test mounts only while shown: it holds the microphone open.
    const deviceTest = (
      <DeviceTest
        selection={deviceSelection}
        onSelectionChange={onDeviceSelectionChange}
      />
    );

    if (!showProcessing) {
      return <Styled.AudioMenuContainer>{deviceTest}</Styled.AudioMenuContainer>;
    }

    return (
      <Styled.AudioMenuContainer>
        {this.renderSectionTabs()}
        <div
          role="tabpanel"
          id={`audio-section-panel-${selectedSection}`}
          aria-labelledby={`audio-section-tab-${selectedSection}`}
        >
          {selectedSection === 'processing' ? this.renderProcessing() : deviceTest}
        </div>
      </Styled.AudioMenuContainer>
    );
  }
}

export default injectIntl(AudioMenu);
