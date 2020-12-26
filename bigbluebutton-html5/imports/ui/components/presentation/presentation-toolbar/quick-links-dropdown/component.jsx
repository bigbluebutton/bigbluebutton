import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import _ from 'lodash';
import { makeCall } from '/imports/ui/services/api';
import browser from 'browser-detect';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import DropdownListTitle from '/imports/ui/components/dropdown/list/title/component';
import FullscreenService from '/imports/ui/components/fullscreen-button/service';

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

const BROWSER_RESULTS = browser();
const isMobileBrowser = (BROWSER_RESULTS ? BROWSER_RESULTS.mobile : false)
  || (BROWSER_RESULTS && BROWSER_RESULTS.os
    ? BROWSER_RESULTS.os.includes('Android') // mobile flag doesn't always work
    : false);

const propTypes = {
  parseCurrentSlideContent: PropTypes.func.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  allowExternalVideo: PropTypes.bool.isRequired,
  fullscreenRef: PropTypes.instanceOf(Element),
  isFullscreen: PropTypes.bool.isRequired,
};

const handleClickQuickVideo = (videoUrl, isFullscreen, fullscreenRef) => {
  if (isFullscreen) {
    FullscreenService.toggleFullScreen(fullscreenRef);
  }
  makeCall('startWatchingExternalVideo', { externalVideoUrl: videoUrl });
};

const handleClickQuickUrl = (url, isFullscreen, fullscreenRef) => {
  if (isFullscreen) {
    // may not be necessary; presentation automatically becomes small when the slide is moved on (but depending on browser..) 
    FullscreenService.toggleFullScreen(fullscreenRef);
  }
  window.open(url, null, 'menubar,toolbar,location,resizable');
};

function getAvailableVideos(slideId, parsedUrls, label, isFullscreen, fullscreenRef, allowEV) {
  if (allowEV && parsedUrls && parsedUrls.length ) {
    const urls = [<DropdownListTitle key='dropvideotitle'>{label}</DropdownListTitle>];
    return urls.concat(parsedUrls.map(parsedUrl => (
              <DropdownListItem
                label={parsedUrl}
                key={parsedUrl}
                onClick={() => handleClickQuickVideo(parsedUrl, isFullscreen, fullscreenRef)}
              />
            )));
  } else {
    return [];
  }
}

function getAvailableUrls(slideId, parsedUrls, label, isFullscreen, fullscreenRef, separator) {
  if (parsedUrls && parsedUrls.length ) {
    const urls = [];
    if (separator) {
      urls.push(<DropdownListSeparator key='quickurllinkseparator' />);
    }
    urls.push(<DropdownListTitle key='dropurltitle'>{label}</DropdownListTitle>);
    return urls.concat(parsedUrls.map(parsedUrl => (
      <DropdownListItem
        label={parsedUrl}
        key={parsedUrl}
        onClick={() => handleClickQuickUrl(parsedUrl, isFullscreen, fullscreenRef)}
      />
    )));
  } else {
    return [];
  }
}

const QuickLinksDropdown = (props) => {
  const { amIPresenter, intl, parseCurrentSlideContent, allowExternalVideo, screenSharingCheck, isFullscreen, fullscreenRef } = props;
  const parsedSlide = parseCurrentSlideContent();

  const { slideId, videoUrls, urls } = parsedSlide;

  const shouldAllowScreensharing = screenSharingCheck
    && !isMobileBrowser
    && amIPresenter;

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
          {getAvailableVideos(slideId, videoUrls, intl.formatMessage(intlMessages.quickLinksVideoLabel), isFullscreen, fullscreenRef, allowExternalVideo)}
          {getAvailableUrls(slideId, urls, intl.formatMessage(intlMessages.quickLinksUrlLabel), isFullscreen, fullscreenRef, videoUrls.length && urls.length)}
        </DropdownList>
      </DropdownContent>
    </Dropdown>
  ) : null;
};

QuickLinksDropdown.propTypes = propTypes;

export default QuickLinksDropdown;
