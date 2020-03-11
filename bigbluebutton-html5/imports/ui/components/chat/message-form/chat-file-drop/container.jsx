import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import Service from './service';
import ChatFileUploader from './component';

import ChatService from '../../service';

const ChatFileUploaderContainer = props => (
  <ChatFileUploader {...props} />
);

export default withTracker(() => {
  const cleanScrollAndSendMessage = (fileData) => {
    ChatService.updateScrollPosition(null);
    
    return ChatService.sendGroupMessage(fileData);
  };

  const CHATFILE_CONFIG = Meteor.settings.public.chatFile;

  return {
    fileSizeMin: CHATFILE_CONFIG.uploadSizeMin,
    fileSizeMax: CHATFILE_CONFIG.uploadSizeMax,
    fileValidMimeTypes: CHATFILE_CONFIG.uploadValidMimeTypes,
    handleSave: file => Service.persistChatfile(
      file,
      CHATFILE_CONFIG.uploadEndpoint
    ),
    handleSendMessage: cleanScrollAndSendMessage,
  };
})(ChatFileUploaderContainer);
