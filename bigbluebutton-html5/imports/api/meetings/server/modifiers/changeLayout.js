import Logger from '/imports/startup/server/logger';
import { LayoutMeetings } from '/imports/api/meetings';
import { check } from 'meteor/check';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';

export default function changeLayout(meetingId, layout, presentationIsOpen, cameraPosition, focusedCamera, presentationVideoRate, requesterUserId) {
  try {
    check(meetingId, String);
    check(requesterUserId, String);
    check(layout, String);

    const selector = {
      meetingId,
    };

    const modifier = {
      $set: {
        layout: LAYOUT_TYPE[layout] || LAYOUT_TYPE.SMART_LAYOUT,
        layoutUpdatedAt: new Date().getTime(),
        presentationIsOpen,
        cameraPosition,
        focusedCamera,
        presentationVideoRate,
      },
    };

    const numberAffected = LayoutMeetings.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`MeetingLayout changed to ${layout} for meeting=${meetingId} requested by user=${requesterUserId}`);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method changeLayout ${err.stack}`);
  }
}
