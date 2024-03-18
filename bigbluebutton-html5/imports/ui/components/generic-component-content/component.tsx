import React, { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { GenericComponent } from 'bigbluebutton-html-plugin-sdk';
import * as Styled from './styles';
import { GenericComponentProps } from './types';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import NotesService from '/imports/ui/components/notes/service';
import GenericComponentItem from './generic-component-item/component';
import { screenshareHasEnded } from '../screenshare/service';

const mapGenericComponentItems = (
  genericComponents: GenericComponent[],
) => genericComponents.map((genericComponent) => (
  <GenericComponentItem
    key={genericComponent.id}
    renderFunction={genericComponent.contentFunction}
  />
));

const GenericComponentContent: React.FC<GenericComponentProps> = ({
  isResizing,
  genericComponent,
  renderFunctionComponents,
  hasExternalVideoOnLayout,
  isSharedNotesPinned,
  hasScreenShareOnLayout,
}) => {
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);

  const {
    height,
    width,
    top,
    left,
    right,
  } = genericComponent;

  const isMinimized = width === 0 && height === 0;

  useEffect(() => {
    if (hasExternalVideoOnLayout) stopExternalVideoShare();
    if (isSharedNotesPinned) NotesService.pinSharedNotes(false);
    if (hasScreenShareOnLayout) screenshareHasEnded();
  }, []);

  const numberOfTiles = renderFunctionComponents.length;
  return (
    <Styled.Container
      numberOfTiles={numberOfTiles}
      style={{
        height,
        width,
        top,
        left,
        right,
      }}
      isResizing={isResizing}
      isMinimized={isMinimized}
    >
      {mapGenericComponentItems(renderFunctionComponents)}
    </Styled.Container>
  );
};

export default GenericComponentContent;
