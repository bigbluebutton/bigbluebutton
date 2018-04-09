import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  videoMenu: {
    id: 'app.video.videoMenu',
    description: 'video menu label',
  },
  videoMenuDesc: {
    id: 'app.video.videoMenuDesc',
    description: 'video menu description',
  },
});


const propTypes = {
  intl: intlShape.isRequired,
  isSharingVideo: PropTypes.bool.isRequired,
  videoItems: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const JoinVideoOptions = ({
  intl,
  isSharingVideo,
  videoItems,
}) => {
  const menuItems = videoItems
    .filter(item => !item.disabled)
    .map(item =>
      (
        <DropdownListItem
          key={_.uniqueId('video-menu-')}
          className={styles.item}
          description={item.description}
          onClick={item.click}
          tabIndex={-1}
        >
          <img src={item.iconPath} className={styles.imageSize} alt="video menu icon" />
          <span className={styles.label}>{item.label}</span>
        </DropdownListItem>
      ));
  return (
    <Dropdown
      autoFocus
    >
      <DropdownTrigger tabIndex={0}>
        <Button
          className={styles.button}
          label={intl.formatMessage(intlMessages.videoMenu)}
          onClick={() => null}
          hideLabel
          aria-label={intl.formatMessage(intlMessages.videoMenuDesc)}
          color={isSharingVideo ? 'danger' : 'primary'}
          icon={isSharingVideo ? 'video_off' : 'video'}
          size="lg"
          circle
        />
      </DropdownTrigger>
      <DropdownContent placement="top" >
        <DropdownList horizontal>
          {menuItems}
        </DropdownList>
      </DropdownContent>
    </Dropdown>
  );
};
JoinVideoOptions.propTypes = propTypes;
export default injectIntl(JoinVideoOptions);
