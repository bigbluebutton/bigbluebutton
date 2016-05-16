import { eventEmitter } from '/imports/startup/server';
import { removePresentationFromCollection } from './removePresentationFromCollection';
import { addPresentationToCollection } from './addPresentationToCollection';
import { displayThisSlide } from '/imports/api/slides/server/modifiers/displayThisSlide';
import { addSlideToCollection } from '/imports/api/slides/server/modifiers/addSlideToCollection';
import { appendMessageHeader, publish } from '/imports/startup/server/helpers';
import Slides from '/imports/api/slides/collection';
import Presentations from '/imports/api/presentations/collection';
import { logger } from '/imports/startup/server/logger';
import { redisConfig } from '/config';

eventEmitter.on('presentation_page_resized_message', function (arg) {
  const payload = arg.payload;
  const page = payload.page;
  if (page != null && page.id != null && page.height_ratio != null
    && page.width_ratio != null && page.x_offset != null && page.y_offset != null) {
    const slideId = page.id;
    const heightRatio = page.height_ratio;
    const widthRatio = page.width_ratio;
    const xOffset = page.x_offset;
    const yOffset = page.y_offset;
    const presentationId = slideId.split('/')[0];

    // In the case when we don't resize, but switch a slide, this message
    // follows a 'presentation_page_changed' and all these properties are already set.
    let currentSlide = Slides.findOne(
      { presentationId: presentationId,
        'slide.current': true, });
    if (currentSlide) {
      currentSlide = currentSlide.slide;
    }

    if (currentSlide != null && (currentSlide.height_ratio != heightRatio ||
      currentSlide.width_ratio != widthRatio ||
      currentSlide.x_offset != xOffset ||
      currentSlide.y_offset != yOffset)) {
      Slides.update({
        presentationId: presentationId,
        'slide.current': true,
      }, {
        $set: {
          'slide.height_ratio': heightRatio,
          'slide.width_ratio': widthRatio,
          'slide.x_offset': xOffset,
          'slide.y_offset': yOffset,
        },
      });
    }
  }

  return arg.callback();
});

eventEmitter.on('presentation_page_changed_message', function (arg) {
  const newSlide = arg.payload.page;
  const meetingId = arg.payload.meeting_id;
  if (newSlide != null && newSlide.id != null && meetingId != null) {
    displayThisSlide(meetingId, newSlide.id, newSlide);
  }

  return arg.callback();
});

eventEmitter.on('presentation_removed_message', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const presentationId = arg.payload.presentation_id;
  if (meetingId != null && presentationId != null) {
    removePresentationFromCollection(meetingId, presentationId);
  }

  return arg.callback();
});

eventEmitter.on('presentation_shared_message', function (arg) {
  const payload = arg.payload;
  const meetingId = payload.meeting_id;
  if (payload.presentation != null && payload.presentation.id != null && meetingId != null) {
    const presentationId = payload.presentation.id;

    // change the currently displayed presentation to presentation.current = false
    Presentations.update({
      'presentation.current': true,
      meetingId: meetingId,
    }, {
      $set: {
        'presentation.current': false,
      },
    });

    //update(if already present) entirely the presentation with the fresh data
    removePresentationFromCollection(meetingId, presentationId);
    addPresentationToCollection(meetingId, payload.presentation);
    const pages = payload.presentation.pages;
    for (j = 0; j < pages.length; j++) {
      const slide = pages[j];
      addSlideToCollection(
        meetingId,
        presentationId,
        slide
      );
    }
  }

  return arg.callback();
});

eventEmitter.on('get_presentation_info_reply', function (arg) {
  if (arg.payload.requester_id === 'nodeJSapp') {
    const payload = arg.payload;
    const meetingId = payload.meeting_id;
    const presentations = payload.presentations;
    for (let k = 0; k < payload.presentations.length; k++) {
      const presentation = presentations[k];
      addPresentationToCollection(meetingId, presentation);
      const pages = presentation.pages;
      for (let l = 0; l < pages.length; l++) {
        const page = pages[l];

        //add the slide to the collection
        addSlideToCollection(meetingId, presentation.id, page);

        //request for shapes
        const whiteboardId = `${presentation.id}/${page.num}`;

        //logger.info "the whiteboard_id here is:" + whiteboardId

        const replyTo = `${meetingId}/nodeJSapp`;
        let message = {
          payload: {
            meeting_id: meetingId,
            requester_id: 'nodeJSapp',
            whiteboard_id: whiteboardId,
            reply_to: replyTo,
          },
        };
        if (!!whiteboardId && !!meetingId) {
          message = appendMessageHeader('request_whiteboard_annotation_history_request', message);
          publish(redisConfig.channels.toBBBApps.whiteboard, message);
        } else {
          logger.info('did not have enough information to send a user_leaving_request');
        }
      }
    }

    return arg.callback();
  }
});

