Meteor.methods({
  publishSwitchToPreviousSlideMessage(meetingId, userId, authToken) {
    let currentPresentationDoc, currentSlideDoc, message, previousSlideDoc;
    currentPresentationDoc = Meteor.Presentations.findOne({
      "meetingId": meetingId,
      "presentation.current": true
    });
    currentSlideDoc = Meteor.Slides.findOne({
      "meetingId": meetingId,
      "presentationId": currentPresentationDoc != null ? currentPresentationDoc.presentation.id : void 0,
      "slide.current": true
    });
    previousSlideDoc = Meteor.Slides.findOne({
      "meetingId": meetingId,
      "presentationId": currentPresentationDoc != null ? currentPresentationDoc.presentation.id : void 0,
      "slide.num": (currentSlideDoc != null ? currentSlideDoc.slide.num : void 0) - 1
    });
    if((previousSlideDoc != null) && isAllowedTo('switchSlide', meetingId, userId, authToken)) {
      message = {
        "payload": {
          "page": previousSlideDoc.slide.id,
          "meeting_id": meetingId
        },
        "header": {
          "name": "go_to_slide"
        }
      };
      return publish(Meteor.config.redis.channels.toBBBApps.presentation, message);
    }
  },
  publishSwitchToNextSlideMessage(meetingId, userId, authToken) {
    let currentPresentationDoc, currentSlideDoc, message, nextSlideDoc;
    currentPresentationDoc = Meteor.Presentations.findOne({
      "meetingId": meetingId,
      "presentation.current": true
    });
    currentSlideDoc = Meteor.Slides.findOne({
      "meetingId": meetingId,
      "presentationId": currentPresentationDoc != null ? currentPresentationDoc.presentation.id : void 0,
      "slide.current": true
    });
    nextSlideDoc = Meteor.Slides.findOne({
      "meetingId": meetingId,
      "presentationId": currentPresentationDoc != null ? currentPresentationDoc.presentation.id : void 0,
      "slide.num": (currentSlideDoc != null ? currentSlideDoc.slide.num : void 0) + 1
    });
    if((nextSlideDoc != null) && isAllowedTo('switchSlide', meetingId, userId, authToken)) {
      message = {
        "payload": {
          "page": nextSlideDoc.slide.id,
          "meeting_id": meetingId
        },
        "header": {
          "name": "go_to_slide"
        }
      };
      return publish(Meteor.config.redis.channels.toBBBApps.presentation, message);
    }
  }
});

this.addPresentationToCollection = function(meetingId, presentationObject) {
  let entry, id;
  if(Meteor.Presentations.findOne({
    meetingId: meetingId,
    'presentation.id': presentationObject.id
  }) == null) {
    entry = {
      meetingId: meetingId,
      presentation: {
        id: presentationObject.id,
        name: presentationObject.name,
        current: presentationObject.current
      }
    };
    return id = Meteor.Presentations.insert(entry);
  }
};

this.removePresentationFromCollection = function(meetingId, presentationId) {
  let id;
  if((meetingId != null) && (presentationId != null) && (Meteor.Presentations.findOne({
    meetingId: meetingId,
    "presentation.id": presentationId
  }) != null)) {
    id = Meteor.Presentations.findOne({
      meetingId: meetingId,
      "presentation.id": presentationId
    });
    if(id != null) {
      Meteor.Slides.remove({
        presentationId: presentationId
      }, Meteor.log.info(`cleared Slides Collection (presentationId: ${presentationId}!`));
      Meteor.Presentations.remove(id._id);
      return Meteor.log.info(`----removed presentation[${presentationId}] from ${meetingId}`);
    }
  }
};

this.clearPresentationsCollection = function(meetingId) {
  if(meetingId != null) {
    return Meteor.Presentations.remove({
      meetingId: meetingId
    }, Meteor.log.info(`cleared Presentations Collection (meetingId: ${meetingId}!`));
  } else {
    return Meteor.Presentations.remove({}, Meteor.log.info("cleared Presentations Collection (all meetings)!"));
  }
};
