import React, { useContext } from 'react';
import { Session } from 'meteor/session';
import { withTracker } from 'meteor/react-meteor-data';
import BannerComponent from './component';
import { NLayoutContext } from '../layout/context/context';

const BannerContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { input } = newLayoutContextState;
  const { bannerBar } = input;
  const { hasBanner } = bannerBar;

  return <BannerComponent {...{ hasBanner, newLayoutContextDispatch, ...props }} />;
};

export default withTracker(() => ({
  color: Session.get('bannerColor') || '#0F70D7',
  text: Session.get('bannerText') || '',
}))(BannerContainer);
