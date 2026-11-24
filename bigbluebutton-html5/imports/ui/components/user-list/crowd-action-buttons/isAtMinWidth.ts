import { DEVICE_TYPE } from '/imports/ui/components/layout/enums';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';

/**
 * Whether the sidebar sits at its minimum width (the crowd buttons then stack). The minimum is the
 * 283.2 px default, or the whole window on a phone-sized layout, where the sidebar always sits at it.
 */
const isSidebarAtMinWidth = (width: number, deviceType: string): boolean => width > 0
  && (deviceType === DEVICE_TYPE.MOBILE || width <= DEFAULT_VALUES.sidebarContentMinWidth + 1);

export default isSidebarAtMinWidth;
