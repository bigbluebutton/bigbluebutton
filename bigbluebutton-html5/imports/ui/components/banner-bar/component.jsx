import React from 'react';
import PropTypes from 'prop-types';
import NotificationsBar from '/imports/ui/components/notifications-bar/component';
import { styles } from './styles';

const BannerBar = ({ text, color }) => {
  if (!text) return null;
  return (
    <NotificationsBar
      color={color}
    >
      <span className={styles.bannerTextColor}>
        {text}
      </span>
    </NotificationsBar>
  );
};

BannerBar.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
};

BannerBar.defaultProps = {
  text: '',
  color: '#0F70D7',
};

export default BannerBar;
