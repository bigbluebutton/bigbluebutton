import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import _ from 'lodash';
import { styles } from './styles';
import VideoListItemContainer from './video-list-item/container';
import { withDraggableConsumer } from '../../media/webcam-draggable-overlay/context';
import AutoplayOverlay from '../../media/autoplay-overlay/component';
import logger from '/imports/startup/client/logger';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import VideoService from '/imports/ui/components/video-provider/service';
import Button from '/imports/ui/components/button/component';

const propTypes = {
  streams: PropTypes.arrayOf(PropTypes.object).isRequired,
  onMount: PropTypes.func.isRequired,
  webcamDraggableDispatch: PropTypes.func.isRequired,
  intl: PropTypes.objectOf(Object).isRequired,
  swapLayout: PropTypes.bool.isRequired,
  numberOfPages: PropTypes.number.isRequired,
  currentVideoPageIndex: PropTypes.number.isRequired,
};

const intlMessages = defineMessages({
  focusLabel: {
    id: 'app.videoDock.webcamFocusLabel',
  },
  focusDesc: {
    id: 'app.videoDock.webcamFocusDesc',
  },
  unfocusLabel: {
    id: 'app.videoDock.webcamUnfocusLabel',
  },
  unfocusDesc: {
    id: 'app.videoDock.webcamUnfocusDesc',
  },
  mirrorLabel: {
    id: 'app.videoDock.webcamMirrorLabel',
  },
  mirrorDesc: {
    id: 'app.videoDock.webcamMirrorDesc',
  },
  autoplayBlockedDesc: {
    id: 'app.videoDock.autoplayBlockedDesc',
  },
  autoplayAllowLabel: {
    id: 'app.videoDock.autoplayAllowLabel',
  },
  nextPageLabel: {
    id: 'app.video.pagination.nextPage',
  },
  prevPageLabel: {
    id: 'app.video.pagination.prevPage',
  },
});

const findOptimalGrid = (canvasWidth, canvasHeight, gutter, aspectRatio, numItems, columns = 1) => {
  const rows = Math.ceil(numItems / columns);
  const gutterTotalWidth = (columns - 1) * gutter;
  const gutterTotalHeight = (rows - 1) * gutter;
  const usableWidth = canvasWidth - gutterTotalWidth;
  const usableHeight = canvasHeight - gutterTotalHeight;
  let cellWidth = Math.floor(usableWidth / columns);
  let cellHeight = Math.ceil(cellWidth / aspectRatio);
  if ((cellHeight * rows) > usableHeight) {
    cellHeight = Math.floor(usableHeight / rows);
    cellWidth = Math.ceil(cellHeight * aspectRatio);
  }
  return {
    columns,
    rows,
    width: (cellWidth * columns) + gutterTotalWidth,
    height: (cellHeight * rows) + gutterTotalHeight,
    filledArea: (cellWidth * cellHeight) * numItems,
  };
};

const ASPECT_RATIO = 4 / 3;

class VideoList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focusedId: false,
      optimalGrid: {
        cols: 1,
        rows: 1,
        filledArea: 0,
      },
      autoplayBlocked: false,
      mirroredCameras: [],
    };

    this.ticking = false;
    this.grid = null;
    this.canvas = null;
    this.failedMediaElements = [];
    this.handleCanvasResize = _.throttle(this.handleCanvasResize.bind(this), 66,
      {
        leading: true,
        trailing: true,
      });
    this.setOptimalGrid = this.setOptimalGrid.bind(this);
    this.handleAllowAutoplay = this.handleAllowAutoplay.bind(this);
    this.handlePlayElementFailed = this.handlePlayElementFailed.bind(this);
    this.autoplayWasHandled = false;
  }

  componentDidMount() {
    const { webcamDraggableDispatch } = this.props;
    webcamDraggableDispatch(
      {
        type: 'setVideoListRef',
        value: this.grid,
      },
    );

    this.handleCanvasResize();
    window.addEventListener('resize', this.handleCanvasResize, false);
    window.addEventListener('videoPlayFailed', this.handlePlayElementFailed);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleCanvasResize, false);
    window.removeEventListener('videoPlayFailed', this.handlePlayElementFailed);
  }

  setOptimalGrid() {
    const { streams } = this.props;
    let numItems = streams.length;
    if (numItems < 1 || !this.canvas || !this.grid) {
      return;
    }
    const { focusedId } = this.state;
    const { width: canvasWidth, height: canvasHeight } = this.canvas.getBoundingClientRect();

    const gridGutter = parseInt(window.getComputedStyle(this.grid)
      .getPropertyValue('grid-row-gap'), 10);
    const hasFocusedItem = numItems > 2 && focusedId;
    // Has a focused item so we need +3 cells
    if (hasFocusedItem) {
      numItems += 3;
    }
    const optimalGrid = _.range(1, numItems + 1)
      .reduce((currentGrid, col) => {
        const testGrid = findOptimalGrid(
          canvasWidth, canvasHeight, gridGutter,
          ASPECT_RATIO, numItems, col,
        );
        // We need a minimun of 2 rows and columns for the focused
        const focusedConstraint = hasFocusedItem ? testGrid.rows > 1 && testGrid.columns > 1 : true;
        const betterThanCurrent = testGrid.filledArea > currentGrid.filledArea;
        return focusedConstraint && betterThanCurrent ? testGrid : currentGrid;
      }, { filledArea: 0 });
    this.setState({
      optimalGrid,
    });
  }

  handleAllowAutoplay() {
    const { autoplayBlocked } = this.state;

    logger.info({
      logCode: 'video_provider_autoplay_allowed',
    }, 'Video media autoplay allowed by the user');

    this.autoplayWasHandled = true;
    window.removeEventListener('videoPlayFailed', this.handlePlayElementFailed);
    while (this.failedMediaElements.length) {
      const mediaElement = this.failedMediaElements.shift();
      if (mediaElement) {
        const played = playAndRetry(mediaElement);
        if (!played) {
          logger.error({
            logCode: 'video_provider_autoplay_handling_failed',
          }, 'Video autoplay handling failed to play media');
        } else {
          logger.info({
            logCode: 'video_provider_media_play_success',
          }, 'Video media played successfully');
        }
      }
    }
    if (autoplayBlocked) { this.setState({ autoplayBlocked: false }); }
  }

  handlePlayElementFailed(e) {
    const { mediaElement } = e.detail;
    const { autoplayBlocked } = this.state;

    e.stopPropagation();
    this.failedMediaElements.push(mediaElement);
    if (!autoplayBlocked && !this.autoplayWasHandled) {
      logger.info({
        logCode: 'video_provider_autoplay_prompt',
      }, 'Prompting user for action to play video media');
      this.setState({ autoplayBlocked: true });
    }
  }

  handleVideoFocus(id) {
    const { focusedId } = this.state;
    this.setState({
      focusedId: focusedId !== id ? id : false,
    }, this.handleCanvasResize);
    window.dispatchEvent(new Event('videoFocusChange'));
  }

  mirrorCamera(cameraId) {
    const { mirroredCameras } = this.state;
    if (this.cameraIsMirrored(cameraId)) {
      this.setState({
        mirroredCameras: mirroredCameras.filter(x => x != cameraId),
      });
    } else {
      this.setState({
        mirroredCameras: mirroredCameras.concat([cameraId]),
      });
    }
  }

  cameraIsMirrored(cameraId) {
    const { mirroredCameras } = this.state;
    return mirroredCameras.indexOf(cameraId) >= 0;
  }

  handleCanvasResize() {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.ticking = false;
        this.setOptimalGrid();
      });
    }
    this.ticking = true;
  }

  renderNextPageButton() {
    const { intl, numberOfPages, currentVideoPageIndex } = this.props;

    if (!VideoService.isPaginationEnabled() || numberOfPages <= 1) return null;

    const currentPage = currentVideoPageIndex + 1;
    const nextPageLabel = intl.formatMessage(intlMessages.nextPageLabel);
    const nextPageDetailedLabel = `${nextPageLabel} (${currentPage}/${numberOfPages})`;

    return (
      <Button
        role="button"
        aria-label={nextPageLabel}
        color="primary"
        icon="right_arrow"
        size="md"
        onClick={VideoService.getNextVideoPage}
        label={nextPageDetailedLabel}
        hideLabel
        className={cx(styles.nextPage)}
      />
    );
  }

  renderPreviousPageButton() {
    const { intl, currentVideoPageIndex, numberOfPages } = this.props;

    if (!VideoService.isPaginationEnabled() || numberOfPages <= 1) return null;

    const currentPage = currentVideoPageIndex + 1;
    const prevPageLabel = intl.formatMessage(intlMessages.prevPageLabel);
    const prevPageDetailedLabel = `${prevPageLabel} (${currentPage}/${numberOfPages})`;

    return (
      <Button
        role="button"
        aria-label={prevPageLabel}
        color="primary"
        icon="left_arrow"
        size="md"
        onClick={VideoService.getPreviousVideoPage}
        label={prevPageDetailedLabel}
        hideLabel
        className={cx(styles.previousPage)}
      />
    );
  }

  renderVideoList() {
    const {
      intl,
      streams,
      onMount,
      swapLayout,
    } = this.props;
    const { focusedId } = this.state;

    const numOfStreams = streams.length;
    return streams.map((stream) => {
      const { cameraId, userId, name } = stream;
      const isFocused = focusedId === cameraId;
      const isFocusedIntlKey = !isFocused ? 'focus' : 'unfocus';
      const isMirrored = this.cameraIsMirrored(cameraId);
      let actions = [{
        label: intl.formatMessage(intlMessages['mirrorLabel']),
        description: intl.formatMessage(intlMessages['mirrorDesc']),
        onClick: () => this.mirrorCamera(cameraId),
      }];

      if (numOfStreams > 2) {
        actions.push({
          label: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Label`]),
          description: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Desc`]),
          onClick: () => this.handleVideoFocus(cameraId),
        });
      }

      return (
        <div
          key={cameraId}
          className={cx({
            [styles.videoListItem]: true,
            [styles.focused]: focusedId === cameraId && numOfStreams > 2,
          })}
        >
          <VideoListItemContainer
            numOfStreams={numOfStreams}
            cameraId={cameraId}
            userId={userId}
            name={name}
            mirrored={isMirrored}
            actions={actions}
            onMount={(videoRef) => {
              this.handleCanvasResize();
              onMount(cameraId, videoRef);
            }}
            swapLayout={swapLayout}
          />
        </div>
      );
    });
  }

  render() {
    const { streams, intl } = this.props;
    const { optimalGrid, autoplayBlocked } = this.state;

    const canvasClassName = cx({
      [styles.videoCanvas]: true,
    });

    const videoListClassName = cx({
      [styles.videoList]: true,
    });

    return (
      <div
        ref={(ref) => {
          this.canvas = ref;
        }}
        className={canvasClassName}
      >

        {this.renderPreviousPageButton()}

        {!streams.length ? null : (
          <div
            ref={(ref) => {
              this.grid = ref;
            }}
            className={videoListClassName}
            style={{
              width: `${optimalGrid.width}px`,
              height: `${optimalGrid.height}px`,
              gridTemplateColumns: `repeat(${optimalGrid.columns}, 1fr)`,
              gridTemplateRows: `repeat(${optimalGrid.rows}, 1fr)`,
            }}
          >
            {this.renderVideoList()}
          </div>
        )}
        { !autoplayBlocked ? null : (
          <AutoplayOverlay
            autoplayBlockedDesc={intl.formatMessage(intlMessages.autoplayBlockedDesc)}
            autoplayAllowLabel={intl.formatMessage(intlMessages.autoplayAllowLabel)}
            handleAllowAutoplay={this.handleAllowAutoplay}
          />
        )}

        {this.renderNextPageButton()}

      </div>
    );
  }
}

VideoList.propTypes = propTypes;

export default injectIntl(withDraggableConsumer(VideoList));
