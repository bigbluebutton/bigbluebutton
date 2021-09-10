import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Note from './component';
import NoteService from './service';
import { layoutSelectInput, layoutDispatch } from '../layout/context';

const NoteContainer = ({ children, ...props }) => {
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();

  return (
    <Note {...{ layoutContextDispatch, isResizing, ...props }}>
      {children}
    </Note>
  );
};

export default withTracker(() => {
  const isLocked = NoteService.isLocked();
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  return {
    isLocked,
    isRTL,
  };
})(NoteContainer);
