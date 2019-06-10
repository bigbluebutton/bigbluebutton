import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { styles } from './styles';
import VideoListItem from './video-list-item/component';

const propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  onMount: PropTypes.func.isRequired,
  getStats: PropTypes.func.isRequired,
  stopGettingStats: PropTypes.func.isRequired,
  enableVideoStats: PropTypes.bool.isRequired,
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
class VideoList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focusedId: false,
    };

    this.ticking = false;
    this.grid = null;
    this.canvas = null;
  }

  handleVideoFocus(id) {
    const { focusedId } = this.state;
    this.setState({
      focusedId: focusedId !== id ? id : false,
    }, this.handleCanvasResize);
    window.dispatchEvent(new Event('videoFocusChange'));
  }

  renderVideoList() {
    const {
      intl,
      users,
      onMount,
      getStats,
      stopGettingStats,
      enableVideoStats,
      cursor,
      swapLayout,
      mediaHeight,
    } = this.props;
    const { focusedId } = this.state;

    return users.map((user) => {
      const isFocused = focusedId === user.id;
      const isFocusedIntlKey = !isFocused ? 'focus' : 'unfocus';
      let actions = [];

      if (users.length > 2) {
        actions = [{
          label: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Label`]),
          description: intl.formatMessage(intlMessages[`${isFocusedIntlKey}Desc`]),
          onClick: () => this.handleVideoFocus(user.id),
        }];
      }

      return (
        <div
          key={user.id}
          className={cx({
            [styles.videoListItem]: !swapLayout,
            [styles.videoListItemSwapLayout]: swapLayout,
            [styles.focused]: focusedId === user.id && users.length > 2,
          })}
          style={{
            cursor,
          }}
        >
          <VideoListItem
            numOfUsers={users.length}
            user={user}
            actions={actions}
            onMount={(videoRef) => { onMount(user.id, videoRef); }}
            getStats={(videoRef, callback) => getStats(user.id, videoRef, callback)}
            stopGettingStats={() => stopGettingStats(user.id)}
            enableVideoStats={enableVideoStats}
            swapLayout={swapLayout}
            mediaHeight={mediaHeight}
          />
        </div>
      );
    });
  }

  render() {
    const { users, swapLayout } = this.props;

    const canvasClassName = cx({
      [styles.videoCanvas]: !swapLayout,
      [styles.videoCanvasSwapLayout]: swapLayout,
    });

    const videoListClassName = cx({
      [styles.videoList]: !swapLayout,
      [styles.videoListSwapLayout]: swapLayout,
    });

    return (
      <div
        ref={(ref) => { this.canvas = ref; }}
        className={canvasClassName}

        // TODO adicionar videoCanvasSwapLayout quando for swaplayout
      >
        {!users.length ? null : (
          <div
            ref={(ref) => { this.grid = ref; }}
            className={videoListClassName}
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
