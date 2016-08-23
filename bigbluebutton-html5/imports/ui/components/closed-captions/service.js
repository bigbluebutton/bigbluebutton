import Captions from '/imports/api/captions';
import Auth from '/imports/ui/services/auth';

let getCCData = () => {
  const meetingID = Auth.meetingID;

  //list of unique locales in the Captions Collection
  let locales = _.uniq(Captions.find({}, {
    sort: { locale: 1 },
    fields: { locale: true },
  }).fetch().map(function (obj) {
    return obj.locale;
  }), true);

  //associative array that keeps locales with arrays of string objects related to those locales
  let captions = [];

  locales.forEach(function (locale) {
    let captionObjects = Captions.find({
      meetingId: meetingID,
      locale: locale,
    }, {
      sort: {
        locale: 1,
        'captionHistory.index': 1,
      },
    }).fetch();

    let current = captionObjects[0];
    captions[current.locale] = {
      ownerId: current.captionHistory.ownerId ? current.captionHistory.ownerId : null,
      captions: [],
    };
    while (current != null) {
      captions[current.locale].captions.push({
        captions: current.captionHistory.captions,
        index: current.captionHistory.index,
      });
      current = captionObjects[current.captionHistory.next];
    }
  });

  return {
    captions: captions,
  };
};

export default {
  getCCData,
};
