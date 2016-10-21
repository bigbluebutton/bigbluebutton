import probe from 'probe-image-size';
import { check } from 'meteor/check';
import Slides from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';
import { SVG, PNG } from '/imports/utils/mimeTypes';

const SUPPORTED_TYPES = [SVG, PNG];

export default function addSlideToCollection(meetingId, presentationId, slide) {
  check(meetingId, String);
  check(presentationId, String);
  check(slide, Object);

  const selector = {
    meetingId,
    presentationId,
    'slide.id': slide.id,
  };

  const imageUri = slide.svg_uri || slide.png_uri;

  const modifier = {
    $set: {
      meetingId: meetingId,
      presentationId: presentationId,
      slide: {
        height_ratio: slide.height_ratio,
        y_offset: slide.y_offset,
        num: slide.num,
        x_offset: slide.x_offset,
        current: slide.current,
        img_uri: imageUri,
        txt_uri: slide.txt_uri,
        id: slide.id,
        width_ratio: slide.width_ratio,
        swf_uri: slide.swf_uri,
        thumb_uri: slide.thumb_uri,
        width: slide.width,
        height: slide.height,
      },
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding slide to collection: ${err}`);
    }

    const { insertedId } = numChanged;

    if (insertedId) {
      fetchImageSizes(insertedId, imageUri);
      return Logger.info(`Added slide id=${insertedId} to presentation=${presentationId}`);
    }
  };

  return Slides.upsert(selector, modifier, cb);
};

const fetchImageSizes = (slideId, imageUri) =>
  probe(imageUri)
  .then(result => {
    if (!SUPPORTED_TYPES.includes(result.mime)) {
      throw `Invalid image type, received ${result.mime} expecting ${SUPPORTED_TYPES.join()}`;
    }

    return Slides.update(slideId, {
      $set: {
        width: result.width,
        height: result.height,
      },
    });
  })
  .catch(reason => {
    Logger.error(`Error parsing image size. ${reason}. slide=${slide.id} uri=${imageUri}`);
    return reason;
  });
