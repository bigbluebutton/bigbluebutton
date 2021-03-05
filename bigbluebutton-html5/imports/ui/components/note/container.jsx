import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Note from './component';
import NoteService from './service';
import { NLayoutContext } from '../layout/context/context';

const NoteContainer = ({ children, ...props }) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextDispatch } = newLayoutContext;
  return (
    <Note {...{ newLayoutContextDispatch, ...props }}>
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
