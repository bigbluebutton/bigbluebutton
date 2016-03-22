Meteor.methods({
  publishSwitchToPreviousSlideMessage(meetingId, userId, authToken) {
    let currentPresentationDoc, currentSlideDoc, message, previousSlideDoc;
    currentPresentationDoc = Meteor.Presentations.findOne({
      meetingId: meetingId,
      'presentation.current': true,
    });
    if (currentPresentationDoc != null) {
      currentSlideDoc = Meteor.Slides.findOne({
        meetingId: meetingId,
        presentationId: currentPresentationDoc.presentation.id,
        'slide.current': true,
      });
      if (currentSlideDoc != null) {
        previousSlideDoc = Meteor.Slides.findOne({
          meetingId: meetingId,
          presentationId: currentPresentationDoc.presentation.id,
          'slide.num': currentSlideDoc.slide.num - 1,
        });
        if ((previousSlideDoc != null) && isAllowedTo('switchSlide', meetingId, userId, authToken)) {
          message = {
            payload: {
              page: previousSlideDoc.slide.id,
              meeting_id: meetingId,
            },
            header: {
              name: 'go_to_slide',
            },
          };
          return publish(Meteor.config.redis.channels.toBBBApps.presentation, message);
        }
      }
    }
  },

  publishSwitchToNextSlideMessage(meetingId, userId, authToken) {
    let currentPresentationDoc, currentSlideDoc, message, nextSlideDoc;
    currentPresentationDoc = Meteor.Presentations.findOne({
      meetingId: meetingId,
      'presentation.current': true,
    });
    if (currentPresentationDoc != null) {
      currentSlideDoc = Meteor.Slides.findOne({
        meetingId: meetingId,
        presentationId: currentPresentationDoc.presentation.id,
        'slide.current': true,
      });
      if (currentSlideDoc != null) {
        nextSlideDoc = Meteor.Slides.findOne({
          meetingId: meetingId,
          presentationId: currentPresentationDoc.presentation.id,
          'slide.num': currentSlideDoc.slide.num + 1,
        });
        if ((nextSlideDoc != null) && isAllowedTo('switchSlide', meetingId, userId, authToken)) {
          message = {
            payload: {
              page: nextSlideDoc.slide.id,
              meeting_id: meetingId,
            },
            header: {
              name: 'go_to_slide',
            },
          };
          return publish(Meteor.config.redis.channels.toBBBApps.presentation, message);
        }
      }
    }
  },
});

// --------------------------------------------------------------------------------------------
// Private methods on server
// --------------------------------------------------------------------------------------------
this.addPresentationToCollection = function (meetingId, presentationObject) {
  let entry, id, presentationObj;

  //check if the presentation is already in the collection
  presentationObj = Meteor.Presentations.findOne({
    meetingId: meetingId,
    'presentation.id': presentationObject.id,
  });
  if (presentationObj == null) {
    entry = {
      meetingId: meetingId,
      presentation: {
        id: presentationObject.id,
        name: presentationObject.name,
        current: presentationObject.current,
      },
    };
    return id = Meteor.Presentations.insert(entry);

    //Meteor.log.info "presentation added id =[#{id}]:#{presentationObject.id} in #{meetingId}. Presentations.size is now #{Meteor.Presentations.find({meetingId: meetingId}).count()}"
  }
};

this.removePresentationFromCollection = function (meetingId, presentationId) {
  let id, presentationObject;
  presentationObject = Meteor.Presentations.findOne({
    meetingId: meetingId,
    'presentation.id': presentationId,
  });
  if (presentationObject != null) {
    Meteor.Slides.remove({
        presentationId: presentationId,
      }, Meteor.log.info(`cleared Slides Collection (presentationId: ${presentationId}!`));
    Meteor.Presentations.remove(presentationObject._id);
    return Meteor.log.info(`----removed presentation[${presentationId}] from ${meetingId}`);
  }
};

// called on server start and meeting end
this.clearPresentationsCollection = function (meetingId) {
  if (meetingId != null) {
    return Meteor.Presentations.remove({
      meetingId: meetingId,
    }, Meteor.log.info(`cleared Presentations Collection (meetingId: ${meetingId}!`));
  } else {
    return Meteor.Presentations.remove({}, Meteor.log.info('cleared Presentations Collection (all meetings)!'));
  }
};

// --------------------------------------------------------------------------------------------
// end Private methods on server
// --------------------------------------------------------------------------------------------
