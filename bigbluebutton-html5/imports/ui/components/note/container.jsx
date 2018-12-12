import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withTracker } from 'meteor/react-meteor-data';
import Note from './component';
import NoteService from './service';

const intlMessages = defineMessages({
  title: {
    id: 'app.note.title',
    description: 'Shared notes title',
  },
});

class NoteContainer extends Component {
  componentDidMount() {}
  render() {
    return (
      <Note {...this.props}>
        {this.props.children}
      </Note>
    );
  }
}

export default injectIntl(withTracker(({ params, intl }) => {
  const title = intl.formatMessage(intlMessages.title);
  const url = NoteService.getNoteURL();

  return {
    title,
    url,
  };
})(NoteContainer));
