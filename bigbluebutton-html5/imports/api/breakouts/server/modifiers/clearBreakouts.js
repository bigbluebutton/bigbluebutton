import Logger from '/imports/startup/server/logger';
import Breakouts from '/imports/api/breakouts';

export default async function clearBreakouts(breakoutId) {
  if (breakoutId) {
    const selector = {
      breakoutId,
    };

    try {
      const numberAffected = await Breakouts.removeAsync(selector);

      if (numberAffected) {
        Logger.info(`Cleared Breakouts (${breakoutId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing Breakouts (${breakoutId})`);
    }
  } else {
    try {
      const numberAffected = await Breakouts.removeAsync({});
      if (numberAffected) {
        Logger.info('Cleared Breakouts (all)');
      }
    } catch (err) {
      Logger.error('Error on clearing Breakouts (all)');
    }
  }
}
