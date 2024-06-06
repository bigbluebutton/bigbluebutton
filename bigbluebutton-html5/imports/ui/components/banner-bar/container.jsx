import React from 'react';
import { Session } from 'meteor/session';
import { withTracker } from 'meteor/react-meteor-data';
import BannerComponent from './component';
import { layoutSelectInput, layoutDispatch } from '../layout/context';

const BannerContainer = (props) => {
  const bannerBar = layoutSelectInput((i) => i.bannerBar);
  const { hasBanner } = bannerBar;
  const layoutContextDispatch = layoutDispatch();

  return <BannerComponent {...{ hasBanner, layoutContextDispatch, ...props }} />;
};

export default withTracker(() => ({
  color: Session.get('bannerColor') || '#0F70D7',
  text: Session.get('bannerText') || '',
}))(BannerContainer);
