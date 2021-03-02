import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Note from './component';
import NoteService from './service';

class NoteContainer extends PureComponent {
  render() {
    return (
      <Note {...this.props}>
        {this.props.children}
      </Note>
    );
  }
}

export default withTracker(() => {
  const isLocked = NoteService.isLocked();
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  return {
    isLocked,
    isRTL,
  };
})(NoteContainer);
