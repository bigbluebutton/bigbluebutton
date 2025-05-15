export function getRemainingMeetingTime(durationInSeconds:number, createdTime:number, timeSync: number) {
  const clientCurrentTime = Date.now();
  const adjustedCurrentTime = clientCurrentTime + timeSync;

  const elapsedMilliseconds = adjustedCurrentTime - createdTime;
  const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

  const remainingSeconds = Math.max(0, durationInSeconds - elapsedSeconds);

  return remainingSeconds;
}

export function exceedsRemainingTime(remainingTime: number, newTimeInSeconds: number): boolean {
  if (remainingTime === 0) return false;
  return newTimeInSeconds >= remainingTime;
}

export function isNewTimeValid(remainingTime: number, newTime: number) {
  const FIVE_MINUTES = 300; // 5 minutes in seconds
  const newTimeInSeconds = newTime * 60; // Convert newTime from minutes to seconds
  if (remainingTime === 0) return newTimeInSeconds >= FIVE_MINUTES;
  if (exceedsRemainingTime(remainingTime, newTimeInSeconds)) {
    return false;
  }

  if (remainingTime > FIVE_MINUTES) {
    return newTimeInSeconds >= FIVE_MINUTES; // If > 5 min left, newTime must be at least 5 min
  }

  // If remainingTime is already under 5 min, any smaller/equal newTime is acceptable
  return true;
}

export default {
  getRemainingMeetingTime,
  isNewTimeValid,
  exceedsRemainingTime,
};
