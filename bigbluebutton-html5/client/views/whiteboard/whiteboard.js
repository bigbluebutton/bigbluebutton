let fakeUpload;

// scale the whiteboard to adapt to the resized window
this.scaleWhiteboard = function (callback) {
  let adjustedDimensions;
  adjustedDimensions = scaleSlide(getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'));
  if (typeof whiteboardPaperModel !== 'undefined' && whiteboardPaperModel !== null) {
    whiteboardPaperModel.scale(adjustedDimensions.width, adjustedDimensions.height);
  }

  if (callback) {
    callback();
  }
};

Template.whiteboard.helpers({
  isPollStarted() {
    if (BBB.isPollGoing(getInSession('userId'))) {
      return true;
    } else {
      return false;
    }
  },

  hasNoPresentation() {
    return Meteor.Presentations.findOne({
      'presentation.current': true,
    });
  },

  forceSlideShow() {
    return reactOnSlideChange();
  },

  clearSlide() {
    let ref;

    //clear the slide
    if (typeof whiteboardPaperModel !== 'undefined' && whiteboardPaperModel !== null) {
      whiteboardPaperModel.removeAllImagesFromPaper();
    }

    //hide the cursor
    return typeof whiteboardPaperModel !== 'undefined' && whiteboardPaperModel !== null ? (ref = whiteboardPaperModel.cursor) != null ? ref.remove() : void 0 : void 0;
  },
});

Template.whiteboard.events({
  'click .whiteboardFullscreenButton'(event, template) {
    return enterWhiteboardFullscreen();
  },

  'click .exitFullscreenButton'(event, template) {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      return document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      return document.webkitExitFullscreen();
    }
  },

  'click .sadEmojiButton.inactiveEmojiButton'(event) {
    if ($('.sadEmojiButton').css('opacity') === '1') {
      BBB.setEmojiStatus(
        BBB.getMeetingId(),
        getInSession('userId'),
        getInSession('userId'),
        getInSession('authToken'),
        'sad'
      );
      $('.FABTriggerButton').blur();
      return toggleEmojisFAB();
    }
  },

  'click .happyEmojiButton.inactiveEmojiButton'(event) {
    if ($('.happyEmojiButton').css('opacity') === '1') {
      BBB.setEmojiStatus(
        BBB.getMeetingId(),
        getInSession('userId'),
        getInSession('userId'),
        getInSession('authToken'),
        'happy'
      );
      $('.FABTriggerButton').blur();
      return toggleEmojisFAB();
    }
  },

  'click .confusedEmojiButton.inactiveEmojiButton'(event) {
    if ($('.confusedEmojiButton').css('opacity') === '1') {
      BBB.setEmojiStatus(
        BBB.getMeetingId(),
        getInSession('userId'),
        getInSession('userId'),
        getInSession('authToken'),
        'confused'
      );
      $('.FABTriggerButton').blur();
      return toggleEmojisFAB();
    }
  },

  'click .neutralEmojiButton.inactiveEmojiButton'(event) {
    if ($('.neutralEmojiButton').css('opacity') === '1') {
      BBB.setEmojiStatus(
        BBB.getMeetingId(),
        getInSession('userId'),
        getInSession('userId'),
        getInSession('authToken'),
        'neutral'
      );
      $('.FABTriggerButton').blur();
      return toggleEmojisFAB();
    }
  },

  'click .awayEmojiButton.inactiveEmojiButton'(event) {
    if ($('.awayEmojiButton').css('opacity') === '1') {
      BBB.setEmojiStatus(
        BBB.getMeetingId(),
        getInSession('userId'),
        getInSession('userId'),
        getInSession('authToken'),
        'away'
      );
      $('.FABTriggerButton').blur();
      return toggleEmojisFAB();
    }
  },

  'click .raiseHandEmojiButton.inactiveEmojiButton'(event) {
    if ($('.raiseHandEmojiButton').css('opacity') === '1') {
      BBB.setEmojiStatus(
        BBB.getMeetingId(),
        getInSession('userId'),
        getInSession('userId'),
        getInSession('authToken'),
        'raiseHand'
      );
      $('.FABTriggerButton').blur();
      return toggleEmojisFAB();
    }
  },

  'click .activeEmojiButton'(event) {
    if ($('.activeEmojiButton').css('opacity') === '1') {
      BBB.setEmojiStatus(
        BBB.getMeetingId(),
        getInSession('userId'),
        getInSession('userId'),
        getInSession('authToken'),
        'none'
      );
      $('.FABTriggerButton').blur();
      return toggleEmojisFAB();
    }
  },

  'click .FABTriggerButton'(event) {
    $('.FABTriggerButton').blur();
    return toggleEmojisFAB();
  },
});

Template.whiteboardControls.helpers({
  presentationProgress() {
    let currentPresentation, currentSlideNum, ref, ref1, totalSlideNum;
    currentPresentation = Meteor.Presentations.findOne({
      'presentation.current': true,
    });
    currentSlideNum = (ref = Meteor.Slides.findOne({
      presentationId: currentPresentation != null ? currentPresentation.presentation.id : void 0,
      'slide.current': true,
    })) != null ? ref.slide.num : void 0;
    totalSlideNum = (ref1 = Meteor.Slides.find({
      presentationId: currentPresentation != null ? currentPresentation.presentation.id : void 0,
    })) != null ? ref1.count() : void 0;
    if (currentSlideNum !== void 0) {
      return `${currentSlideNum}/${totalSlideNum}`;
    } else {
      return '';
    }
  },
});

Template.whiteboardControls.events({
  'click .whiteboard-buttons-slide > .prev'(event) {
    return BBB.goToPreviousPage();
  },

  'click .whiteboard-buttons-slide > .next'(event) {
    return BBB.goToNextPage();
  },

  'click .switchSlideButton'(event) {
    return $('.tooltip').hide();
  },
});

Template.polling.events({
  'click .pollButtons'(event) {
    let _id, _key;
    _key = this.label;
    _id = this.answer;
    return BBB.sendPollResponseMessage(_key, _id);
  },
});

Template.polling.rendered = function () {
  return scaleWhiteboard();
};

Template.polling.destroyed = function () {
  return setTimeout(scaleWhiteboard, 0);
};

Template.whiteboardControls.rendered = function () {
  return scaleWhiteboard();
};

Template.whiteboardControls.destroyed = function () {
  return setTimeout(scaleWhiteboard, 0);
};

Template.whiteboard.rendered = function () {
  $('#whiteboard').resizable({
    handles: 'e',
    minWidth: 150,
    resize() {
      return adjustChatInputHeight();
    },

    start() {
      if ($('#chat').width() / $('#panels').width() > 0.2) { // chat shrinking can't make it smaller than one fifth of the whiteboard-chat area
        return $('#whiteboard').resizable('option', 'maxWidth', $('#panels').width() - 200); // gives the chat enough space (200px)
      } else {
        return $('#whiteboard').resizable('option', 'maxWidth', $('#whiteboard').width());
      }
    },

    stop() {
      $('#whiteboard').css('width', `${100 * $('#whiteboard').width() / $('#panels').width()}%`); // transforms width to %
      return $('#whiteboard').resizable('option', 'maxWidth', null);
    },
  });

  // whiteboard element needs to be available
  Meteor.NotificationControl = new NotificationControl('notificationArea');

  return $(document).foundation(); // initialize foundation javascript
};

Template.presenterUploaderControl.created = function () {
  this.isOpen = new ReactiveVar(false);
  this.files = new ReactiveList({
    sort(a, b) {
      // Put the ones who still uploading first
      let ref, ref1;
      return (ref = a.isUploading === b.isUploading) != null ? ref : {
        0: (ref1 = a.isUploading) != null ? ref1 : -{
          1: 1,
        },
      };
    },
  });
  return this.presentations = Meteor.Presentations.find({}, {
    sort: {
      'presentation.current': -1,
      'presentation.name': 1,
    },
    fields: {
      presentation: 1,
    },
  });
};

fakeUpload = function (file, list) {
  return setTimeout((() => {
    file.uploadedSize = file.uploadedSize + (Math.floor(Math.random() * file.size + file.uploadedSize) / 10);
    if (!(file.size > file.uploadedSize)) {
      file.uploadedSize = file.size;
      file.isUploading = false;
    }

    list.update(file.name, file);
    if (file.isUploading === true) {
      return fakeUpload(file, list);
    } else {
      return list.remove(file.name); // TODO: Here we should remove and update te presentation on mongo
    }
  }), 200);
};

Template.presenterUploaderControl.events({
  'click .js-open'(event, template) {
    return template.isOpen.set(true);
  },

  'click .js-close'(event, template) {
    return template.isOpen.set(false);
  },

  'dragover [data-dropzone]'(e) {
    e.preventDefault();
    return $(e.currentTarget).addClass('hover');
  },

  'dragleave [data-dropzone]'(e) {
    e.preventDefault();
    return $(e.currentTarget).removeClass('hover');
  },

  'drop [data-dropzone], change [data-dropzone] > input[type="file"]'(e, template) {
    let files;
    e.preventDefault();
    files = (e.originalEvent.dataTransfer || e.originalEvent.target).files;
    return _.each(files, file => {
      file.isUploading = true;
      file.uploadedSize = 0;
      file.percUploaded = 0;
      template.files.insert(file.name, file);
      return fakeUpload(file, template.files);
    });
  },
});

Template.presenterUploaderControl.helpers({
  isOpen() {
    return Template.instance().isOpen.get();
  },

  files() {
    return Template.instance().files.fetch();
  },

  presentations() {
    return Template.instance().presentations.fetch().map(x => {
      return x.presentation;
    });
  },
});

Template.presenterUploaderControlFileListItem.helpers({
  percUploaded() {
    return Math.round((this.uploadedSize / this.size) * 100);
  },
});

Template.presenterUploaderControlPresentationListItem.events({
  'click [data-action-show]'(event, template) {
    return console.info('Should show the file `' + this.name + '`');
  },

  'click [data-action-delete]'(event, template) {
    return console.info('Should delete the file `' + this.name + '`');
  },
});
