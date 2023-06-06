import { Meteor } from 'meteor/meteor';
import removePresentation from './methods/removePresentation';
import setPresentationRenderedInToast from './methods/setPresentationRenderedInToast';
import setPresentation from './methods/setPresentation';
import setPresentationDownloadable from './methods/setPresentationDownloadable';
import exportPresentationToChat from './methods/exportPresentationToChat';
import insertDocumentWithURL from './methods/insertDocumentWithURL';

Meteor.methods({
  removePresentation,
  setPresentation,
  setPresentationDownloadable,
  exportPresentationToChat,
  setPresentationRenderedInToast,
  insertDocumentWithURL,
});
