// --------------------------------------------------------------------------------------------
// Private methods on server
// --------------------------------------------------------------------------------------------
this.displayThisSlide = function (meetingId, newSlideId, slideObject) {
  let presentationId;
  presentationId = newSlideId.split('/')[0]; // grab the presentationId part of the slideId
  // change current to false for the old slide
  Meteor.Slides.update({
    presentationId: presentationId,
    'slide.current': true,
  }, {
    $set: {
      'slide.current': false,
    },
  });

  //change current to true for the new slide and update its ratios and offsets
  Meteor.Slides.update({
    presentationId: presentationId,
    'slide.id': newSlideId,
  }, {
    $set: {
      'slide.current': true,
      'slide.height_ratio': slideObject.height_ratio,
      'slide.width_ratio': slideObject.width_ratio,
      'slide.x_offset': slideObject.x_offset,
      'slide.y_offset': slideObject.y_offset,
    },
  });
};

this.addSlideToCollection = function (meetingId, presentationId, slideObject) {
  let entry, id;
  if (Meteor.Slides.findOne({
    meetingId: meetingId,
    'slide.id': slideObject.id,
  }) == null) {
    entry = {
      meetingId: meetingId,
      presentationId: presentationId,
      slide: {
        height_ratio: slideObject.height_ratio,
        y_offset: slideObject.y_offset,
        num: slideObject.num,
        x_offset: slideObject.x_offset,
        current: slideObject.current,
        img_uri: slideObject.svg_uri != null ? slideObject.svg_uri : slideObject.png_uri,
        txt_uri: slideObject.txt_uri,
        id: slideObject.id,
        width_ratio: slideObject.width_ratio,
        swf_uri: slideObject.swf_uri,
        thumb_uri: slideObject.thumb_uri,
      },
    };
    return id = Meteor.Slides.insert(entry);

    //Meteor.log.info "added slide id =[#{id}]:#{slideObject.id} in #{meetingId}. Now there are #{Meteor.Slides.find({meetingId: meetingId}).count()} slides in the meeting"
  }
};

// called on server start and meeting end
this.clearSlidesCollection = function (meetingId) {
  if (meetingId != null) {
    return Meteor.Slides.remove({
      meetingId: meetingId,
    }, Meteor.log.info(`cleared Slides Collection (meetingId: ${meetingId}!`));
  } else {
    return Meteor.Slides.remove({}, Meteor.log.info('cleared Slides Collection (all meetings)!'));
  }
};

// --------------------------------------------------------------------------------------------
// end Private methods on server
// --------------------------------------------------------------------------------------------
