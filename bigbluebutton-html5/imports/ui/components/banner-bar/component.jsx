import React from 'react';
import PropTypes from 'prop-types';
import NotificationsBar from '/imports/ui/components/notifications-bar/component';
import { styles } from './styles';

const BannerBar = ({ text, color }) => text && (
  <NotificationsBar
    color={color}
  >
    <span className={styles.bannerTextColor}>
      {text}
    </span>
  </NotificationsBar>
);

BannerBar.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default BannerBar;
