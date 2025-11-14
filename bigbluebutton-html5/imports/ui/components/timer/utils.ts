/**
 * Format time duration in seconds to H:MM:SS format
 * @param totalSeconds - Duration in seconds
 * @returns Formatted time string (e.g., "1:05:30")
 */
export const formatPresetLabel = (totalSeconds: number): string => {
  if (!totalSeconds && totalSeconds !== 0) return '';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  // Always show in H:MM:SS format for clarity
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Calculate the next preset index in a circular manner
 * @param currentIndex - Current preset index
 * @param totalPresets - Total number of presets
 * @returns
 */
export const getNextPresetIndex = (currentIndex: number, totalPresets: number): number => {
  return (currentIndex + 1) % totalPresets;
};

/**
 * Calculate the previous preset index in a circular manner
 * @param currentIndex - Current preset index
 * @param totalPresets - Total number of presets
 * @returns
 */
export const getPrevPresetIndex = (currentIndex: number, totalPresets: number): number => {
  return (currentIndex - 1 + totalPresets) % totalPresets;
};

/**
 * Get visible presets around the current index
 * @param currentIndex
 * @param presetSeconds
 * @param visibleCount
 * @returns
 */
export const getVisiblePresets = (
  currentIndex: number,
  presetSeconds: number[],
  visibleCount: number = 3,
): Array<{ secs: number; isActive: boolean; idx: number }> => {
  const totalPresets = presetSeconds.length;
  if (totalPresets === 0) return [];
  const visibleOffsets = Array.from({ length: visibleCount }, (_, i) => i);
  return visibleOffsets.map((offset) => {
    const idx = (currentIndex + offset + totalPresets) % totalPresets;
    return { secs: presetSeconds[idx], isActive: false, idx };
  });
};

/**
 * Increment a time unit with proper overflow handling
 * @param hours
 * @param minutes
 * @param seconds
 * @param unit
 * @param maxHours
 * @returns
 */
export const incrementTimeUnit = (
  hours: number,
  minutes: number,
  seconds: number,
  unit: 'hours' | 'minutes' | 'seconds',
  maxHours: number,
): { hours: number; minutes: number; seconds: number } => {
  let newHours = hours;
  let newMinutes = minutes;
  let newSeconds = seconds;

  if (unit === 'hours') {
    newHours = Math.min(hours + 1, maxHours);
  } else if (unit === 'minutes') {
    newMinutes = minutes + 1;
    if (newMinutes >= 60) {
      newMinutes = 0;
      newHours = Math.min(hours + 1, maxHours);
    }
  } else if (unit === 'seconds') {
    newSeconds = seconds + 1;
    if (newSeconds >= 60) {
      newSeconds = 0;
      newMinutes = minutes + 1;
      if (newMinutes >= 60) {
        newMinutes = 0;
        newHours = Math.min(hours + 1, maxHours);
      }
    }
  }

  return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
};

/**
 * Decrement a time unit with proper underflow handling
 * @param hours
 * @param minutes
 * @param seconds
 * @param unit
 * @returns
 */
export const decrementTimeUnit = (
  hours: number,
  minutes: number,
  seconds: number,
  unit: 'hours' | 'minutes' | 'seconds',
): { hours: number; minutes: number; seconds: number } => {
  let newHours = hours;
  let newMinutes = minutes;
  let newSeconds = seconds;

  if (unit === 'hours') {
    newHours = Math.max(hours - 1, 0);
  } else if (unit === 'minutes') {
    newMinutes = minutes - 1;
    if (newMinutes < 0) {
      if (newHours > 0) {
        newMinutes = 59;
        newHours = hours - 1;
      } else {
        newMinutes = 0;
      }
    }
  } else if (unit === 'seconds') {
    newSeconds = seconds - 1;
    if (newSeconds < 0) {
      if (newMinutes > 0) {
        newSeconds = 59;
        newMinutes = minutes - 1;
      } else if (newHours > 0) {
        newSeconds = 59;
        newMinutes = 59;
        newHours = hours - 1;
      } else {
        newSeconds = 0;
      }
    }
  }

  return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
};

/**
 * Convert total seconds to hours, minutes, and seconds
 * @param totalSeconds - Duration in seconds
 * @returns Object with hours, minutes, and seconds
 */
export const convertSecondsToTime = (totalSeconds: number): { hours: number; minutes: number; seconds: number } => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
};

/**
 * Convert hours, minutes, and seconds to total seconds
 * @param hours
 * @param minutes
 * @param seconds
 * @returns
 */
export const convertTimeToSeconds = (hours: number, minutes: number, seconds: number): number => {
  return (hours * 3600) + (minutes * 60) + seconds;
};

/**
 * Add time duration to current time with bounds checking
 * @param currentHours
 * @param currentMinutes
 * @param currentSeconds
 * @param amountInSeconds - Seconds to add (can be negative)
 * @param maxHours
 * @returns
 */
export const addTimeWithBounds = (
  currentHours: number,
  currentMinutes: number,
  currentSeconds: number,
  amountInSeconds: number,
  maxHours: number,
): { hours: number; minutes: number; seconds: number } => {
  const currentTimeInSeconds = convertTimeToSeconds(currentHours, currentMinutes, currentSeconds);
  let newTotalSeconds = currentTimeInSeconds + amountInSeconds;

  const maxSeconds = (maxHours * 3600) + (59 * 60) + 59;
  newTotalSeconds = Math.max(0, Math.min(newTotalSeconds, maxSeconds));

  return convertSecondsToTime(newTotalSeconds);
};
