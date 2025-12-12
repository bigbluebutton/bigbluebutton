import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import { IntlShape, defineMessages, injectIntl } from 'react-intl';
import { UpdatedDataForUserCameraDomElement } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/user-camera/types';
import { throttle } from '/imports/utils/throttle';
import { range } from '/imports/utils/array-utils';
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
  setScreenshareAsContentHint: {
    id: 'app.screenshare.setAsContentHover',
    defaultMessage: 'Click to set your screenshare as content',
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

const ASPECT_RATIO = 16 / 9;
const CONTENT_ROW_SPAN = 2;
const CONTENT_HEIGHT_RATIO = 0.75;
// const ACTION_NAME_BACKGROUND = 'blurBackground';

interface VideoListProps {
  pluginUserCameraHelperPerPosition: UserCameraHelperAreas;
  layoutType: string;
  layoutContextDispatch: (...args: unknown[]) => void;
  onSetStreamAsContent: (streamId: string, showAsContent: boolean) => void;
  numberOfPages: number;
  currentVideoPageIndex: number;
  cameraDock: Output['cameraDock'];
  focusedId: string;
  handleVideoFocus: (id: string) => void;
  isGridEnabled: boolean;
  overflowCount: number;
  streams: VideoItem[];
  currentUserId: string;
  isCurrentUserPresenter: boolean;
  intl: IntlShape;
  setUserCamerasRequestedFromPlugin: React.Dispatch<React.SetStateAction<UpdatedDataForUserCameraDomElement[]>>;
  onVideoItemMount: (stream: string, video: HTMLVideoElement) => void;
  onVideoItemUnmount: (stream: string) => void;
  onVirtualBgDrop: (stream: string, type: string, name: string, data: string) => Promise<unknown>;
  screenShare: boolean;
  isPresentationAvailable: boolean;
  viewersCanSeeViewersScreenShares: boolean;
}

interface VideoListState {
  optimalGrid: {
    rows: number,
    filledArea: number,
    width: number;
    height: number;
    columns: number;
  },
  aspectRatio: number,
  autoplayBlocked: boolean,
  contentHeight: number,
  peekedStream: VideoItem | null,
}

class VideoList extends Component<VideoListProps, VideoListState> {
  private ticking: boolean;

  private grid: HTMLDivElement | null;

  private canvas: HTMLDivElement | null;

  private failedMediaElements: unknown[];

  private autoplayWasHandled: boolean;

  private presentationOverlayHost: HTMLElement | null;

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
      aspectRatio: this.props.screenShare ? 16 / 9 : 4 / 3,
      autoplayBlocked: false,
      contentHeight: 0,
      peekedStream: null,
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
    this.handleOpenPeek = this.handleOpenPeek.bind(this);
    this.handleClosePeek = this.handleClosePeek.bind(this);
    this.autoplayWasHandled = false;
    this.presentationOverlayHost = null;
  }

  componentDidMount() {
    this.handleCanvasResize();
    window.addEventListener('resize', this.handleCanvasResize, false);
    window.addEventListener('videoPlayFailed', this.handlePlayElementFailed);
  }

  componentDidUpdate(prevProps: VideoListProps) {
    const {
      layoutType, cameraDock, streams, focusedId, isPresentationAvailable,
    } = this.props;
    const { peekedStream } = this.state;
    const { width: cameraDockWidth, height: cameraDockHeight } = cameraDock;
    const contentStreamId = streams.find((s) => s.contentType === 'screenshare'
      && (s as any).showAsContent)?.stream;
    const prevContentStreamId = prevProps.streams.find((s) => s.contentType === 'screenshare'
      && (s as any).showAsContent)?.stream;
    const allowPeek = isPresentationAvailable || !!contentStreamId;
    const {
      layoutType: prevLayoutType,
      cameraDock: prevCameraDock,
      streams: prevStreams,
      focusedId: prevFocusedId,
    } = prevProps;
    const { width: prevCameraDockWidth, height: prevCameraDockHeight } = prevCameraDock;

    if (layoutType !== prevLayoutType
      || focusedId !== prevFocusedId
      || cameraDockWidth !== prevCameraDockWidth
      || cameraDockHeight !== prevCameraDockHeight
      || streams.length !== prevStreams.length
      || contentStreamId !== prevContentStreamId) {
      this.handleCanvasResize();
    }

    if (peekedStream && (!allowPeek || !streams.find((s) => s.contentType === 'screenshare'
      && (s as any).stream === (peekedStream as any).stream))) {
      this.handleClosePeek();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleCanvasResize, false);
    window.removeEventListener('videoPlayFailed', this.handlePlayElementFailed);
    this.teardownPresentationOverlay();
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

  handleOpenPeek(stream: VideoItem) {
    const { streams, isPresentationAvailable } = this.props;
    this.setState({ peekedStream: '' });
    const hasStreamAsContent = streams.filter((s) => s.contentType === 'screenshare').find((s) => (s as any).showAsContent);
    if (!hasStreamAsContent && !isPresentationAvailable) return;
    setTimeout(() => {
      this.setState({ peekedStream: stream });
    }, 0);
  }

  handleClosePeek() {
    this.setState({ peekedStream: null });
    this.teardownPresentationOverlay();
  }

  mountPresentationOverlay(): HTMLElement | null {
    const presentationArea = document.getElementById('presentationInnerWrapper');
    if (!presentationArea) {
      this.teardownPresentationOverlay();
      return null;
    }

    if (!this.presentationOverlayHost) {
      this.presentationOverlayHost = document.createElement('div');
      this.presentationOverlayHost.style.position = 'absolute';
      this.presentationOverlayHost.style.inset = '0';
      this.presentationOverlayHost.style.pointerEvents = 'auto';
      this.presentationOverlayHost.style.zIndex = '1200';
      this.presentationOverlayHost.style.display = 'flex';
      this.presentationOverlayHost.style.alignItems = 'center';
      this.presentationOverlayHost.style.justifyContent = 'center';
      presentationArea.appendChild(this.presentationOverlayHost);
    }

    return this.presentationOverlayHost;
  }

  teardownPresentationOverlay(): void {
    if (this.presentationOverlayHost?.parentNode) {
      this.presentationOverlayHost.parentNode.removeChild(this.presentationOverlayHost);
    }
    this.presentationOverlayHost = null;
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
    } = this.props;
    const visibleStreams = streams.filter(
      (item) => item.type === VIDEO_TYPES.GRID || !('render' in item) || item.render !== false,
    );
    let numItems = visibleStreams.length;

    const {
      aspectRatio,
    } = this.state;

    if (streams.length < 1 || !this.canvas || !this.grid) {
      return;
    }
    const { focusedId } = this.props;
    const canvasWidth = cameraDock?.width;
    const canvasHeight = cameraDock?.height;

    const gridGutter = parseInt(window.getComputedStyle(this.grid)
      .getPropertyValue('grid-row-gap'), 10);

    const contentStream = streams.find(
      (s) => s.type !== VIDEO_TYPES.GRID && (s as any).showAsContent,
    );
    const hasContentStream = !!contentStream;
    const nonContentStreams = hasContentStream
      ? streams.filter((s) => s !== contentStream)
      : streams;

    const hasFocusedItem = streams.filter(
      (s) => s.type !== VIDEO_TYPES.GRID && s.stream === focusedId,
    ).length && streams.length > 2;
    const isContentFocused = hasContentStream && contentStream?.stream === focusedId;
    const shouldGrowFocused = hasFocusedItem && !isContentFocused;
    const focusCells = shouldGrowFocused ? 3 : 0;

    const columnRangeLimit = hasContentStream
      ? Math.max(nonContentStreams.length + focusCells, 1) + 1
      : streams.length + focusCells + 1;

    const targetContentHeight = hasContentStream
      ? Math.max(Math.floor(canvasHeight * CONTENT_HEIGHT_RATIO), 0)
      : 0;

    const availableHeightForGrid = hasContentStream
      ? Math.max(canvasHeight - targetContentHeight - gridGutter, Math.floor(canvasHeight * 0.1))
      : canvasHeight;

    const optimalGrid = range(1, columnRangeLimit)
      .reduce((currentGrid, col) => {
        let numItems = hasContentStream
          ? nonContentStreams.length
          : streams.length;

        if (shouldGrowFocused) {
          numItems += 3;
        }

        const testGrid = findOptimalGrid(
          canvasWidth, availableHeightForGrid, gridGutter,
          aspectRatio, numItems, col,
        );
        // We need a minimum of 2 rows and columns for the focused
        const focusedConstraint = shouldGrowFocused ? testGrid.rows > 1 && testGrid.columns > 1 : true;
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
        height: hasContentStream
          ? Math.max(optimalGrid.height + targetContentHeight + gridGutter, canvasHeight)
          : optimalGrid.height,
      },
    });
    this.setState({
      optimalGrid,
      contentHeight: hasContentStream ? targetContentHeight : 0,
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
      onSetStreamAsContent,
      setUserCamerasRequestedFromPlugin,
      focusedId,
      pluginUserCameraHelperPerPosition,
      screenShare,
      currentUserId,
      isCurrentUserPresenter,
      intl,
      isPresentationAvailable,
      viewersCanSeeViewersScreenShares,
    } = this.props;
    const contentStream = streams.find((stream) => stream.type !== VIDEO_TYPES.GRID
      && (stream as any).showAsContent);
    const allowPeek = isPresentationAvailable || !!contentStream;
    const nonContentStreams = contentStream
      ? streams.filter((stream) => stream !== contentStream)
      : streams;
    const numOfStreams = streams.length;

    const renderItem = (item: VideoItem, isContentStream?: boolean) => {
      const { userId, name } = item;
      const isStream = item.type !== VIDEO_TYPES.GRID;
      const stream = isStream ? item.stream : null;
      const key = isStream ? stream : userId;
      const isContent = isContentStream || (isStream && (item as any).showAsContent);
      const isFocused = isStream && focusedId === stream && numOfStreams > 2;
      const contentType = (item as any).contentType;
      const isOwnScreenshare = isStream && contentType === 'screenshare'
        && userId === currentUserId;
      const showSetAsContentHint = isOwnScreenshare && isCurrentUserPresenter && !isContent;
      const setAsContentHint = showSetAsContentHint
        ? intl.formatMessage(intlMessages.setScreenshareAsContentHint)
        : undefined;

      return (
        <Styled.VideoListItem
          key={key}
          $focused={isFocused}
          $isContent={isContent}
          $contentRowSpan={CONTENT_ROW_SPAN}
          data-test="webcamVideoItem"
          title={setAsContentHint}
          onClick={() => {
            if (isStream && contentType === 'screenshare' && !(item as any).showAsContent) {
              if (isOwnScreenshare && isCurrentUserPresenter && stream) {
                onSetStreamAsContent(stream, true);
              } else if (allowPeek) {
                this.handleOpenPeek(item);
              }
            }
          }}
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
            screenShare={screenShare}
            viewersCanSeeViewersScreenShares={viewersCanSeeViewersScreenShares}
            onPeek={contentType === 'screenshare' && isStream && !(item as any).showAsContent && allowPeek
              ? () => this.handleOpenPeek(item)
              : undefined}
            setAsContentHint={setAsContentHint}
          />
        </Styled.VideoListItem>
      );
    };

    return {
      gridItems: nonContentStreams.map((item) => renderItem(item, false)),
      contentItem: contentStream ? renderItem(contentStream, true) : null,
    };
  }

  render() {
    const {
      streams,
      intl,
      cameraDock,
      isGridEnabled,
    } = this.props;
    const { optimalGrid, autoplayBlocked, contentHeight, peekedStream } = this.state;
    const { position } = cameraDock;
    const shouldOverlayPresentation = !!peekedStream;

    const { gridItems, contentItem } = this.renderVideoList();

    return (
      <>
        <Styled.VideoCanvas
          $position={position}
          $hasContent={contentHeight > 0}
          ref={(ref) => {
            this.canvas = ref;
          }}
          style={{
            minHeight: 'inherit',
          }}
        >
          {this.renderPreviousPageButton()}

          {!streams.length && !isGridEnabled ? null : (
            <>
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
                {gridItems}
              </Styled.VideoList>
              {contentHeight > 0 && contentItem && (
                <Styled.ContentWrapper
                  style={{
                    width: `${cameraDock?.width}px`,
                    height: `${contentHeight}px`,
                  }}
                >
                  {contentItem}
                </Styled.ContentWrapper>
              )}
            </>
          )}
          {peekedStream && this.renderPeekOverlay(
            peekedStream as VideoItem,
            shouldOverlayPresentation,
          )}
          {!autoplayBlocked ? null : (
            <AutoplayOverlay
              autoplayBlockedDesc={intl.formatMessage(intlMessages.autoplayBlockedDesc)}
              autoplayAllowLabel={intl.formatMessage(intlMessages.autoplayAllowLabel)}
              handleAllowAutoplay={this.handleAllowAutoplay}
            />
          )}

          {
            (position === 'contentRight' || position === 'contentLeft')
            && <Styled.Break />
          }

          {this.renderNextPageButton()}
        </Styled.VideoCanvas>
      </>
    );
  }

  renderPeekOverlay(
    stream: VideoItem,
    usePresentationOverlay: boolean,
  ) {
    const {
      onVideoItemMount,
      onVideoItemUnmount,
      onVirtualBgDrop,
      setUserCamerasRequestedFromPlugin,
      pluginUserCameraHelperPerPosition,
      handleVideoFocus,
      streams,
    } = this.props;

    const isStream = stream.type !== VIDEO_TYPES.GRID;
    if (!isStream) return null;

    const streamId = (stream as any).stream;
    const userId = (stream as any).userId;
    const name = (stream as any).name;
    const isContent = (stream as any).showAsContent ?? false;
    const contentType = (stream as any).contentType;
    const numOfStreams = streams.length;

    const overlay = (
      <Styled.PeekOverlay
        onClick={this.handleClosePeek}
      >
        <Styled.PeekCard presentation={this.presentationOverlayHost} onClick={(e) => e.stopPropagation()}>
          <Styled.PeekCloseButton
            icon="close"
            label="Close peek overlay"
            hideLabel
            circle
            size="md"
            onClick={this.handleClosePeek}
            data-test="closePeekOverlay"
          />
          <VideoListItemContainer
            pluginUserCameraHelperPerPosition={pluginUserCameraHelperPerPosition}
            numOfStreams={numOfStreams}
            cameraId={streamId}
            userId={userId}
            name={name}
            focused={false}
            isStream
            onHandleVideoFocus={handleVideoFocus}
            onVideoItemMount={(videoRef) => onVideoItemMount(streamId, videoRef)}
            onVideoItemUnmount={() => onVideoItemUnmount(streamId)}
            onVirtualBgDrop={(type, dropName, data) => onVirtualBgDrop(streamId, type, dropName, data)}
            setUserCamerasRequestedFromPlugin={setUserCamerasRequestedFromPlugin}
            stream={stream}
            screenShare
            contentType={contentType}
            isContent={isContent}
          />
        </Styled.PeekCard>
      </Styled.PeekOverlay>
    );

    if (usePresentationOverlay) {
      const host = this.mountPresentationOverlay();
      if (host) {
        return createPortal(overlay, host);
      }
    }

    this.teardownPresentationOverlay();
    return overlay;
  }
}

export default injectIntl(VideoList);
