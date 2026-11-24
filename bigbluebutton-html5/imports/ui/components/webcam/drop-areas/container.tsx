import React from 'react';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { CAMERADOCK_POSITION } from '/imports/ui/components/layout/enums';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import DropArea from './component';

// the zones in the order the engine listed them (calculatesDropAreas); the CSS layout places them
const ZONES = [
  CAMERADOCK_POSITION.CONTENT_TOP,
  CAMERADOCK_POSITION.CONTENT_RIGHT,
  CAMERADOCK_POSITION.CONTENT_BOTTOM,
  CAMERADOCK_POSITION.CONTENT_LEFT,
  CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM,
];

const DropAreaContainer = () => {
  // no zone below the sidebar while the auxiliary panel is open
  const auxiliaryIsOpen = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary.isOpen);
  const zones = auxiliaryIsOpen
    ? ZONES.filter((zone) => zone !== CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM)
    : ZONES;

  return (
    zones.map((zone) => (
      <DropArea
        dataTest={`dropArea-${zone}`}
        key={zone}
        id={zone}
      />
    ))
  );
};

export default DropAreaContainer;
