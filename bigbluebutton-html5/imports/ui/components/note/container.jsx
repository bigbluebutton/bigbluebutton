import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Note from './component';
import NoteService from './service';
import NewLayoutContext from '../layout/context/context';

const NoteContainer = (props) => {
  const { children, newLayoutContextState, ...rest } = props;
  return (
    <Note {...rest}>
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
})(NewLayoutContext.withConsumer(NoteContainer));
