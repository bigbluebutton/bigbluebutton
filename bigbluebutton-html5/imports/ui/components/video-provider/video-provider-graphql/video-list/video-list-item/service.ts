import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS } from '/imports/ui/components/layout/enums';
const STREAM_STATE_CHANGED_EVENT_PREFIX = 'streamStateChanged';

export const isStreamStateUnhealthy = (streamState: string): boolean => streamState === 'failed' || streamState === 'closed';

export const subscribeToStreamStateChange = (eventTag: string,
  callback: EventListener | EventListenerObject): void => {
  const eventName = `${STREAM_STATE_CHANGED_EVENT_PREFIX}:${eventTag}`;
  window.addEventListener(eventName, callback, false);
};
export const handleVideoFocus = (id: string, focusedId: string) => {
  const dispatch = layoutDispatch();
  dispatch({
    type: ACTIONS.SET_FOCUSED_CAMERA_ID,
    value: focusedId !== id ? id : false,
  });
};

export default {
  isStreamStateUnhealthy,
  subscribeToStreamStateChange,
  handleVideoFocus,
};
