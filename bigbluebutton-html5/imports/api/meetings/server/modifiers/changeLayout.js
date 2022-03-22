import Logger from '/imports/startup/server/logger';
import { LayoutMeetings } from '/imports/api/meetings';
import { check } from 'meteor/check';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';

const APP_CONFIG = Meteor.settings.public.app.defaultSettings.application;

export default function changeLayout(meetingId, layout, presentationIsOpen, isResizing, cameraPosition, focusedCamera, presentationVideoRate, requesterUserId) {
  try {
    check(meetingId, String);
    check(requesterUserId, String);
    check(isResizing, Boolean);
    check(layout, String);

    const selector = {
      meetingId,
    };

    const modifier = {
      $set: {
        layout: LAYOUT_TYPE[layout] || LAYOUT_TYPE.SMART_LAYOUT,
        layoutUpdatedAt: new Date().getTime(),
        presentationIsOpen,
        isResizing,
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
