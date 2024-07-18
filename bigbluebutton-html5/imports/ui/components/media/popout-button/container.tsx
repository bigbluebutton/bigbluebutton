import React from 'react';
import PropTypes from 'prop-types';
import PopoutButtonComponent from './component';
import PopoutService from './service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const propTypes = {
  popoutRef: PropTypes.instanceOf(HTMLDivElement),
  dark: PropTypes.bool,
  bottom: PropTypes.bool,
  elementName: PropTypes.string.isRequired,
  color: PropTypes.string,
  popOutStyle: PropTypes.bool,
  fullScreenEnabled: PropTypes.bool,
};

type PopoutButtonContainerProps = PropTypes.InferProps<typeof propTypes>;

const PopoutButtonContainer: React.FC<PopoutButtonContainerProps> = (props) => {
  const {
    popoutRef,
    dark,
    bottom,
    color,
    popOutStyle,
    elementName,
    fullScreenEnabled,
  } = props;
  const {
    data: currentUser,
  } = useCurrentUser((u) => ({
    mobile: u.mobile,
  }));

  const enabled = PopoutService.isEnabled(currentUser);
  if (!enabled) return null;

  return (
    <PopoutButtonComponent
      popoutRef={popoutRef}
      dark={dark}
      bottom={bottom}
      color={color}
      popOutStyle={popOutStyle}
      elementName={elementName}
      fullScreenEnabled={fullScreenEnabled}
    />
  );
};

export default PopoutButtonContainer;
