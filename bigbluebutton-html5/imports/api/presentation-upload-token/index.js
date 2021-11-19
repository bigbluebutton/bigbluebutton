const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const PresentationUploadToken = new Mongo.Collection('presentation-upload-token', collectionOptions);

export default PresentationUploadToken;
