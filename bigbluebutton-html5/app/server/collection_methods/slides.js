this.displayThisSlide = function(meetingId, newSlideId, slideObject) {
  let presentationId;
  presentationId = newSlideId.split("/")[0];
  Meteor.Slides.update({
    presentationId: presentationId,
    "slide.current": true
  }, {
    $set: {
      "slide.current": false
    }
  });
  removeSlideFromCollection(meetingId, newSlideId);
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

this.clearSlidesCollection = function(meetingId) {
  if(meetingId != null) {
    return Meteor.Slides.remove({
      meetingId: meetingId
    }, Meteor.log.info(`cleared Slides Collection (meetingId: ${meetingId}!`));
  } else {
    return Meteor.Slides.remove({}, Meteor.log.info("cleared Slides Collection (all meetings)!"));
  }
};
