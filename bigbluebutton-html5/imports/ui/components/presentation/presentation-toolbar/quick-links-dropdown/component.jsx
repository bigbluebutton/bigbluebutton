import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import _ from 'lodash';
import { makeCall } from '/imports/ui/services/api';
//import browser from 'browser-detect';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import DropdownListTitle from '/imports/ui/components/dropdown/list/title/component';
import FullscreenService from '/imports/ui/components/fullscreen-button/service';
import Panopto from '/imports/ui/components/external-video-player/custom-players/panopto';
import Auth from '/imports/ui/services/auth';

import { styles } from '../styles';

const intlMessages = defineMessages({
  quickLinksLabel: {
    id: 'app.externalLinks.title',
    description: 'Quick external links title',
  },
  quickLinksVideoLabel: {
    id: 'app.externalLinks.videotitle',
    description: 'Quick external links title for videos',
  },
  quickLinksUrlLabel: {
    id: 'app.externalLinks.urltitle',
    description: 'Quick external links title for URLs',
  },
});

//const BROWSER_RESULTS = browser();
//const isMobileBrowser = (BROWSER_RESULTS ? BROWSER_RESULTS.mobile : false)
//  || (BROWSER_RESULTS && BROWSER_RESULTS.os
//    ? BROWSER_RESULTS.os.includes('Android') // mobile flag doesn't always work
//    : false);

const propTypes = {
  parseCurrentSlideContent: PropTypes.func.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  allowExternalVideo: PropTypes.bool.isRequired,
  fullscreenRef: PropTypes.instanceOf(Element),
  isFullscreen: PropTypes.bool.isRequired,
};

const sendGroupMessage = (message) => {
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const payload = {
    color: '0',
    correlationId: `${PUBLIC_CHAT_SYSTEM_ID}-${Date.now()}`,
    sender: {
      id: Auth.userID,
      name: '',
    },
    message,
  };

  return makeCall('sendGroupChatMsg', PUBLIC_GROUP_CHAT_ID, payload);
};

const handleClickQuickVideo = (videoUrl, isFullscreen, fullscreenRef) => {
  if (isFullscreen) {
    FullscreenService.toggleFullScreen(fullscreenRef);
  }
  sendGroupMessage(videoUrl);
  
  let externalVideoUrl = videoUrl;
  if (Panopto.canPlay(videoUrl)) {
    externalVideoUrl = Panopto.getSocialUrl(videoUrl);
  }
  makeCall('startWatchingExternalVideo', externalVideoUrl);
};

const handleClickQuickUrl = (url, isFullscreen, fullscreenRef) => {
  if (isFullscreen) {
    // may not be necessary; presentation automatically becomes small when the slide is moved on (but depending on browser..) 
    FullscreenService.toggleFullScreen(fullscreenRef);
  }
  sendGroupMessage(url);
  window.open(url, null, 'menubar,toolbar,location,resizable');
};

function getAvailableLinks(slideId, videoUrls, urls, videoLabel, urlLabel, isFullscreen, fullscreenRef, allowEV){
  const linkItems = [];
  if (allowEV && videoUrls && videoUrls.length ) {
    linkItems.push(<DropdownListTitle key='dropvideotitle'>{videoLabel}</DropdownListTitle>);
    videoUrls.forEach(url => {
              linkItems.push(
                <DropdownListItem
                  label={url}
                  onClick={() => handleClickQuickVideo(url, isFullscreen, fullscreenRef)}
                  key={url}
                />);
            });
  }
  
  if (urls && urls.length ) {
    if (videoUrls && videoUrls.length) {
      linkItems.push(<DropdownListSeparator key='quickurllinkseparator' />);
    }
    linkItems.push(<DropdownListTitle key='dropurltitle'>{urlLabel}</DropdownListTitle>);
    urls.forEach(url => {
              linkItems.push(
                <DropdownListItem
                  label={url}
                  onClick={() => handleClickQuickUrl(url, isFullscreen, fullscreenRef)}
                  key={url}
                />);
            });
  }
  return(linkItems);
}

const QuickLinksDropdown = (props) => {
  const { amIPresenter, intl, parseCurrentSlideContent, allowExternalVideo, screenSharingCheck, isFullscreen, fullscreenRef } = props;
  const parsedSlide = parseCurrentSlideContent();

  const { slideId, videoUrls, urls } = parsedSlide;

// This seems useless.
//  const shouldAllowScreensharing = screenSharingCheck
//    && !isMobileBrowser
//    && amIPresenter;

  return amIPresenter && ((videoUrls && videoUrls.length) || (urls && urls.length)) ? (
    <Dropdown>
    <DropdownTrigger tabIndex={0}>
        <Button
          aria-label={intl.formatMessage(intlMessages.quickLinksLabel)}
          className={styles.presentationBtn}
          color="primary"
          hideLabel
          icon="popout_window"
          label={intl.formatMessage(intlMessages.quickLinksLabel)}
          onClick={() => null}
          size="lg"
        />
      </DropdownTrigger>
      <DropdownContent placement="top left">
        <DropdownList>
          {getAvailableLinks(slideId, videoUrls, urls, intl.formatMessage(intlMessages.quickLinksVideoLabel), intl.formatMessage(intlMessages.quickLinksUrlLabel), isFullscreen, fullscreenRef, allowExternalVideo)}
        </DropdownList>
      </DropdownContent>
    </Dropdown>
  ) : null;
};

QuickLinksDropdown.propTypes = propTypes;

export default QuickLinksDropdown;
