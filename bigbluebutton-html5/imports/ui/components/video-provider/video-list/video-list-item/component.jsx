import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListTitle from '/imports/ui/components/dropdown/list/title/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import Icon from '/imports/ui/components/icon/component';
import logger from '/imports/startup/client/logger';
import VideoListItemStats from './video-list-item-stats/component';
import FullscreenButton from '../../fullscreen-button/component';
import { styles } from '../styles';

const intlMessages = defineMessages({
  connectionStatsLabel: {
    id: 'app.video.stats.title',
  },
});

class VideoListItem extends Component {
  constructor(props) {
    super(props);
    this.videoTag = null;

    this.state = {
      showStats: false,
      stats: { video: {} },
    };

    this.toggleStats = this.toggleStats.bind(this);
    this.setStats = this.setStats.bind(this);
  }

  componentDidMount() {
    const { onMount } = this.props;
    onMount(this.videoTag);
  }

  componentDidUpdate() {
    const playElement = (elem) => {
      if (elem.paused) {
        const p = elem.play();
        if (p && (typeof Promise !== 'undefined') && (p instanceof Promise)) {
          // Catch exception when playing video
          p.catch((e) => {
            logger.error(
              { logCode: 'videolistitem_component_play_error' },
              `Error playing video: ${JSON.stringify(e)}`,
            );
          });
        }
      }
    };

    // This is here to prevent the videos from freezing when they're
    // moved around the dom by react, e.g., when  changing the user status
    // see https://bugs.chromium.org/p/chromium/issues/detail?id=382879
    if (this.videoTag) {
      playElement(this.videoTag);
    }
  }

  setStats(updatedStats) {
    const { stats } = this.state;
    const { audio, video } = updatedStats;
    this.setState({ stats: { ...stats, video, audio } });
  }

  getAvailableActions() {
    const {
      intl,
      actions,
      user,
      enableVideoStats,
    } = this.props;

    return _.compact([
      <DropdownListTitle className={styles.hiddenDesktop} key="name">{user.name}</DropdownListTitle>,
      <DropdownListSeparator className={styles.hiddenDesktop} key="sep" />,
      ...actions.map(action => (<DropdownListItem key={user.id} {...action} />)),
      (enableVideoStats
        ? (
          <DropdownListItem
            key={`list-item-stats-${user.id}`}
            onClick={() => { this.toggleStats(); }}
            label={intl.formatMessage(intlMessages.connectionStatsLabel)}
          />
        )
        : null),
    ]);
  }

  toggleStats() {
    const { getStats, stopGettingStats } = this.props;
    const { showStats } = this.state;
    if (showStats) {
      stopGettingStats();
    } else {
      getStats(this.videoTag, this.setStats);
    }
    this.setState({ showStats: !showStats });
  }

  renderFullscreenButton() {
    const { user } = this.props;
    const full = () => {
      this.videoTag.requestFullscreen();
    };
    return <FullscreenButton handleFullscreen={full} elementName={user.name} />;
  }

  render() {
    const { showStats, stats } = this.state;
    const { user } = this.props;
    const availableActions = this.getAvailableActions();
    const enableVideoMenu = Meteor.settings.public.kurento.enableVideoMenu || false;

    return (
      <div className={cx({
        [styles.content]: true,
        [styles.talking]: user.isTalking,
      })}
      >
        <div className={styles.connecting} />
        <video
          className={styles.media}
          ref={(ref) => { this.videoTag = ref; }}
          muted={user.isCurrent}
          autoPlay
          playsInline
        />
        <div className={styles.info}>
          {enableVideoMenu && availableActions.length >= 3
            ? (
              <Dropdown className={styles.dropdown}>
                <DropdownTrigger className={styles.dropdownTrigger}>
                  <span>{user.name}</span>
                </DropdownTrigger>
                <DropdownContent placement="top left" className={styles.dropdownContent}>
                  <DropdownList className={styles.dropdownList}>
                    {availableActions}
                  </DropdownList>
                </DropdownContent>
              </Dropdown>
            )
            : (
              <div className={styles.dropdown}>
                <span className={styles.userName}>{user.name}</span>
              </div>
            )
          }
          {user.isMuted ? <Icon className={styles.muted} iconName="unmute_filled" /> : null}
          {user.isListenOnly ? <Icon className={styles.voice} iconName="listen" /> : null}
        </div>
        {showStats ? <VideoListItemStats toggleStats={this.toggleStats} stats={stats} /> : null}
        { this.renderFullscreenButton() }
      </div>
    );
  }
}

export default injectIntl(VideoListItem);
