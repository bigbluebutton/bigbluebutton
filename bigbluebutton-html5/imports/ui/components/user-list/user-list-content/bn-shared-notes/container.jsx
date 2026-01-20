import React from 'react';
import BNSharedNotesItem from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';

const BNSharedNotesContainer = (props) => {
  const { userLocks } = props;
  const disableNotes = userLocks?.userNotes;
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  return (
    <BNSharedNotesItem {...{
      layoutContextDispatch,
      sidebarContentPanel,
      disableNotes,
    }}
    />
  );
};

export default lockContextContainer(BNSharedNotesContainer);
