import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import style from './style.scss';
import { makeCall } from '/imports/ui/services/api';
import getValueFromKeyObj from './utils/getValueFromKeyObj';

const intlMessages = defineMessages({
  title: {
    id: 'app.consent.title',
    description: 'Title Modal Con sent',
  },
  desc: {
    id: 'app.consent.desc',
    description: 'Question for accept or not meeting be recorded',
  },
  buttonyes: {
    id: 'app.consent.buttonyes',
    description: 'Button accept',

  },
  buttonreject: {
    id: 'app.consent.buttonreject',
    description: 'Button accept',
  },
});

const ModalConsent = ({ recMeetingsCollection, intl, meetingsCollection }) => {
  const [continueModal, setContinueModal] = React.useState(false);

  const allowRecord = getValueFromKeyObj(
    'record',
    recMeetingsCollection[0],
  );

  const { isBreakout } = getValueFromKeyObj(
    'meetingProp',
    meetingsCollection[0],
  );

  if (
    !allowRecord// if meeting is not able to record
        || !Meteor.settings.public.app.requireAdditionalRecordingConsentOnJoin
        || continueModal // if clicked in continue
        || isBreakout // if is breackout (because user already accept before)
  ) return null;

  const LOGOUT_CODE = '680';
  function skipButtonHandle() {
    makeCall('userLeftMeeting');
    Session.set('codeError', LOGOUT_CODE);
    setContinueModal(true);
  }

  return (

    <div>
      <div className={style.overlay}>
        <div className={style.modal}>

          <h1>{intl.formatMessage(intlMessages.title)}</h1>
          <p>{intl.formatMessage(intlMessages.desc)}</p>
          <div className={style.divButtons}>

            <button type="button" onClick={() => setContinueModal(true)} className={style.continue}>
              {intl.formatMessage(intlMessages.buttonyes)}
            </button>
            <button type="button" onClick={skipButtonHandle} className={style.skip}>
              {intl.formatMessage(intlMessages.buttonreject)}
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default injectIntl(ModalConsent);
