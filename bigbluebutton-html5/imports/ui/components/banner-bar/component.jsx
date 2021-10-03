import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import NotificationsBar from '/imports/ui/components/notifications-bar/component';
import { styles } from './styles';
import { ACTIONS } from '../layout/enums';

const BannerBar = ({
  text, color, hasBanner: propsHasBanner, layoutContextDispatch,
}) => {
  useEffect(() => {
    const localHasBanner = !!text;

    if (localHasBanner !== propsHasBanner) {
      layoutContextDispatch({
        type: ACTIONS.SET_HAS_BANNER_BAR,
        value: localHasBanner,
      });
    }
  }, [text, propsHasBanner]);

  if (!text) return null;

  return (
    <NotificationsBar color={color}>
      <span className={styles.bannerTextColor}>
        {text}
      </span>
    </NotificationsBar>
  );
};

BannerBar.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default BannerBar;
