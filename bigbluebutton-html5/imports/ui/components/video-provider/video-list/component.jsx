import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import cx from 'classnames';
import { styles } from './styles';
import VideoListItem from './video-list-item/component';

const propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  onMount: PropTypes.func.isRequired,
  onUnmount: PropTypes.func.isRequired,
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
});

// See: https://stackoverflow.com/a/3513565
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
    };

    this.ticking = false;
    this.grid = null;
    this.canvas = null;
    this.handleCanvasResize = _.throttle(this.handleCanvasResize.bind(this), 66);
    this.setOptimalGrid = this.setOptimalGrid.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleCanvasResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleCanvasResize, false);
  }

  setOptimalGrid() {
    let numItems = this.props.users.length;

    if (numItems < 1) {
      return;
    }

    const { focusedId } = this.state;
    const aspectRatio = 16 / 9;
    const { width: canvasWidth, height: canvasHeight } = this.canvas.getBoundingClientRect();
    const gridGutter = parseInt(window.getComputedStyle(this.grid).getPropertyValue('grid-row-gap'), 10);

    // Has a focused item so we need +3 cells
    if (numItems > 2 && focusedId) {
      numItems += 3;
    }

    const optimalGrid = _.range(1, numItems + 1).reduce((currentGrid, col) => {
      const testGrid = findOptimalGrid(
        canvasWidth, canvasHeight, gridGutter,
        aspectRatio, numItems, col,
      );

      // We need a minimun of 2 rows and columns for the focused
      const focusedConstraint = focusedId ? testGrid.rows > 1 && testGrid.columns > 1 : true;
      const betterThanCurrent = testGrid.filledArea > currentGrid.filledArea;

      return focusedConstraint && betterThanCurrent ? testGrid : currentGrid;
    }, { filledArea: 0 });

    this.setState({
      optimalGrid,
    });
  }

  handleVideoFocus(id) {
    const { focusedId } = this.state;
    this.setState({
      focusedId: focusedId !== id ? id : false,
    }, this.handleCanvasResize);
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

  renderVideoList() {
    const {
      intl, users, onMount, onUnmount,
    } = this.props;
    const { focusedId } = this.state;

    return users.map((user) => {
      const isFocused = focusedId === user.id;
      const isFocusedIntlKey = !isFocused ? 'focus' : 'unfocus';
      const actions = [{
        label: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Label`]),
        description: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Desc`]),
        onClick: () => this.handleVideoFocus(user.id),
        disabled: users.length < 2,
      }];

      return (
        <div
          key={user.id}
          className={cx({
            [styles.videoListItem]: true,
            [styles.focused]: focusedId === user.id && users.length > 2,
          })}
        >
          <VideoListItem
            user={user}
            actions={actions}
            onMount={(videoRef) => {
              this.handleCanvasResize();
              return onMount(user.id, user.isCurrent, videoRef);
            }}
            onUnmount={() => onUnmount(user.id)}
          />
        </div>
      );
    });
  }

  render() {
    const { users } = this.props;
    const { optimalGrid } = this.state;

    return (
      <div
        ref={(ref) => { this.canvas = ref; }}
        className={styles.videoCanvas}
      >
        {!users.length ? null : (
          <div
            ref={(ref) => { this.grid = ref; }}
            className={styles.videoList}
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
      </div>
    );
  }
}

VideoList.propTypes = propTypes;

export default injectIntl(VideoList);
