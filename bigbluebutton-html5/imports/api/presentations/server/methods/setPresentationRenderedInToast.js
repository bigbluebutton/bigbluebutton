import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function setPresentationRenderedInToast(tmpPresIdListToSetAsRendered) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const payload = {
        $set: {renderedInToast: true}
    };

    let numberAffected;
    tmpPresIdListToSetAsRendered.forEach(p => {
        numberAffected += Presentations.update({
            tmpPresId: p,
            meetingId,
        }, payload)
    });
    // const numberAffected = Presentations.update({
    //     tmpPresId: {$all: tmpPresIdListToSetAsRendered},
    //     meetingId,
    // }, payload)

    if (numberAffected) {
      Logger.info(`TemporaryPresentationIds: ${tmpPresIdListToSetAsRendered} have been set as rendered in the toast within meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method setPresentationRenderedInToast ${err.stack}`);
  }
}
