import { Slides } from '/imports/startup/collections';
import { logger } from '/imports/startup/server/logger';

export function displayThisSlide(meetingId, newSlideId, slideObject) {
  let presentationId;
  presentationId = newSlideId.split('/')[0]; // grab the presentationId part of the slideId
  // change current to false for the old slide
  Slides.update({
    presentationId: presentationId,
    'slide.current': true,
  }, {
    $set: {
      'slide.current': false,
    },
  });

  //change current to true for the new slide and update its ratios and offsets
  Slides.update({
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

export function addSlideToCollection(meetingId, presentationId, slideObject) {
  let entry, id;
  if (Slides.findOne({
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
    return id = Slides.insert(entry);

    //logger.info "added slide id =[#{id}]:#{slideObject.id} in #{meetingId}. Now there 
    // are #{Slides.find({meetingId: meetingId}).count()} slides in the meeting"
  }
};

// called on server start and meeting end
export function clearSlidesCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Slides.remove({
      meetingId: meetingId,
    }, logger.info(`cleared Slides Collection (meetingId: ${meetingId}!`));
  } else {
    return Slides.remove({}, logger.info('cleared Slides Collection (all meetings)!'));
  }
};

