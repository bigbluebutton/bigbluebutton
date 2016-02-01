// --------------------------------------------------------------------------------------------
// Private methods on server
// --------------------------------------------------------------------------------------------
this.displayThisSlide = function(meetingId, newSlideId, slideObject) {
  let presentationId;
  presentationId = newSlideId.split("/")[0]; // grab the presentationId part of the slideId
  // change current to false for the old slide
  Meteor.Slides.update({
    presentationId: presentationId,
    "slide.current": true
  }, {
    $set: {
      "slide.current": false
    }
  });
  // for the new slide: remove the version which came with presentation_shared_message from the Collection
	// to avoid using old data (this message contains everything we need for the new slide)
  removeSlideFromCollection(meetingId, newSlideId);
  // add the new slide to the collection
  return addSlideToCollection(meetingId, presentationId, slideObject);
};

this.addSlideToCollection = function(meetingId, presentationId, slideObject) {
  let entry, id;
  if(Meteor.Slides.findOne({
    meetingId: meetingId,
    "slide.id": slideObject.id
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
        img_uri: slideObject.svg_uri !== void 0 ? slideObject.svg_uri : slideObject.png_uri,
        txt_uri: slideObject.txt_uri,
        id: slideObject.id,
        width_ratio: slideObject.width_ratio,
        swf_uri: slideObject.swf_uri,
        thumb_uri: slideObject.thumb_uri
      }
    };
    return id = Meteor.Slides.insert(entry);
    //Meteor.log.info "added slide id =[#{id}]:#{slideObject.id} in #{meetingId}. Now there are #{Meteor.Slides.find({meetingId: meetingId}).count()} slides in the meeting"
  }
};

this.removeSlideFromCollection = function(meetingId, slideId) {
  let id;
  if((meetingId != null) && (slideId != null) && (Meteor.Slides.findOne({
    meetingId: meetingId,
    "slide.id": slideId
  }) != null)) {
    id = Meteor.Slides.findOne({
      meetingId: meetingId,
      "slide.id": slideId
    });
    if(id != null) {
      Meteor.Slides.remove(id._id);
      return Meteor.log.info(`----removed slide[${slideId}] from ${meetingId}`);
    }
  }
};

// called on server start and meeting end
this.clearSlidesCollection = function(meetingId) {
  if(meetingId != null) {
    return Meteor.Slides.remove({
      meetingId: meetingId
    }, Meteor.log.info(`cleared Slides Collection (meetingId: ${meetingId}!`));
  } else {
    return Meteor.Slides.remove({}, Meteor.log.info("cleared Slides Collection (all meetings)!"));
  }
};

// --------------------------------------------------------------------------------------------
// end Private methods on server
// --------------------------------------------------------------------------------------------
