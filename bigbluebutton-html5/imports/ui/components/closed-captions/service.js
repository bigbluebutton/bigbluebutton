import Captions from '/imports/api/captions';
import Auth from '/imports/ui/services/auth';

let getCCData = () => {
  const meetingID = Auth.meetingID;
  let captionObj = Captions.find({
    meetingId: meetingID,
  }, {
    sort: {
      locale: 1,
      'captionHistory.index': 1,
    },
  }).fetch();

  let locales = [];
  let captions = [];
  captionObj.forEach(function (obj) {
    if (locales.indexOf(obj.locale) > -1) {
      captions[obj.locale].captions.push(
        {
          captions: obj.captionHistory.captions,
          index: obj.captionHistory.index,
        }
      );
    } else {
      captions[obj.locale] = {
        ownerId: obj.captionHistory.ownerId ? obj.captionHistory.ownerId : null,
        captions: [
          {
            captions: obj.captionHistory.captions,
            index: obj.captionHistory.index,
          },
        ],
      };
      locales.push(obj.locale);
    }
  });

  return {
    captions: captions,
  };
};

export default {
  getCCData,
};
