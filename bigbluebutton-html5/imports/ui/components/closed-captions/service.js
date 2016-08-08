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
  console.log(captionObj);
  //associative array that keeps locales with arrays of string objects related to those locales
  let captions = [];

  //to keep track of locales in the captions[]
  let locales = [];

  if (captionObj != null) {
    let current = captionObj[0];
    while (current != null) {
      if (locales.indexOf(current.locale) > -1) {
        captions[current.locale].captions.push(
          {
            captions: current.captionHistory.captions,
            index: current.captionHistory.index,
          }
        );
      } else {
        captions[current.locale] = {
          ownerId: current.captionHistory.ownerId ? current.captionHistory.ownerId : null,
          captions: [
            {
              captions: current.captionHistory.captions,
              index: current.captionHistory.index,
            },
          ],
        };
        locales.push(current.locale);
      }

      current = captionObj[current.captionHistory.next];
    }
  }

  return {
    captions: captions,
  };
};

export default {
  getCCData,
};
