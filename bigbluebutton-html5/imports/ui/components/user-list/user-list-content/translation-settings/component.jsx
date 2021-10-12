import {styles} from "./styles.scss";
import  {styles as cstyles} from '/imports/ui/components/user-list/user-list-content/styles';

import React, {Component} from 'react';
import {defineMessages} from 'react-intl';
import AudioManager from '/imports/ui/services/audio-manager';
import Meeting from "../../../../services/meeting";


const intlMessages = defineMessages({
  originLanguage: {
    id: 'app.translation.language.origin',
    description: 'Name of origin language',
    defaultMessage: 'Floor',
  },
  noneLanguage: {
    id: 'app.translation.language.none',
    description: 'Name of none language',
    defaultMessage: 'None',
  },
  interpretationVolumeHeader: {
    id: 'app.translation.language.interpretationVolumeHeader',
    description: 'Name of interpretation volume header',
    defaultMessage: 'None',
  },
  interpretationVolumeOriginal: {
    id: 'app.translation.language.interpretationVolumeOriginal',
    description: 'Name of original interpretation volume - original',
    defaultMessage: 'None',
  },
  interpretationVolumeInterpretation: {
    id: 'app.translation.language.interpretationVolumeInterpretation',
    description: 'Name of original interpretation volume',
    defaultMessage: 'None',
  },
});

class TranslationSettings extends Component {

  state = {
    languages: [],
    translationOriginalVolume: AudioManager.translationOriginalVolume,
    selectedChannel: AudioManager.$translationChannelSelected.value
  };

  componentDidMount() {
    this.getLanguages();
    AudioManager.$translationChannelSelected.subscribe((val) => {
      this.setState({selectedChannel: val})
    })
  }

  getLanguages() {
    Meeting.getLanguages().then(languages => {
      languages.push({
        name: this.props.intl.formatMessage(this.props.translator ? intlMessages.noneLanguage : intlMessages.originLanguage),
        extension: -1,
      });

      this.setState({languages: languages})

    })
    this.forceUpdate();
  }

  setTranslationOriginalVolume(pEvent) {
    if (pEvent.target.dataset.hasOwnProperty("ext")) {
      AudioManager.$translationOriginalVolumeChanged.next({
        extension: pEvent.target.dataset["ext"],
        volume: 1 - pEvent.target.value
      });
    }
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
      <div key={"translation-settings"}>
        <div className={cstyles.container}>
          <h2 className={cstyles.smallTitle}>
            { (this.state.selectedChannel >= 0) ? intl.formatMessage(intlMessages.interpretationVolumeHeader) : ""}
          </h2>
        </div>
        {this.state.languages.map(function (language, index) {
          if(language.extension >= 0 && language.extension === this.state.selectedChannel) return (
            <div key={index} className={styles.translationOriginalVolumePanel}>
              <div>{language.name}:</div>
              <input type="range" data-ext={index} name="volume" min="0" max="1" step=".01"
                     defaultValue={1 - AudioManager.getTranslationFloorVolumeByExt(index)}
                     onChange={this.setTranslationOriginalVolume.bind(this)}/>
              <div className={styles.interpretationVolumeWrapper}>
                <div className={styles.interpretationVolumeOriginal}>{intl.formatMessage(intlMessages.interpretationVolumeOriginal)}</div>
                <div className={styles.interpretationVolumeInterpretation}>{intl.formatMessage(intlMessages.interpretationVolumeInterpretation)}</div>
              </div>

            </div>
          )
        }, this)
        }
      </div>


    );
  }
}

export default TranslationSettings;
