// @ts-nocheck
/* eslint-disable */
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoList from '/imports/ui/components/video-provider/video-provider-graphql/video-list/component';
import VideoService from '/imports/ui/components/video-provider/video-provider-graphql/service';
import { layoutSelect, layoutSelectOutput, layoutDispatch } from '/imports/ui/components/layout/context';
import Users from '/imports/api/users';
import { useNumberOfPages } from '../hooks';

const VideoListContainer = ({ children, ...props }) => {
  const layoutType = layoutSelect((i) => i.layoutType);
  const cameraDock = layoutSelectOutput((i) => i.cameraDock);
  const layoutContextDispatch = layoutDispatch();
  const { streams } = props;
  const numberOfPages = useNumberOfPages();

  return (
    !streams.length
      ? null
      : (
        <VideoList {...{
          layoutType,
          cameraDock,
          layoutContextDispatch,
          numberOfPages,
          ...props,
        }}
        >
          {children}
        </VideoList>
      )
  );
};

export default withTracker((props) => {
  const { streams } = props;

  return {
    ...props,
    streams,
  };
})(VideoListContainer);
