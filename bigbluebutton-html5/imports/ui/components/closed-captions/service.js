import Captions from '/imports/api/captions';
import Auth from '/imports/ui/services/auth';

let getCCData = () => {
  const meetingID = Auth.meetingID;
  let captionObj = Captions.find({
    meetingId: meetingID,
  }).fetch();

  let captions = [];
  captionObj.forEach(function (obj) {
    captions[obj.locale] = {
      ownerId: obj.captionHistory.ownerId ? obj.captionHistory.ownerId : null,
      captions: obj.captionHistory.captions,
    };
  });

  return {
    captions: captions,
  };
};

export default {
  getCCData,
};
