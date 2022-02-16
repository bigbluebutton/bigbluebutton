import React from 'react';
import Toggle from '/imports/ui/components/common/switch/component';
import { defineMessages, injectIntl } from 'react-intl';
import BaseMenu from '../base/component';
import Styled from './styles';

const intlMessages = defineMessages({
  videoSectionTitle: {
    id: 'app.submenu.video.title',
    description: 'Heading for video submenu section',
  },
  videoSourceLabel: {
    id: 'app.submenu.video.videoSourceLabel',
    description: 'Label for video source section',
  },
  videoOptionLabel: {
    id: 'app.submenu.video.videoOptionLabel',
    description: 'default video source option label',
  },
  videoQualityLabel: {
    id: 'app.submenu.video.videoQualityLabel',
    description: 'Label for video quality section',
  },
  qualityOptionLabel: {
    id: 'app.submenu.video.qualityOptionLabel',
    description: 'default quality option label',
  },
  participantsCamLabel: {
    id: 'app.submenu.video.participantsCamLabel',
    description: 'Label for participants cam section',
  },
});

class VideoMenu extends BaseMenu {
  constructor(props) {
    super(props);

    this.state = {
      settingsName: 'video',
      settings: props.settings,
    };
  }

  render() {
    const { intl } = this.props;

    return (
      <div>
        <div>
          <Styled.Title>
            {intl.formatMessage(intlMessages.videoSectionTitle)}
          </Styled.Title>
        </div>

        <Styled.Form>
          <Styled.Row>
            <Styled.Col>
              <Styled.FormElement aria-label={intl.formatMessage(intlMessages.videoSourceLabel)}>
                <Styled.LabelSmall htmlFor="videoSourceSelect">
                  {intl.formatMessage(intlMessages.videoSourceLabel)}
                </Styled.LabelSmall>
                <Styled.Select
                  id="videoSourceSelect"
                  defaultValue="-1"
                >
                  <option value="-1" disabled>
                    {intl.formatMessage(intlMessages.videoOptionLabel)}
                  </option>
                </Styled.Select>
              </Styled.FormElement>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElement aria-label={intl.formatMessage(intlMessages.videoQualityLabel)}>
                <Styled.LabelSmall htmlFor="videoSelectQuality">
                  {intl.formatMessage(intlMessages.videoQualityLabel)}
                </Styled.LabelSmall>
                <Styled.Select
                  id="videoSelectQuality"
                  defaultValue="-1"
                >
                  <option value="-1" disabled>
                    {intl.formatMessage(intlMessages.qualityOptionLabel)}
                  </option>
                </Styled.Select>
              </Styled.FormElement>
            </Styled.Col>
          </Styled.Row>
          <Styled.Row>
            <Styled.Col>
              <Styled.FormElement>
                <Styled.Label>
                  {intl.formatMessage(intlMessages.participantsCamLabel)}
                </Styled.Label>
              </Styled.FormElement>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElementRight>
                <Toggle
                  icons={false}
                  defaultChecked={this.state.viewParticipantsWebcams}
                  onChange={() => this.handleToggle('viewParticipantsWebcams')}
                  ariaLabelledBy="viewCamLabel"
                  ariaLabel={intl.formatMessage(intlMessages.participantsCamLabel)}
                />
              </Styled.FormElementRight>
            </Styled.Col>
          </Styled.Row>
        </Styled.Form>
      </div>
    );
  }
}

export default injectIntl(VideoMenu);
