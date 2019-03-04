import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import WebcamDraggableOverlay from './webcam-draggable-overlay/component';

import { styles } from './styles';

const propTypes = {
  children: PropTypes.element.isRequired,
  floatingOverlay: PropTypes.bool,
  hideOverlay: PropTypes.bool,
};

const defaultProps = {
  floatingOverlay: false,
  hideOverlay: true,
};


export default class Media extends Component {
  componentWillUpdate() {
    window.dispatchEvent(new Event('resize'));
  }

  render() {
    const {
      swapLayout, floatingOverlay, hideOverlay, disableVideo, children,
    } = this.props;

    const contentClassName = cx({
      [styles.content]: true,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: floatingOverlay,
    });

    return (
      <div
        id="container"
        className={cx(styles.container)}
        ref={(ref) => { this.refContainer = ref; }}
      >
        <div className={!swapLayout ? contentClassName : overlayClassName}>
          {children}
        </div>
        <WebcamDraggableOverlay
          refMediaContainer={this.refContainer}
          swapLayout={swapLayout}
          floatingOverlay={floatingOverlay}
          hideOverlay={hideOverlay}
          disableVideo={disableVideo}
        />
      </div>
    );
  }
}

Media.propTypes = propTypes;
Media.defaultProps = defaultProps;
