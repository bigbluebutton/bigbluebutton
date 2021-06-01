import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { makeCall } from '/imports/ui/services/api';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import { styles } from '../styles';

const propTypes = {
  parseCurrentSlideContent: PropTypes.func.isRequired,
  amIPresenter: PropTypes.bool.isRequired,
};

const handleClickQuickVideo = (videoUrl) => {
  makeCall('startWatchingExternalVideo', { externalVideoUrl: videoUrl });
};

const getAvailableVideoPolls = (slideId, parsedUrls) => parsedUrls.map(parsedUrl => (
  <DropdownListItem
    label={parsedUrl}
    key={_.uniqueId('quick-video-item')}
    onClick={() => handleClickQuickVideo(parsedUrl)}
  />
));

const QuickVideoDropdown = (props) => {
  const { amIPresenter, parseCurrentSlideContent } = props;
  const parsedSlide = parseCurrentSlideContent();

  const { slideId, videoUrls } = parsedSlide;

  return amIPresenter && videoUrls && videoUrls.length ? (
    <Dropdown>
      <DropdownTrigger tabIndex={0}>
        <Button
          aria-label="Video nella slide"
          circle
          className={styles.button}
          color="primary"
          hideLabel
          icon="video"
          label="Video nella slide"
          onClick={() => null}
          size="lg"
        />
      </DropdownTrigger>
      <DropdownContent placement="top left">
        <DropdownList>
          {getAvailableVideoPolls(slideId, videoUrls)}
        </DropdownList>
      </DropdownContent>
    </Dropdown>
  ) : null;
};

QuickVideoDropdown.propTypes = propTypes;

export default QuickVideoDropdown;
