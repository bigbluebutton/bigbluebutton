import * as React from 'react';
import PropTypes from 'prop-types';
import logger from '/imports/startup/client/logger';
import Cursor from '../cursor/component';

const PositionLabel = (props) => {
  const {
    currentUser,
    currentPoint,
    tldrawCamera,
    publishCursorUpdate,
    whiteboardId,
    pos,
    isMultiUserActive,
  } = props;

  const { name, color, userId } = currentUser;
  const { x, y } = pos;
  const { zoom, point: tldrawPoint } = tldrawCamera;

  React.useEffect(() => {
    try {
      const point = [x, y];
      publishCursorUpdate({
        xPercent:
          point[0] / zoom - tldrawPoint[0],
        yPercent:
          point[1] / zoom - tldrawPoint[1],
        whiteboardId,
      });
    } catch (error) {
      logger.error({
        logCode: 'cursor_update__error',
        extraInfo: { error },
      }, 'Whiteboard catch error on cursor update');
    }
  }, [x, y, zoom, tldrawPoint]);

  // eslint-disable-next-line arrow-body-style
  React.useEffect(() => {
    return () => {
      // Disable cursor on unmount
      publishCursorUpdate({
        xPercent: -1.0,
        yPercent: -1.0,
        whiteboardId,
      });
    };
  }, []);

  return (
    <>
      <div style={{ position: 'absolute', height: '100%', width: '100%' }}>
        <Cursor
          key={`${userId}-label`}
          name={name}
          color={color}
          x={x}
          y={y}
          currentPoint={currentPoint}
          tldrawCamera={tldrawCamera}
          isMultiUserActive={isMultiUserActive(whiteboardId)}
        />
      </div>
    </>
  );
};

PositionLabel.propTypes = {
  currentUser: PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
  }).isRequired,
  currentPoint: PropTypes.arrayOf(PropTypes.number).isRequired,
  tldrawCamera: PropTypes.shape({
    point: PropTypes.arrayOf(PropTypes.number).isRequired,
    zoom: PropTypes.number.isRequired,
  }).isRequired,
  publishCursorUpdate: PropTypes.func.isRequired,
  whiteboardId: PropTypes.string,
  pos: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  isMultiUserActive: PropTypes.func.isRequired,
};

PositionLabel.defaultProps = {
  whiteboardId: undefined,
};

export default PositionLabel;
