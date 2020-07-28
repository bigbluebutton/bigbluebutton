import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { makeCall } from '/imports/ui/services/api';
import browser from 'browser-detect';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import { styles } from '../styles';

const BROWSER_RESULTS = browser();
const isMobileBrowser = (BROWSER_RESULTS ? BROWSER_RESULTS.mobile : false)
  || (BROWSER_RESULTS && BROWSER_RESULTS.os
    ? BROWSER_RESULTS.os.includes('Android') // mobile flag doesn't always work
    : false);

const propTypes = {
  parseCurrentSlideContent: PropTypes.func.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
};

const handleClickQuickUrl = (url) => {
  window.open(url, null, 'menubar,toolbar,location,resizable');
};

const getAvailableUrlPolls = (slideId, parsedUrls) => parsedUrls.map(parsedUrl => (
  <DropdownListItem
    label={parsedUrl}
    key={_.uniqueId('quick-url-item')}
    onClick={() => handleClickQuickUrl(parsedUrl)}
  />
));

const QuickUrlDropdown = (props) => {
  const { screenSharingCheck, amIPresenter, parseCurrentSlideContent } = props;
  const parsedSlide = parseCurrentSlideContent();
  
  const { slideId, urls } = parsedSlide;

  const shouldAllowScreensharing = screenSharingCheck
    && !isMobileBrowser
    && amIPresenter;

  return shouldAllowScreensharing && amIPresenter && urls && urls.length ? (
    <Dropdown>
      <DropdownTrigger tabIndex={0}>
        <Button
          aria-label="URL in the slide"
          circle
          className={styles.button}
          color="primary"
          hideLabel
          icon="popout_window"
          label="URL in the slide"
          onClick={() => null}
          size="lg"
        />
      </DropdownTrigger>
      <DropdownContent placement="top left">
        <DropdownList>
          {getAvailableUrlPolls(slideId, urls)}
        </DropdownList>
      </DropdownContent>
    </Dropdown>
  ) : null;
};

QuickUrlDropdown.propTypes = propTypes;

export default QuickUrlDropdown;
