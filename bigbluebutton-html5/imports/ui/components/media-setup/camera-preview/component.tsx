import React from 'react';
import VideoService from '/imports/ui/components/video-provider/service';
import { VIEW_STATES } from '/imports/ui/components/video-preview/hooks/types';
// The styled pieces still live in the profile panel; moving them into a neutral
// module is a follow-up.
import Styled from '/imports/ui/components/profile-settings/styles';

interface CameraPreviewProps {
  viewState: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  findingLabel: string;
  animations: boolean;
  /** Frames the states that have no stream to show; the panels box them differently. */
  statusContainer: React.ComponentType<{ children?: React.ReactNode }>;
  deviceError?: string | null;
  previewError?: string | null;
  /** Replaces every stream state - the pre-flight uses it while the camera is off. */
  placeholder?: React.ReactNode;
  /** Overlaid on the preview: the pre-flight controls, the profile arrows. */
  children?: React.ReactNode;
}

/**
 * The camera preview surface shared by the profile panel and the pre-flight
 * screen. It only renders what `useVideoPreview` reports; acquiring and
 * releasing the stream stays with the caller.
 */
const CameraPreview: React.FC<CameraPreviewProps> = ({
  viewState,
  videoRef,
  findingLabel,
  animations,
  statusContainer: StatusContainer,
  deviceError = null,
  previewError = null,
  placeholder = null,
  children = null,
}) => {
  const renderContent = () => {
    if (placeholder) return <StatusContainer>{placeholder}</StatusContainer>;

    switch (viewState) {
      case VIEW_STATES.finding:
        return (
          <StatusContainer>
            <span>{findingLabel}</span>
            <Styled.FetchingAnimation animations={animations} />
          </StatusContainer>
        );
      case VIEW_STATES.error:
        return <StatusContainer>{deviceError}</StatusContainer>;
      case VIEW_STATES.found:
      default:
        if (previewError) return <StatusContainer>{previewError}</StatusContainer>;

        return (
          <Styled.VideoPreviewContent>
            <Styled.VideoCol>
              <Styled.VideoPreview
                mirroredVideo={VideoService.mirrorOwnWebcam()}
                id="preview"
                data-test={VideoService.mirrorOwnWebcam() ? 'mirroredVideoPreview' : 'videoPreview'}
                ref={videoRef}
                autoPlay
                playsInline
                muted
              />
            </Styled.VideoCol>
          </Styled.VideoPreviewContent>
        );
    }
  };

  return (
    <Styled.VideoPreviewContainer>
      <Styled.VideoPreviewWrapper>
        {renderContent()}
        {children}
      </Styled.VideoPreviewWrapper>
    </Styled.VideoPreviewContainer>
  );
};

export default CameraPreview;
