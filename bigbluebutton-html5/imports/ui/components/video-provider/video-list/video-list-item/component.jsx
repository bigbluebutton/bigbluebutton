import React, { Component } from 'react';
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
import Button from '/imports/ui/components/button/component';
import VideoListItemStats from './video-list-item-stats/component';
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
      stats: {'video':{}},
    }

    this.toggleStats = this.toggleStats.bind(this);
    this.setStats = this.setStats.bind(this);
  }

  componentDidMount() {
    this.props.onMount(this.videoTag);
  }

  toggleStats() {
    this.setState({showStats: !this.state.showStats});
  }

  setStats(updatedStats) {
    const { audio, video } = updatedStats;
    this.setState({ stats: { ...this.state.stats, video, audio }})
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
      (enableVideoStats ?
        <DropdownListItem
          key={'list-item-stats-' + user.id}
          onClick={() => {this.toggleStats();}}
          label={intl.formatMessage(intlMessages.connectionStatsLabel)}
        />
      : null),
    ]);
  }

  render() {
    const { showStats, stats } = this.state;
    const { user, getStats, stopGettingStats } = this.props;

    const availableActions = this.getAvailableActions();
    
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
          <Dropdown className={styles.dropdown}>
            <DropdownTrigger className={styles.dropdownTrigger}>
              <span>{user.name}</span>
            </DropdownTrigger>
            <DropdownContent placement="top left">
              <DropdownList className={styles.dropdownList}>
                {availableActions}
              </DropdownList>
            </DropdownContent>
          </Dropdown>
          { user.isMuted ? <Icon className={styles.muted} iconName="unmute_filled" /> : null }
          { user.isListenOnly ? <Icon className={styles.voice} iconName="listen" /> : null }
        </div>
        { showStats ? <VideoListItemStats toggleStats={this.toggleStats} getStats={() => getStats(this.videoTag, this.setStats)} stats={stats} stopGettingStats={stopGettingStats} /> : null }
      </div>
    );
  }
}

export default injectIntl(VideoListItem);
