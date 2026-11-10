import { test } from '../core/setup/fixtures';
import { constants as c } from './constants';
import { OFFER_BREAKOUT_RECORDING_SETTINGS, RecordingParameters } from './recordingParameters';
import { encodeCustomParams } from './util';

const RECORD_PERMISSION_TOOLTIP = 'Ask a moderator to start the recording';

// Audio plays no part in these checks, so it is skipped rather than joined.
function joinWithoutAudio(joinParameter?: string) {
  return {
    joinParameter: joinParameter ? `${c.autoJoin}&${joinParameter}` : c.autoJoin,
    shouldCloseAudioModal: false,
  };
}

test.describe.parallel('Recording create parameters', { tag: '@nightly' }, () => {
  test('autoStartRecording=true starts recording when the first user joins', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const recording = new RecordingParameters(browser, context);
    await recording.initModPage(page, {
      createParameter: `${c.recordMeeting}&autoStartRecording=true`,
      ...joinWithoutAudio(),
      testInfo,
    });
    await recording.recordingStartsOnJoin();
  });

  test('allowStartStopRecording=false gives the moderator no recording control', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const recording = new RecordingParameters(browser, context);
    await recording.initModPage(page, {
      createParameter: `${c.recordMeeting}&autoStartRecording=false&allowStartStopRecording=false`,
      ...joinWithoutAudio(),
      testInfo,
    });
    await recording.noRecordingControl();
  });

  test('allowStartStopRecording=false keeps the moderator from stopping an auto-started recording', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const recording = new RecordingParameters(browser, context);
    await recording.initModPage(page, {
      createParameter: `${c.recordMeeting}&autoStartRecording=true&allowStartStopRecording=false`,
      ...joinWithoutAudio(),
      testInfo,
    });
    await recording.recordingCannotBeStopped();
  });

  test('userdata-bbb_record_permission=false takes the recording control from that moderator only', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const recording = new RecordingParameters(browser, context);
    await recording.initModPage(page, {
      createParameter: c.recordMeeting,
      ...joinWithoutAudio('userdata-bbb_record_permission=false'),
      testInfo,
    });
    await recording.initModPage2(context, { ...joinWithoutAudio(), testInfo });
    await recording.recordPermissionDeniedForOneModerator();
  });

  test('userdata-bbb_record_permission=true lets a viewer start the recording', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const recording = new RecordingParameters(browser, context);
    await recording.initModPage(page, { createParameter: c.recordMeeting, ...joinWithoutAudio(), testInfo });
    await recording.initUserPage(context, { ...joinWithoutAudio('userdata-bbb_record_permission=true'), testInfo });
    await recording.viewerStartsRecording();
  });

  test('userdata-bbb_record_permission_tooltip shows on the paused indicator of a user who cannot record', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const recording = new RecordingParameters(browser, context);
    await recording.initModPage(page, { createParameter: c.recordMeeting, ...joinWithoutAudio(), testInfo });
    await recording.initUserPage(context, {
      ...joinWithoutAudio(encodeCustomParams(`userdata-bbb_record_permission_tooltip=${RECORD_PERMISSION_TOOLTIP}`)),
      testInfo,
    });
    await recording.customRecordPermissionTooltip(RECORD_PERMISSION_TOOLTIP);
  });

  test('breakoutRoomsRecord=true offers to record the breakout rooms', async ({ browser, context, page }, testInfo) => {
    const recording = new RecordingParameters(browser, context);
    await recording.initModPage(page, {
      createParameter: `${c.recordMeeting}&breakoutRoomsRecord=true`,
      clientSettingsOverrides: OFFER_BREAKOUT_RECORDING_SETTINGS,
      ...joinWithoutAudio(),
      testInfo,
    });
    await recording.breakoutRecordOption(true);
  });

  // false is also the server default (bigbluebutton.properties).
  test('breakoutRoomsRecord=false does not offer to record the breakout rooms', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const recording = new RecordingParameters(browser, context);
    await recording.initModPage(page, {
      createParameter: `${c.recordMeeting}&breakoutRoomsRecord=false`,
      clientSettingsOverrides: OFFER_BREAKOUT_RECORDING_SETTINGS,
      ...joinWithoutAudio(),
      testInfo,
    });
    await recording.breakoutRecordOption(false);
  });
});
