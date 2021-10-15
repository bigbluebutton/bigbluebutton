import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PadsService from '/imports/ui/components/pads/service';
import NotesService from '/imports/ui/components/notes/service';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import UserNotes from './component';
import LayoutContext from '../../../layout/context';

const UserNotesContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { input } = layoutContextState;
  const { sidebarContent } = input;
  const { sidebarContentPanel } = sidebarContent;
  return <UserNotes {...{ layoutContextDispatch, sidebarContentPanel, ...props }} />;
};

export default lockContextContainer(withTracker(({ userLocks }) => {
  const shouldDisableNotes = userLocks.userNotes;
  return {
    rev: PadsService.getRev(NotesService.ID),
    disableNotes: shouldDisableNotes,
  };
})(UserNotesContainer));
