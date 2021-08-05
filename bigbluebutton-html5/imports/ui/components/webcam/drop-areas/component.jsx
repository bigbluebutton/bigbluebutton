import React, { Fragment } from 'react';
import styles from './styles.scss';

const DropArea = ({ id, style }) => (
  <>
    <div
      id={id}
      className={styles.dropZoneArea}
      style={
        {
          ...style,
          zIndex: style.zIndex + 1,
        }
      }
    />
    <div
      className={styles.dropZoneBg}
      style={
        {
          ...style,
          zIndex: style.zIndex,
        }
      }
    >
      Drop Here
    </div>
  </>
);

export default DropArea;
