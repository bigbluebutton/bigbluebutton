import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

const { pointerDiameter } = Meteor.settings.public.whiteboard;

const Cursor = (props) => {
  const {
    name,
    color,
    x,
    y,
    currentPoint,
    tldrawCamera,
    isMultiUserActive,
    owner = false,
  } = props;

  const z = !owner ? 2 : 1;
  let _x = null;
  let _y = null;

  if (!currentPoint) {
    _x = (x + tldrawCamera?.point[0]) * tldrawCamera?.zoom;
    _y = (y + tldrawCamera?.point[1]) * tldrawCamera?.zoom;
  }

  const transitionStyle = owner ? { transition: 'left 0.3s ease-out, top 0.3s ease-out' } : {};

  return (
    <>
      <div
        style={{
          zIndex: z,
          position: 'absolute',
          left: (_x || x) - pointerDiameter / 2,
          top: (_y || y) - pointerDiameter / 2,
          width: pointerDiameter,
          height: pointerDiameter,
          borderRadius: '50%',
          background: `${color}`,
          pointerEvents: 'none',
          ...transitionStyle,
        }}
      />

      {isMultiUserActive && (
        <div
          style={{
            zIndex: z,
            position: 'absolute',
            pointerEvents: 'none',
            left: (_x || x) + 3.75,
            top: (_y || y) + 3,
            paddingLeft: '.25rem',
            paddingRight: '.25rem',
            paddingBottom: '.1rem',
            lineHeight: '1rem',
            borderRadius: '2px',
            color: '#FFF',
            backgroundColor: color,
            border: `1px solid ${color}`,
            ...transitionStyle,
          }}
          data-test="whiteboardCursorIndicator"
        >
          {name}
        </div>
      )}
    </>
  );
};

Cursor.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  currentPoint: PropTypes.arrayOf(PropTypes.number),
  tldrawCamera: PropTypes.shape({
    point: PropTypes.arrayOf(PropTypes.number).isRequired,
    zoom: PropTypes.number.isRequired,
  }),
  isMultiUserActive: PropTypes.bool.isRequired,
  owner: PropTypes.bool,
};
Cursor.defaultProps = {
  owner: false,
  currentPoint: undefined,
  tldrawCamera: undefined,
};

export default Cursor;
