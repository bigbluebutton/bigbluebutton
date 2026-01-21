import { Logger } from "../common/logger";
import { meetingLockMap } from "../common/singleton";
import { fetchAllMeetingLockSettings } from "./model";

const logger = new Logger('Database Helper');

export async function prePopulateMeetingLockMap () {
  // Populate meeting lock settings map
  try {
    const allLockSettings = await fetchAllMeetingLockSettings();

    allLockSettings.forEach((lockSetting) => {
      meetingLockMap.set(lockSetting.meetingId, {
        viewerReadOnly: lockSetting.disableNotes,
      });
    });

    logger.info(`Populated lock settings for ${allLockSettings.length} meetings`);
  } catch (error) {
    logger.error('Failed to populate meeting lock settings map', error as Error);
  }
}