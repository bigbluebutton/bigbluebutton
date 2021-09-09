import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Note from './component';
import NoteService from './service';
import { LayoutContextFunc } from '../layout/context';

const NoteContainer = ({ children, ...props }) => {
  const { layoutContextSelector } = LayoutContextFunc;

  const cameraDock = layoutContextSelector.selectInput((i) => i.cameraDock);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

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
