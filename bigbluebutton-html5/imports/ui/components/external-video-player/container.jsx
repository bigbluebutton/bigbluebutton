import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { getVideoUrl } from './service';
import ExternalVideoComponent from './component';
import { NLayoutContext } from '../layout/context/context';

const ExternalVideoContainer = (props) => {
  const NewLayoutManager = useContext(NLayoutContext);
  const { newLayoutContextState } = NewLayoutManager;
  const { output, layoutLoaded } = newLayoutContextState;
  const { externalVideo } = output;

  return <ExternalVideoComponent {...{ ...props }} {...externalVideo} layoutLoaded={layoutLoaded} />
};

export default withTracker(({ isPresenter }) => {
  const inEchoTest = Session.get('inEchoTest');
  return {
    inEchoTest,
    isPresenter,
    videoUrl: getVideoUrl(),
  };
})(ExternalVideoContainer);
