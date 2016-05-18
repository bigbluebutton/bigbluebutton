var emptyMeetingsCollection = function () {
  Meetings.find().map(function (item) {
    Meetings.remove({ _id: item._id });
  });
};

var emptyPresentationsCollection = function () {
  Presentations.find().map(function (item) {
    Presentations.remove({ _id: item._id });
  });
};

var emptySlidesCollection = function () {
  Slides.find().map(function (item) {
    Slides.remove({ _id: item._id });
  });
};

var emptyShapesCollection = function () {
  Shapes.find().map(function (item) {
    Shapes.remove({ _id: item._id });
  });
};

var renderWhiteboardTemplate = function (title) {
  var div = document.createElement('div');
  var data = {};
  data.id = 'whiteboard';
  data.title = title;
  data.name = 'whiteboard';
  var comp = Blaze.renderWithData(Template.whiteboard, data); // loading data is optional
  Blaze.insert(comp, div);
  return div;
};

describe('whiteboard template', function () {
  beforeEach(function () {
    emptyMeetingsCollection();
    emptyPresentationsCollection();
    emptySlidesCollection();
    emptyShapesCollection();
  });

  it('should contain a pencil icon inside the title entry', function () {
    var div = renderWhiteboardTemplate('Whiteboard: default.pdf');

    expect($(div).find('.title').find('.glyphicon-pencil')[0]).toBeDefined();
  });

  it('should contain the correct title', function () {
    var div = renderWhiteboardTemplate('Whiteboard: default.pdf');

    expect($(div).find('.title:eq(0)').html()).toContain('Whiteboard: default.pdf');
  });

  // TODO: finish the following
  it('should be rendered successfully', function () {
    var meeting1 = {
      meetingId: 'meeting001',
      meetingName: 'first meeting',
    };
    Meetings.insert(meeting1);

    var presentation1 = {
      meetingId: 'meeting001',
      presentation: {
        id: 'presentation001',
        name: 'default.pdf',
        current: true,
      },
    };
    Presentations.insert(presentation1);

    var slide1 = {
      meetingId: 'meeting001',
      presentationId: 'presentation001',
      slide: {
        id: 'slide001',
        num: 1,
        current: true,
        width_ratio: 100.0,
        height_ratio: 100.0,
        x_offset: 0.0,
        y_offset: 0.0,
        png_uri: 'http://bigbluebutton.org/wp-content/uploads/2013/05/bbb-overview.png',
      },
    };
    Slides.insert(slide1);

    var div = document.createElement('DIV');
    Blaze.render(Template.main, div);

    expect($(div).find('#whiteboard-navbar')[0]).toBeDefined();
  });
});
