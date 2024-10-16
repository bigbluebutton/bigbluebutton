import { useCallback } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';
import getFromUserSettings from '/imports/ui/services/users-settings';

const useWhiteboardMenuOnRight = () => {
  const initialWbMenuRight = getFromUserSettings('bbb_whiteboard_menu_on_right', false);
  const whiteboardMenuOnRightState = makeVar(initialWbMenuRight);

  const currentValue = useReactiveVar(whiteboardMenuOnRightState);
  const whiteboardMenuOnRight = useCallback(() => currentValue, [currentValue]);

  const setWhiteboardMenuOnRight = useCallback((right: boolean) => {
    whiteboardMenuOnRightState(right);
  }, []);
  return {
    whiteboardMenuOnRight,
    setWhiteboardMenuOnRight,
  };
};

export default useWhiteboardMenuOnRight;
