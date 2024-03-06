import React, { useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import FullscreenButtonContainer from '/imports/ui/components/common/fullscreen-button/container';
import Styled from './styles';

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;

interface ViewActionsProps {
  name: string;
  cameraId: string;
  videoContainer: React.RefObject<HTMLDivElement> | null;
  isFullscreenContext: boolean;
  layoutContextDispatch: (action: { type: string; value: {
    element: string,
    group: string,
  } }) => void;
  isStream: boolean;
}

const ViewActions: React.FC<ViewActionsProps> = ({
  name,
  cameraId,
  videoContainer,
  isFullscreenContext,
  layoutContextDispatch,
  isStream,
}) => {
  useEffect(() => () => {
    // exit fullscreen when component is unmounted
    if (isFullscreenContext) {
      layoutContextDispatch({
        type: ACTIONS.SET_FULLSCREEN_ELEMENT,
        value: {
          element: '',
          group: '',
        },
      });
    }
  }, []);

  if (!ALLOW_FULLSCREEN || !isStream) return null;
  return (
    <Styled.FullscreenWrapper>
      <FullscreenButtonContainer
        data-test="webcamsFullscreenButton"
        // @ts-ignore TODO: JS component
        fullscreenRef={videoContainer.current}
        elementName={name}
        elementId={cameraId}
        elementGroup="webcams"
        isFullscreen={isFullscreenContext}
        dark
      />
    </Styled.FullscreenWrapper>
  );
};

export default ViewActions;
