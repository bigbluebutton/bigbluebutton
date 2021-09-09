import React from 'react';
import { Session } from 'meteor/session';
import { withTracker } from 'meteor/react-meteor-data';
import BannerComponent from './component';
import { LayoutContextFunc } from '../layout/context';

const BannerContainer = (props) => {
  const { layoutContextSelector } = LayoutContextFunc;

  const bannerBar = layoutContextSelector.selectInput((i) => i.bannerBar);
  const { hasBanner } = bannerBar;
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

  return <BannerComponent {...{ hasBanner, layoutContextDispatch, ...props }} />;
};

export default withTracker(() => ({
  color: Session.get('bannerColor') || '#0F70D7',
  text: Session.get('bannerText') || '',
}))(BannerContainer);
