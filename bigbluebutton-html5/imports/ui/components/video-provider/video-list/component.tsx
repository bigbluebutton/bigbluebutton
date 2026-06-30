import React, { Component } from 'react';
import { IntlShape, defineMessages, injectIntl } from 'react-intl';
import { UpdatedDataForUserCameraDomElement } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/user-camera/types';
import { throttle } from '/imports/utils/throttle';
import { range } from '/imports/utils/array-utils';
import deviceInfo from '/imports/utils/deviceInfo';
import Styled from './styles';
import VideoListItemContainer from './video-list-item/container';
import OverflowTile from './overflow-tile/component';
import AutoplayOverlay from '/imports/ui/components/media/autoplay-overlay/component';
import logger from '/imports/startup/client/logger';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import VideoService from '/imports/ui/components/video-provider/service';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import { Output } from '/imports/ui/components/layout/layoutTypes';
import { VideoItem } from '/imports/ui/components/video-provider/types';
import { VIDEO_TYPES } from '/imports/ui/components/video-provider/enums';
import { UserCameraHelperAreas } from '../../plugins-engine/extensible-areas/components/user-camera-helper/types';

const intlMessages = defineMessages({
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
  pageLabel: {
    id: 'app.video.pagination.page',
  },
  pageOfLabel: {
    id: 'app.video.pagination.pageOf',
  },
});

declare global {
  interface WindowEventMap {
    'videoPlayFailed': CustomEvent<{ mediaElement: HTMLVideoElement }>;
  }
}

const findOptimalGrid = (
  canvasWidth: number,
  canvasHeight: number,
  gutter: number,
  aspectRatio: number,
  numItems: number,
  columns = 1,
) => {
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
const MOBILE_MAX_DOTS = 10;
const MOBILE_SWIPE_THRESHOLD = 50;
const MOBILE_PAGE_ANIM_MS = 220;
const MOBILE_PAGE_ANIM_OFFSET = 24;
// const ACTION_NAME_BACKGROUND = 'blurBackground';

interface VideoListProps {
  pluginUserCameraHelperPerPosition: UserCameraHelperAreas;
  layoutType: string;
  layoutContextDispatch: (...args: unknown[]) => void;
  numberOfPages: number;
  currentVideoPageIndex: number;
  cameraDock: Output['cameraDock'];
  focusedId: string;
  handleVideoFocus: (id: string) => void;
  isGridEnabled: boolean;
  overflowCount: number;
  streams: VideoItem[];
  intl: IntlShape;
  setUserCamerasRequestedFromPlugin: React.Dispatch<React.SetStateAction<UpdatedDataForUserCameraDomElement[]>>;
  onVideoItemMount: (stream: string, video: HTMLVideoElement) => void;
  onVideoItemUnmount: (stream: string) => void;
  onVirtualBgDrop: (stream: string, type: string, name: string, data: string) => Promise<unknown>;
  gridSize: number;
}

interface VideoListState {
  optimalGrid: {
    rows: number,
    filledArea: number,
    width: number;
    height: number;
    columns: number;
  },
  autoplayBlocked: boolean,
}

class VideoList extends Component<VideoListProps, VideoListState> {
  private ticking: boolean;

  private grid: HTMLDivElement | null;

  private canvas: HTMLDivElement | null;

  private failedMediaElements: unknown[];

  private autoplayWasHandled: boolean;

  private touchStartX: number | null;

  private touchStartY: number | null;

  constructor(props: VideoListProps) {
    super(props);

    this.state = {
      optimalGrid: {
        rows: 1,
        filledArea: 0,
        columns: 0,
        height: 0,
        width: 0,
      },
      autoplayBlocked: false,
    };

    this.ticking = false;
    this.grid = null;
    this.canvas = null;
    this.failedMediaElements = [];
    this.handleCanvasResize = throttle(this.handleCanvasResize.bind(this), 66,
      {
        leading: true,
        trailing: true,
      });
    this.setOptimalGrid = this.setOptimalGrid.bind(this);
    this.handleAllowAutoplay = this.handleAllowAutoplay.bind(this);
    this.handlePlayElementFailed = this.handlePlayElementFailed.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.autoplayWasHandled = false;
    this.touchStartX = null;
    this.touchStartY = null;
  }

  componentDidMount() {
    this.handleCanvasResize();
    window.addEventListener('resize', this.handleCanvasResize, false);
    window.addEventListener('videoPlayFailed', this.handlePlayElementFailed);
  }

  componentDidUpdate(prevProps: VideoListProps) {
    const {
      layoutType, cameraDock, streams, focusedId, numberOfPages, currentVideoPageIndex,
    } = this.props;
    const { width: cameraDockWidth, height: cameraDockHeight } = cameraDock;
    const {
      layoutType: prevLayoutType,
      cameraDock: prevCameraDock,
      streams: prevStreams,
      focusedId: prevFocusedId,
      numberOfPages: prevNumberOfPages,
      currentVideoPageIndex: prevVideoPageIndex,
    } = prevProps;
    const { width: prevCameraDockWidth, height: prevCameraDockHeight } = prevCameraDock;

    if (layoutType !== prevLayoutType
      || focusedId !== prevFocusedId
      || cameraDockWidth !== prevCameraDockWidth
      || cameraDockHeight !== prevCameraDockHeight
      || numberOfPages !== prevNumberOfPages
      || streams.length !== prevStreams.length) {
      this.handleCanvasResize();
    }

    if (deviceInfo.isMobile
      && numberOfPages > 1
      && currentVideoPageIndex !== prevVideoPageIndex) {
      this.playPageTransition(prevVideoPageIndex);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleCanvasResize, false);
    window.removeEventListener('videoPlayFailed', this.handlePlayElementFailed);
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

  handlePlayElementFailed(e: CustomEvent<{ mediaElement: HTMLVideoElement }>) {
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

  handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (e.touches.length !== 1) {
      this.touchStartX = null;
      this.touchStartY = null;
      return;
    }
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    const { numberOfPages } = this.props;

    if (this.touchStartX === null || this.touchStartY === null) return;
    if (numberOfPages <= 1) {
      this.touchStartX = null;
      this.touchStartY = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    this.touchStartX = null;
    this.touchStartY = null;

    if (Math.abs(deltaX) < MOBILE_SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      VideoService.getNextVideoPage();
    } else {
      VideoService.getPreviousVideoPage();
    }
  }

  playPageTransition(prevIndex: number) {
    const { currentVideoPageIndex, numberOfPages } = this.props;

    if (!this.grid || typeof this.grid.animate !== 'function') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const forward = currentVideoPageIndex === (prevIndex + 1) % numberOfPages;
    const backward = currentVideoPageIndex === (((prevIndex - 1) % numberOfPages) + numberOfPages) % numberOfPages;
    let isNext: boolean;
    if (forward) {
      isNext = true;
    } else if (backward) {
      isNext = false;
    } else {
      isNext = currentVideoPageIndex > prevIndex;
    }

    const fromX = isNext ? MOBILE_PAGE_ANIM_OFFSET : -MOBILE_PAGE_ANIM_OFFSET;

    this.grid.animate(
      [
        { opacity: 0, transform: `translateX(${fromX}px)` },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      { duration: MOBILE_PAGE_ANIM_MS, easing: 'ease-out' },
    );
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

  setOptimalGrid() {
    const {
      streams,
      cameraDock,
      layoutContextDispatch,
      isGridEnabled,
      gridSize,
    } = this.props;
    const visibleStreams = streams.filter(
      (item) => item.type === VIDEO_TYPES.GRID || !('render' in item) || item.render !== false,
    );
    let numItems = isGridEnabled
      ? Math.min(gridSize, visibleStreams.length)
      : visibleStreams.length;

    if (numItems < 1 || !this.canvas || !this.grid) {
      return;
    }
    const { focusedId } = this.props;
    const canvasWidth = cameraDock?.width;
    const canvasHeight = cameraDock?.height;

    const gridGutter = parseInt(window.getComputedStyle(this.grid)
      .getPropertyValue('grid-row-gap'), 10);

    const hasFocusedItem = visibleStreams.filter(
      (s) => s.type !== VIDEO_TYPES.GRID && s.stream === focusedId,
    ).length && numItems > 2;

    // Has a focused item so we need +3 cells
    if (hasFocusedItem) {
      numItems += 3;
    }
    const optimalGrid = range(1, numItems + 1)
      .reduce((currentGrid, col) => {
        const testGrid = findOptimalGrid(
          canvasWidth, canvasHeight, gridGutter,
          ASPECT_RATIO, numItems, col,
        );
        // We need a minimum of 2 rows and columns for the focused
        const focusedConstraint = hasFocusedItem ? testGrid.rows > 1 && testGrid.columns > 1 : true;
        const betterThanCurrent = testGrid.filledArea > currentGrid.filledArea;
        return focusedConstraint && betterThanCurrent ? testGrid : currentGrid;
      }, { filledArea: 0 } as {
        columns: number;
        rows: number;
        width: number;
        height: number;
        filledArea: number;
    });
    layoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_OPTIMAL_GRID_SIZE,
      value: {
        width: optimalGrid.width,
        height: optimalGrid.height,
      },
    });
    this.setState({
      optimalGrid,
    });
  }

  displayPageButtons() {
    const { numberOfPages, cameraDock } = this.props;
    const { width: cameraDockWidth } = cameraDock;

    if (!VideoService.isPaginationEnabled() || numberOfPages <= 1 || cameraDockWidth === 0) {
      return false;
    }

    return true;
  }

  renderNextPageButton() {
    const {
      intl,
      numberOfPages,
      currentVideoPageIndex,
      cameraDock,
    } = this.props;
    const { position } = cameraDock;

    if (!this.displayPageButtons()) return null;

    const currentPage = currentVideoPageIndex + 1;
    const nextPageLabel = intl.formatMessage(intlMessages.nextPageLabel);
    const nextPageDetailedLabel = `${nextPageLabel} (${currentPage}/${numberOfPages})`;

    return (
      <Styled.NextPageButton
        role="button"
        aria-label={nextPageLabel}
        color="primary"
        icon="right_arrow"
        size="md"
        onClick={VideoService.getNextVideoPage}
        label={nextPageDetailedLabel}
        hideLabel
        position={position}
        data-test="nextPageVideoPaginationBtn"
      />
    );
  }

  renderPreviousPageButton() {
    const {
      intl,
      currentVideoPageIndex,
      numberOfPages,
      cameraDock,
    } = this.props;
    const { position } = cameraDock;

    if (!this.displayPageButtons()) return null;

    const currentPage = currentVideoPageIndex + 1;
    const prevPageLabel = intl.formatMessage(intlMessages.prevPageLabel);
    const prevPageDetailedLabel = `${prevPageLabel} (${currentPage}/${numberOfPages})`;

    return (
      <Styled.PreviousPageButton
        role="button"
        aria-label={prevPageLabel}
        color="primary"
        icon="left_arrow"
        size="md"
        onClick={VideoService.getPreviousVideoPage}
        label={prevPageDetailedLabel}
        hideLabel
        position={position}
        data-test="previousPageVideoPaginationBtn"
      />
    );
  }

  renderVideoList() {
    const {
      streams,
      onVirtualBgDrop,
      onVideoItemMount,
      onVideoItemUnmount,
      handleVideoFocus,
      setUserCamerasRequestedFromPlugin,
      focusedId,
      pluginUserCameraHelperPerPosition,
      isGridEnabled,
      overflowCount,
      gridSize,
    } = this.props;
    const numOfStreams = streams.filter(
      (item) => item.type === VIDEO_TYPES.GRID || !('render' in item) || item.render !== false,
    ).length;

    const shouldShowOverflowTile = isGridEnabled && overflowCount > 0;

    const streamsToHide = (numOfStreams - gridSize + 1) * -1;
    const streamsToRender = shouldShowOverflowTile && streamsToHide < 0
      ? streams.slice(0, streamsToHide)
      : streams;

    const videoItems = streamsToRender.map((item) => {
      const { userId, name } = item;
      const isStream = item.type !== VIDEO_TYPES.GRID;
      const stream = isStream ? item.stream : null;
      const key = isStream ? stream : userId;
      const isFocused = isStream && focusedId === stream && numOfStreams > 2;
      const shouldRender = item.type === VIDEO_TYPES.GRID || !('render' in item) || item.render !== false;

      if (!shouldRender) return null;

      return (
        <Styled.VideoListItem
          key={key}
          $focused={isFocused}
          data-test="webcamVideoItem"
        >
          <VideoListItemContainer
            pluginUserCameraHelperPerPosition={pluginUserCameraHelperPerPosition}
            numOfStreams={numOfStreams}
            cameraId={stream}
            userId={userId}
            name={name}
            focused={isFocused}
            isStream={isStream}
            setUserCamerasRequestedFromPlugin={setUserCamerasRequestedFromPlugin}
            onHandleVideoFocus={isStream ? handleVideoFocus : null}
            onVideoItemMount={(videoRef) => {
              this.handleCanvasResize();
              if (isStream) onVideoItemMount(item.stream, videoRef);
            }}
            stream={item}
            onVideoItemUnmount={onVideoItemUnmount}
            onVirtualBgDrop={
              (type, name, data) => {
                return isStream ? onVirtualBgDrop(item.stream, type, name, data) : Promise.resolve(null);
              }
            }
          />
        </Styled.VideoListItem>
      );
    });

    if (shouldShowOverflowTile) {
      videoItems.push(
        <Styled.VideoListItem
          key="overflow-tile"
          $focused={false}
          data-test="overflowTile"
        >
          <OverflowTile overflowCount={overflowCount} />
        </Styled.VideoListItem>,
      );
    }

    return videoItems;
  }

  renderPaginationBar() {
    const {
      intl,
      numberOfPages,
      currentVideoPageIndex,
      cameraDock,
      isGridEnabled,
    } = this.props;
    const { optimalGrid } = this.state;

    if (numberOfPages <= 1 || cameraDock.width === 0) return null;

    const currentPage = currentVideoPageIndex + 1;
    const prevPageLabel = intl.formatMessage(intlMessages.prevPageLabel);
    const nextPageLabel = intl.formatMessage(intlMessages.nextPageLabel);
    const useDots = numberOfPages <= MOBILE_MAX_DOTS;

    const barTop = isGridEnabled
      ? `min(calc(50% + ${optimalGrid.height / 2}px + 0.5rem), calc(100% - 22px))`
      : 'calc(100% + 0.5rem)';

    return (
      <Styled.PaginationBar
        style={{ top: barTop }}
        data-test="mobilePaginationBar"
      >
        <Styled.PaginationArrow
          role="button"
          aria-label={prevPageLabel}
          color="primary"
          icon="left_arrow"
          size="sm"
          hideLabel
          label={prevPageLabel}
          onClick={VideoService.getPreviousVideoPage}
          data-test="mobilePrevPageBtn"
        />
        {useDots ? (
          <Styled.PaginationDots>
            {range(0, numberOfPages).map((page) => (
              <Styled.PaginationDot
                key={`page-dot-${page}`}
                type="button"
                $active={page === currentVideoPageIndex}
                aria-current={page === currentVideoPageIndex}
                aria-label={intl.formatMessage(intlMessages.pageLabel, { 0: page + 1 })}
                onClick={() => VideoService.setVideoPage(page)}
                data-test="mobilePageDot"
              />
            ))}
          </Styled.PaginationDots>
        ) : (
          <Styled.PaginationCounter data-test="mobilePageCounter">
            {intl.formatMessage(intlMessages.pageOfLabel, { 0: currentPage, 1: numberOfPages })}
          </Styled.PaginationCounter>
        )}
        <Styled.PaginationArrow
          role="button"
          aria-label={nextPageLabel}
          color="primary"
          icon="right_arrow"
          size="sm"
          hideLabel
          label={nextPageLabel}
          onClick={VideoService.getNextVideoPage}
          data-test="mobileNextPageBtn"
        />
      </Styled.PaginationBar>
    );
  }

  render() {
    const {
      streams,
      intl,
      cameraDock,
      isGridEnabled,
    } = this.props;
    const { optimalGrid, autoplayBlocked } = this.state;
    const { position } = cameraDock;
    const isMobile = deviceInfo.isMobile;

    return (
      <Styled.VideoCanvas
        $position={position}
        ref={(ref) => {
          this.canvas = ref;
        }}
        style={{
          minHeight: 'inherit',
        }}
        onTouchStart={isMobile ? this.handleTouchStart : undefined}
        onTouchEnd={isMobile ? this.handleTouchEnd : undefined}
      >
        {!isMobile && this.renderPreviousPageButton()}

        {!streams.length && !isGridEnabled ? null : (
          <Styled.VideoList
            ref={(ref) => {
              this.grid = ref;
            }}
            style={{
              width: `${optimalGrid.width}px`,
              height: `${optimalGrid.height}px`,
              gridTemplateColumns: `repeat(${optimalGrid.columns}, 1fr)`,
              gridTemplateRows: `repeat(${optimalGrid.rows}, 1fr)`,
            }}
            className="video-provider_list"
          >
            {this.renderVideoList()}
          </Styled.VideoList>
        )}
        {!autoplayBlocked ? null : (
          <AutoplayOverlay
            autoplayBlockedDesc={intl.formatMessage(intlMessages.autoplayBlockedDesc)}
            autoplayAllowLabel={intl.formatMessage(intlMessages.autoplayAllowLabel)}
            handleAllowAutoplay={this.handleAllowAutoplay}
          />
        )}

        {isMobile && this.renderPaginationBar()}

        {
          !isMobile && (position === 'contentRight' || position === 'contentLeft')
          && <Styled.Break />
        }

        {!isMobile && this.renderNextPageButton()}
      </Styled.VideoCanvas>
    );
  }
}

export default injectIntl(VideoList);
