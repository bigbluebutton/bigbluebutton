import Slides from '/imports/api/slides';

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
