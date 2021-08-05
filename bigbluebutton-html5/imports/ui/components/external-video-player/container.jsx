import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { getVideoUrl } from './service';
import ExternalVideoComponent from './component';
import LayoutContext from '../layout/context';

const ExternalVideoContainer = (props) => {
  const layoutManager = useContext(LayoutContext);
  const { layoutContextState } = layoutManager;
  const { output } = layoutContextState;
  const { externalVideo } = output;

  return <ExternalVideoComponent {...{ ...props }} {...externalVideo} />;
};

export default withTracker(({ isPresenter }) => {
  const inEchoTest = Session.get('inEchoTest');
  return {
    inEchoTest,
    isPresenter,
    videoUrl: getVideoUrl(),
  };
})(ExternalVideoContainer);
