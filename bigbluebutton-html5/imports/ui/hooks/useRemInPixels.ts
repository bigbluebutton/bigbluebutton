import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { convertRemToPixels } from '/imports/utils/dom-utils';

// After startup only the Settings dialog changes the root font size, and it
// keeps a new size only when it saves the application settings.
const useRemInPixels = (rem: number): number => {
  useSettings(SETTINGS.APPLICATION);
  return convertRemToPixels(rem);
};

export default useRemInPixels;
