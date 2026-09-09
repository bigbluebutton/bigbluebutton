import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import Styled from './styles';
import {
  AudioFilterMode, AudioFilterOption, AudioMenuProps, AudioMenuState,
} from './types';
import {
  isWasmProcessorSupported, isWasmProcessingConfigEnabled, getConstraintsForMode,
  getEffectiveAudioProcessingMode, getEffectiveAudioProcessingIntensity,
  isWasmProcessorIntensitySupported, setWasmProcessorIntensity,
  MIN_PROCESSING_INTENSITY, MAX_PROCESSING_INTENSITY,
} from '/imports/api/audio/client/bridge/service';
import Tooltip from '/imports/ui/components/common/tooltip/container';

const AUDIO_SECTION_TITLE_ID = 'audioProcessingSectionTitle';
const INTENSITY_LABEL_ID = 'advancedFilteringIntensityLabel';
const INTENSITY_DESC_ID = 'advancedFilteringIntensityDesc';

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
  advancedFilteringDesc: {
    id: 'app.submenu.audio.advancedFilteringDesc',
    description: 'advanced audio filtering option description',
  },
  standardFilteringLabel: {
    id: 'app.submenu.audio.standardFiltering',
    description: 'standard audio filtering option label',
  },
  standardFilteringDesc: {
    id: 'app.submenu.audio.standardFilteringDesc',
    description: 'standard audio filtering option description',
  },
  originalAudioLabel: {
    id: 'app.submenu.audio.originalAudio',
    description: 'original/unprocessed audio option label',
  },
  originalAudioDesc: {
    id: 'app.submenu.audio.originalAudioDesc',
    description: 'original/unprocessed audio option description',
  },
  advancedFilteringDisabledReason: {
    id: 'app.submenu.audio.advancedFilteringDisabledReason',
    description: 'reason shown when advanced filtering is unavailable',
  },
  advancedFilteringIntensityLabel: {
    id: 'app.submenu.audio.advancedFilteringIntensity',
    description: 'advanced audio filtering intensity slider label',
  },
  advancedFilteringIntensityDesc: {
    id: 'app.submenu.audio.advancedFilteringIntensityDesc',
    description: 'advanced audio filtering intensity slider description',
  },
});

class AudioMenu extends BaseMenu {
  props!: AudioMenuProps;

  state: AudioMenuState;

  constructor(props: AudioMenuProps) {
    super(props);

    this.state = {
      settings: props.settings,
      audioSettings: props.audioSettings,
      audioFilterMode: getEffectiveAudioProcessingMode(),
      audioFilterIntensity: getEffectiveAudioProcessingIntensity(),
    };
  }

  handleAudioFilterModeChange(mode: AudioFilterMode) {
    const { settings, audioSettings } = this.state;
    settings.microphoneConstraints = getConstraintsForMode(mode);
    audioSettings.processingMode = mode;

    this.handleUpdateSettings('application', settings);
    this.handleUpdateSettings('audio', audioSettings);

    this.setState({
      settings,
      audioSettings,
      audioFilterMode: mode,
    });
  }

  // Applied to the live processor as the slider moves so the user can hear
  // what they are choosing; persisted with the rest of the tab on Save.
  handleAudioFilterIntensityChange(intensity: number) {
    const { audioSettings } = this.state;
    audioSettings.processingIntensity = intensity;

    this.handleUpdateSettings('audio', audioSettings);
    setWasmProcessorIntensity(intensity);

    this.setState({
      audioSettings,
      audioFilterIntensity: intensity,
    });
  }

  renderIntensityControl(disabled: boolean) {
    const { intl } = this.props;
    const { audioFilterIntensity } = this.state;

    return (
      <Styled.IntensityControl>
        <Styled.IntensityLabel id={INTENSITY_LABEL_ID}>
          {intl.formatMessage(intlMessages.advancedFilteringIntensityLabel)}
        </Styled.IntensityLabel>
        <Styled.IntensityDescription id={INTENSITY_DESC_ID}>
          {intl.formatMessage(intlMessages.advancedFilteringIntensityDesc)}
        </Styled.IntensityDescription>
        <Styled.IntensitySlider
          value={audioFilterIntensity}
          min={MIN_PROCESSING_INTENSITY}
          max={MAX_PROCESSING_INTENSITY}
          step={1}
          disabled={disabled}
          valueLabelDisplay="auto"
          aria-labelledby={INTENSITY_LABEL_ID}
          aria-describedby={INTENSITY_DESC_ID}
          data-test="advancedFilteringIntensitySlider"
          onChange={(_, value) => this.handleAudioFilterIntensityChange(value as number)}
        />
      </Styled.IntensityControl>
    );
  }

  renderAudioFilters() {
    const { intl } = this.props;
    const { audioFilterMode } = this.state;
    const wasmConfigEnabled = isWasmProcessingConfigEnabled();
    const wasmBrowserSupported = isWasmProcessorSupported();
    const intensitySupported = isWasmProcessorIntensitySupported();

    const options: AudioFilterOption[] = [];

    if (wasmConfigEnabled) {
      options.push({
        value: 'advanced',
        titleMsg: intlMessages.advancedFilteringLabel,
        descMsg: intlMessages.advancedFilteringDesc,
        disabled: !wasmBrowserSupported,
        disabledReasonMsg: intlMessages.advancedFilteringDisabledReason,
        dataTest: 'advancedFilteringRadio',
      });
    }

    options.push(
      {
        value: 'standard',
        titleMsg: intlMessages.standardFilteringLabel,
        descMsg: intlMessages.standardFilteringDesc,
        disabled: false,
        dataTest: 'standardFilteringRadio',
      },
      {
        value: 'original',
        titleMsg: intlMessages.originalAudioLabel,
        descMsg: intlMessages.originalAudioDesc,
        disabled: false,
        dataTest: 'originalAudioRadio',
      },
    );

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
                </Styled.FilterOptionTitle>
              </Styled.FilterOptionHeader>
              <Styled.FilterOptionDescription>
                {intl.formatMessage(option.descMsg)}
              </Styled.FilterOptionDescription>
              {showReason && option.disabledReasonMsg && (
                <div id={reasonId} hidden>
                  {intl.formatMessage(option.disabledReasonMsg)}
                </div>
              )}
            </Styled.FilterOption>
          );

          // The option itself is a <label>: an interactive slider nested in it
          // would re-select the radio on every drag, so it goes alongside.
          const showIntensity = option.value === 'advanced'
            && intensitySupported
            && !option.disabled;

          if (showReason && option.disabledReasonMsg) {
            return (
              <Tooltip key={option.value} title={intl.formatMessage(option.disabledReasonMsg)}>
                {optionElement}
              </Tooltip>
            );
          }

          if (showIntensity) {
            return (
              <React.Fragment key={option.value}>
                {optionElement}
                {this.renderIntensityControl(audioFilterMode !== 'advanced')}
              </React.Fragment>
            );
          }

          return optionElement;
        })}
      </Styled.FilterGroup>
    );
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
      <Styled.AudioMenuContainer>
        <Styled.AudioTitle id={AUDIO_SECTION_TITLE_ID}>
          {intl.formatMessage(intlMessages.audioTabTitle)}
        </Styled.AudioTitle>
        <Styled.AudioSubtitle>
          {intl.formatMessage(intlMessages.audioTabSubtitle)}
        </Styled.AudioSubtitle>
        <Styled.Form>
          {this.renderAudioFilters()}
        </Styled.Form>
      </Styled.AudioMenuContainer>
    );
  }
}

export default injectIntl(AudioMenu);
