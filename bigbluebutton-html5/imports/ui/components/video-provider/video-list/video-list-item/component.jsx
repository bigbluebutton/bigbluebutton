import React, { Component } from 'react';
import cx from 'classnames';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListTitle from '/imports/ui/components/dropdown/list/title/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import Icon from '/imports/ui/components/icon/component';
import { styles } from '../styles';

class VideoListItem extends Component {
  constructor(props) {
    super(props);
    this.videoTag = null;
  }

  componentDidMount() {
    this.props.onMount(this.videoTag);
  }

  componentDidUpdate() {
    if (this.videoTag && this.videoTag.paused) {
      this.videoTag.play();
    }
  }

  render() {
    const { user, actions } = this.props;

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
                {[
                  <DropdownListTitle className={styles.hiddenDesktop} key="name">{user.name}</DropdownListTitle>,
                  <DropdownListSeparator className={styles.hiddenDesktop} key="sep" />,
                  ...actions.map(action => (<DropdownListItem key={user.id} {...action} />)),
                ]}
              </DropdownList>
            </DropdownContent>
          </Dropdown>
          { user.isMuted ? <Icon className={styles.muted} iconName="unmute_filled" /> : null }
        </div>
      </div>
    );
  }
}

export default VideoListItem;
