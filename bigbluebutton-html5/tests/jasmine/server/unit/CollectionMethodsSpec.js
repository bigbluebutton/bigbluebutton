describe('Collections', function () {
  beforeEach(function () {
    MeteorStubs.install();
  });

  afterEach(function () {
    MeteorStubs.uninstall();
  });

  //----------------------------------------------------------------------
  // publish.coffee
  //----------------------------------------------------------------------

  it('should all be correctly handled by remove() after calling clearCollections()', function () {
    spyOn(Users, 'remove');
    spyOn(Chat, 'remove');
    spyOn(Meetings, 'remove');
    spyOn(Shapes, 'remove');
    spyOn(Slides, 'remove');
    spyOn(Presentations, 'remove');

    clearUsersCollection();
    clearChatCollection();
    clearMeetingsCollection();
    clearShapesCollection();
    clearSlidesCollection();
    clearPresentationsCollection();

    expect(Users.remove).toHaveBeenCalled();
    expect(Chat.remove).toHaveBeenCalled();
    expect(Meetings.remove).toHaveBeenCalled();
    expect(Shapes.remove).toHaveBeenCalled();
    expect(Slides.remove).toHaveBeenCalled();
    expect(Presentations.remove).toHaveBeenCalled();
  });

  //----------------------------------------------------------------------
  // chat.coffee
  //----------------------------------------------------------------------

  it('should be handled correctly by insert() on calling addChatToCollection()' +
    ' in case of private chat', function () {
    spyOn(Users, 'findOne').and.callFake(function (doc) {
      if (doc.userId == 'user001') return { userId: 'user001' };
      else if (doc.userId == 'user002') return { userUd: 'user002' };
    });

    spyOn(Chat, 'insert');

    addChatToCollection('meeting001', {
      from_time: '123',
      from_userid: 'user001',
      to_userid: 'user002',
      chat_type: 'PRIVATE_CHAT',
      message: 'Hello!',
      to_username: 'Anton',
      from_tz_offset: '240',
      from_color: '0x000000',
      from_username: 'Maxim',
      from_lang: 'en',
    });

    expect(Chat.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      message: {
        chat_type: 'PRIVATE_CHAT',
        message: 'Hello!',
        to_username: 'Anton',
        from_tz_offset: '240',
        from_color: '0x000000',
        to_userid: 'user002',//not "dbid002"
        from_userid: 'user001',//not "dbid001"
        from_time: '123',
        from_username: 'Maxim',
        from_lang: 'en',
      },
    });
  });

  it('should be handled correctly by insert() on calling ' +
    'addChatToCollection() in case of public chat', function () {
    spyOn(Users, 'findOne').and.callFake(function (doc) {
      if (doc.userId == 'user001') return { _id: 'dbid001' };
      else if (doc.userId == 'user002') return { _id: 'dbid002' };
    });

    spyOn(Chat, 'insert');

    addChatToCollection('meeting001', {
      from_time: '123',
      from_userid: 'user001',
      to_userid: 'public_chat_userid',
      chat_type: 'PUBLIC_CHAT',
      message: 'Hello!',
      to_username: 'public_chat_username',
      from_tz_offset: '240',
      from_color: '0x000000',
      from_username: 'Maxim',
      from_lang: 'en',
    });

    expect(Chat.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      message: {
        chat_type: 'PUBLIC_CHAT',
        message: 'Hello!',
        to_username: 'public_chat_username',
        from_tz_offset: '240',
        from_color: '0x000000',
        to_userid: 'public_chat_userid',
        from_userid: 'user001',
        from_time: '123',
        from_username: 'Maxim',
        from_lang: 'en',
      },
    });
  });

  //----------------------------------------------------------------------
  // meetings.coffee
  //----------------------------------------------------------------------

  it(
    'should not be updated on calling addMeetingToCollection() if ' +
    'the meeting is already in the collection', function () {
    spyOn(Meetings, 'findOne').and.callFake(function (doc) {
      if (doc.meetingId == 'meeting001') return { meetingId: 'meeting001' };
      else return undefined;
    });

    spyOn(Meetings, 'insert');

    addMeetingToCollection('meeting001', 'Demo Meeting', false, '12345', '0');

    expect(Meetings.insert).not.toHaveBeenCalled();
  });

  it(
    'should be handled correctly by insert() on calling addMeetingToCollection() ' +
    'with a brand new meeting', function () {
    spyOn(Meetings, 'findOne').and.returnValue(undefined);//collection is empty
    spyOn(Meetings, 'insert');

    addMeetingToCollection('meeting001', 'Demo Meeting', false, '12345', '0');

    expect(Meetings.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      meetingName: 'Demo Meeting',
      intendedForRecording: false,
      currentlyBeingRecorded: false,//default value
      voiceConf: '12345',
      duration: '0',
    });
  });

  it(
    'should not be touched on calling removeMeetingFromCollection() ' +
    'if there is no wanted meeting in the collection', function () {
    spyOn(Meetings, 'findOne').and.returnValue(undefined);//collection is empty
    spyOn(Meetings, 'remove');

    removeMeetingFromCollection('meeting001');

    expect(Meetings.remove).not.toHaveBeenCalled();
  });

  //TODO: emulate a find() call
  /*it("should be correctly updated after the removeMeetingFromCollection() call", function () {
    spyOn(Meetings, "findOne").and.callFake(function(doc) {
      if(doc.meetingId == "meeting001") return { _id: "id001", meetingId: "meeting001" };
      else return undefined;
    });

    spyOn(Meetings, "remove");

    removeMeetingFromCollection("meeting001");

    expect(Meetings.remove).toHaveBeenCalled();
  });*/

  //----------------------------------------------------------------------
  // shapes.coffee
  //----------------------------------------------------------------------

  // addShapeToCollection()
  it(
    'should be handled correctly by insert() on calling addShapeToCollection() ' +
    'with a text', function () {
    spyOn(Shapes, 'find').and.returnValue({
      count: function () {
        return 1;
      },
    });
    spyOn(Shapes, 'insert');

    addShapeToCollection('meeting001', 'whiteboard001', {
      shape_type: 'text',
      status: 'textPublished',
      shape: {
        type: 'text',
        textBoxHeight: 24.5,
        backgroundColor: 16777215,
        fontColor: 0,
        status: 'textPublished',
        dataPoints: '36.5,55.0',
        x: 36.5,
        textBoxWidth: 36.0,
        whiteboardId: 'whiteboard001',
        fontSize: 18,
        id: 'shape001',
        y: 55.0,
        calcedFontSize: 3.6,
        text: 'Hello World!',
        background: true,
      },
    });

    expect(Shapes.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      whiteboardId: 'whiteboard001',
      shape: {
        type: 'text',
        textBoxHeight: 24.5,
        backgroundColor: 16777215,
        fontColor: 0,
        status: 'textPublished',
        dataPoints: '36.5,55.0',
        x: 36.5,
        textBoxWidth: 36.0,
        whiteboardId: 'whiteboard001',
        fontSize: 18,
        id: 'shape001',
        y: 55.0,
        calcedFontSize: 3.6,
        text: 'Hello World!',
        background: true,
      },
    });
  });

  it(
    'should be handled correctly by insert() on calling addShapeToCollection() with a ' +
    'finished standard shape', function () {
    spyOn(Shapes, 'find').and.returnValue({
      count: function () {
        return 1;
      },
    });
    spyOn(Shapes, 'insert');

    addShapeToCollection('meeting001', 'whiteboard001', {
      wb_id: 'whiteboard001',
      shape_type: 'rectangle',
      status: 'DRAW_END',
      id: 'shape001',
      shape: {
        type: 'rectangle',
        status: 'DRAW_END',
        points: [60.0, 17.0, 73.0, 57.5],
        whiteboardId: 'whiteboard001',
        id: 'shape001',
        square: false,
        transparency: false,
        thickness: 10,
        color: 0,
      },
    });

    expect(Shapes.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      whiteboardId: 'whiteboard001',
      shape: {
        wb_id: 'whiteboard001',
        shape_type: 'rectangle',
        status: 'DRAW_END',
        id: 'shape001',
        shape: {
          type: 'rectangle',
          status: 'DRAW_END',
          points: [60.0, 17.0, 73.0, 57.5],
          whiteboardId: 'whiteboard001',
          id: 'shape001',
          square: false,
          transparency: false,
          thickness: 10,
          color: 0,
        },
      },
    });
  });

  it(
    'should be handled correctly by insert() on calling addShapeToCollection() ' +
    'with a pencil being used', function () {
    spyOn(Shapes, 'find').and.returnValue({
      count: function () {
        return 1;
      },
    });
    spyOn(Shapes, 'insert');

    addShapeToCollection('meeting001', 'whiteboard001', {
      wb_id: 'whiteboard001',
      shape_type: 'pencil',
      status: 'DRAW_START',
      id: 'shape001',
      shape: {
        type: 'pencil',
        status: 'DRAW_START',
        points: [35.8, 63.6, 36.1, 63.4, 36.2, 63.2],
        whiteboardId: 'whiteboard001',
        id: 'shape001',
        square: undefined,
        transparency: false,
        thickness: 10,
        color: 0,
      },
    });

    expect(Shapes.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      whiteboardId: 'whiteboard001',
      shape: {
        wb_id: 'whiteboard001',
        shape_type: 'pencil',
        status: 'DRAW_START',
        id: 'shape001',
        shape: {
          type: 'pencil',
          status: 'DRAW_START',
          points: [35.8, 63.6, 36.1, 63.4, 36.2, 63.2],
          whiteboardId: 'whiteboard001',
          id: 'shape001',
          square: undefined,
          transparency: false,
          thickness: 10,
          color: 0,
        },
      },
    });
  });

  // removeAllShapesFromSlide()
  it(
    'should not be touched on calling removeAllShapesFromSlide() ' +
    'with undefined meetingId', function () {
    spyOn(Shapes, 'remove');
    removeAllShapesFromSlide(undefined, 'whiteboard001');
    expect(Shapes.remove).not.toHaveBeenCalled();
  });

  it(
    'should not be touched on calling removeAllShapesFromSlide() ' +
    'with undefined whiteboardId', function () {
    spyOn(Shapes, 'remove');
    removeAllShapesFromSlide('meeting001', undefined);
    expect(Shapes.remove).not.toHaveBeenCalled();
  });

  it(
    'should not be touched on calling removeAllShapesFromSlide() ' +
    'if there is no shapes on the whiteboard', function () {
    spyOn(Shapes, 'find').and.returnValue(undefined);
    spyOn(Shapes, 'remove');
    removeAllShapesFromSlide('meeting001', 'whiteboard001');
    expect(Shapes.remove).not.toHaveBeenCalled();
  });

  it(
    'should be cleared on calling removeAllShapesFromSlide() ' +
    'if there are shapes on the whiteboard', function () {
    spyOn(Shapes, 'find').and.callFake(function (doc) {
      if (doc.meetingId === 'meeting001' && doc.whiteboardId === 'whiteboard001')
        return {
          fetch: function () {
            return [{ shape: { id: 'shape001' } }];
          },
        };
      else return undefined;
    });

    spyOn(Shapes, 'findOne').and.callFake(function (doc) {
      if (
        doc.meetingId === 'meeting001' &&
        doc.whiteboardId === 'whiteboard001' &&
        doc['shape.id'] === 'shape001'
      )
        return {
          _id: 'doc001',
        };
      else return undefined;
    });

    spyOn(Shapes, 'remove');
    removeAllShapesFromSlide('meeting001', 'whiteboard001');
    expect(Shapes.remove).toHaveBeenCalledWith('doc001');
  });

  // removeShapeFromSlide()
  it(
    'should not be touched on calling removeShapeFromSlide() ' +
    'with undefined meetingId', function () {
    spyOn(Shapes, 'find').and.callFake(function (doc) {
      if (doc.meetingId === undefined && doc.whiteboardId === 'whiteboard001')
        return {
          count: function () {
            return 0;
          },
        };
      else return undefined;
    });

    spyOn(Shapes, 'findOne').and.callFake(function (doc) {
      if (
        doc.meetingId === undefined &&
        doc.whiteboardId === 'whiteboard001' &&
        doc['shape.id'] === 'shape001'
      )
        return {
          _id: 'doc001',
        };
      else return undefined;
    });

    spyOn(Shapes, 'remove');

    removeShapeFromSlide(undefined, 'whiteboard001', 'shape001');

    expect(Shapes.remove).not.toHaveBeenCalled();
  });

  it(
    'should not be touched on calling removeShapeFromSlide() ' +
    'with undefined whiteboardId', function () {
    spyOn(Shapes, 'find').and.callFake(function (doc) {
      if (doc.meetingId === 'meeting001' && doc.whiteboardId === undefined)
        return {
          count: function () {
            return 0;
          },
        };
      else return undefined;
    });

    spyOn(Shapes, 'findOne').and.callFake(function (doc) {
      if (
        doc.meetingId === 'meeting001' &&
        doc.whiteboardId === undefined &&
        doc['shape.id'] === 'shape001'
      )
        return {
          _id: 'doc001',
        };
      else return undefined;
    });

    spyOn(Shapes, 'remove');

    removeShapeFromSlide('meeting001', undefined, 'shape001');

    expect(Shapes.remove).not.toHaveBeenCalled();
  });

  it(
    'should not be touched on calling removeShapeFromSlide() ' +
    'with undefined shapeId', function () {
    spyOn(Shapes, 'find').and.callFake(function (doc) {
      if (doc.meetingId === 'meeting001' && doc.whiteboardId === 'whiteboard001')
        return {
          count: function () {
            return 0;
          },
        };
      else return undefined;
    });

    spyOn(Shapes, 'findOne').and.callFake(function (doc) {
      if (
        doc.meetingId === 'meeting001' &&
        doc.whiteboardId === 'whiteboard001' &&
        doc['shape.id'] === undefined
      )
        return {
          _id: 'doc001',
        };
      else return undefined;
    });

    spyOn(Shapes, 'remove');

    removeShapeFromSlide('meeting001', 'whiteboard001', undefined);

    expect(Shapes.remove).not.toHaveBeenCalled();
  });

  it(
    'should not be touched on calling removeShapeFromSlide() ' +
    'if there is no wanted shape on the whiteboard', function () {
    spyOn(Shapes, 'find').and.callFake(function (doc) {
      if (doc.meetingId === 'meeting001' && doc.whiteboardId === 'whiteboard001')
        return {
          count: function () {
            return 0;
          },
        };
      else return undefined;
    });

    spyOn(Shapes, 'findOne').and.callFake(function (doc) {
      if (
        doc.meetingId === 'meeting001' &&
        doc.whiteboardId === 'whiteboard001' &&
        doc['shape.id'] === 'shape001'
      )
        return undefined;
      else return {
        _id: 'doc001',
      };
    });

    spyOn(Shapes, 'remove');

    removeShapeFromSlide('meeting001', 'whiteboard001', undefined);

    expect(Shapes.remove).not.toHaveBeenCalled();
  });

  it(
    'should be updated correctly on calling removeShapeFromSlide() ' +
    'with an existing shape', function () {
    spyOn(Shapes, 'find').and.callFake(function (doc) {
      if (doc.meetingId === 'meeting001' && doc.whiteboardId === 'whiteboard001')
        return {
          count: function () {
            return 0;
          },
        };
      else return undefined;
    });

    spyOn(Shapes, 'findOne').and.callFake(function (doc) {
      if (
        doc.meetingId === 'meeting001' &&
        doc.whiteboardId === 'whiteboard001' &&
        doc['shape.id'] === 'shape001'
      )
        return {
          _id: 'doc001',
        };
      else return undefined;
    });

    spyOn(Shapes, 'remove');
    removeShapeFromSlide('meeting001', 'whiteboard001', 'shape001');
    expect(Shapes.remove).toHaveBeenCalledWith('doc001');
  });

  //----------------------------------------------------------------------
  // presentation.coffee
  //----------------------------------------------------------------------

  it(
    'should be handled correctly by insert() ' +
    'on calling addPresentationToCollection()', function () {
    spyOn(Presentations, 'findOne').and.returnValue(undefined);

    spyOn(Presentations, 'insert');

    addPresentationToCollection('meeting001', {
      id: 'presentation001',
      name: 'Presentation 001',
      current: true,
    });

    expect(Presentations.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      presentation: {
        id: 'presentation001',
        name: 'Presentation 001',
        current: true,
      },
      pointer: {
        x: 0.0,
        y: 0.0,
      },
    });
  });

  it(
    'should be handled correctly on calling addPresentationToCollection() ' +
    'when presentation is already in the collection', function () {
    spyOn(Presentations, 'findOne').and.returnValue({ _id: 'dbid001' });

    spyOn(Presentations, 'insert');

    addPresentationToCollection('meeting001', {
      id: 'presentation001',
      name: 'Presentation 001',
      current: true,
    });

    expect(Presentations.insert).not.toHaveBeenCalledWith({
      meetingId: 'meeting001',
      presentation: {
        id: 'presentation001',
        name: 'Presentation 001',
        current: true,
      },
      pointer: {
        x: 0.0,
        y: 0.0,
      },
    });
  });

  it(
    'should be handled correctly by remove() ' +
    'on calling removePresentationFromCollection', function () {
    spyOn(Presentations, 'findOne').and.returnValue({ _id: 'dbid001' });
    spyOn(Presentations, 'remove');

    removePresentationFromCollection('meeting0001', 'presentation001');

    expect(Presentations.remove).toHaveBeenCalled();
  });

  it(
    'should be handled correctly by remove() ' +
    'on calling removePresentationFromCollection', function () {
    spyOn(Presentations, 'findOne').and.returnValue(undefined);
    spyOn(Presentations, 'remove');

    removePresentationFromCollection('meeting0001', 'presentation001');

    expect(Presentations.remove).not.toHaveBeenCalled();
  });

  //----------------------------------------------------------------------
  // slides.coffee
  //----------------------------------------------------------------------

  // removeSlideFromCollection()
  it(
    'should not be touched on calling removeSlideFromCollection() ' +
    'with undefined meetingId', function () {
    spyOn(Slides, 'remove');
    removeSlideFromCollection(undefined, 'presentation001/2');
    expect(Slides.remove).not.toHaveBeenCalled();
  });

  it(
    'should not be touched on calling removeSlideFromCollection() ' +
    'with undefined slideId', function () {
    spyOn(Slides, 'remove');
    removeSlideFromCollection('meeting001', undefined);
    expect(Slides.remove).not.toHaveBeenCalled();
  });

  it(
    'should not be touched on calling removeSlideFromCollection() ' +
    'with a slide that does not exist', function () {
    spyOn(Slides, 'findOne').and.callFake(function (doc) {
      if (doc.meetingId === 'meeting001' && doc['slide.id'] === 'slide001')
        return undefined;
      else return { meetingId: 'meeting001' };
    });

    spyOn(Slides, 'remove');
    removeSlideFromCollection('meeting001', 'slide001');
    expect(Slides.remove).not.toHaveBeenCalled();
  });

  it(
    'should be handled correctly by remove() on calling removeSlideFromCollection() ' +
    'with an existing slide', function () {
    spyOn(Slides, 'findOne').and.callFake(function (doc) {
      if (doc.meetingId === 'meeting001' && doc['slide.id'] === 'slide001')
        return { _id: 'doc001' };
      else return undefined;
    });

    spyOn(Slides, 'remove');
    removeSlideFromCollection('meeting001', 'slide001');
    expect(Slides.remove).toHaveBeenCalledWith('doc001');
  });

  // addSlideToCollection()
  it(
    'should not be touched on calling addSlideToCollection() ' +
    'if the slide is already in the collection', function () {
    spyOn(Slides, 'findOne').and.callFake(function (doc) {
      if (doc.meetingId === 'meeting001' && doc['slide.id'] === 'presentation001/2')
        return { _id: 'doc001' };
      else return undefined;
    });

    spyOn(Slides, 'insert');
    addSlideToCollection('meeting001', 'presentation001', {
      id: 'presentation001/2',
    });
    expect(Slides.insert).not.toHaveBeenCalled();
  });

  it(
    'should be handled correctly by insert() on calling addSlideToCollection() ' +
    'with a brand new slide', function () {
    spyOn(Slides, 'findOne').and.callFake(function (doc) {
      if (doc.meetingId === 'meeting001' && doc['slide.id'] === 'presentation001/2')
        return undefined;
      else return { _id: 'doc001' };
    });

    spyOn(Slides, 'insert');
    addSlideToCollection('meeting001', 'presentation001', {
      height_ratio: 100,
      y_offset: 0,
      num: 2,
      x_offset: 0,
      current: true,
      png_uri: 'http://localhost/bigbluebutton/presentation/presentation001/png/2',
      txt_uri: 'http://localhost/bigbluebutton/presentation/presentation001/textfiles/slide-2.txt',
      id: 'presentation001/2',
      width_ratio: 100,
      swf_uri: 'http://localhost/bigbluebutton/presentation/presentation001/slide/2',
      thumb_uri: 'http://localhost/bigbluebutton/presentation/presentation001/thumbnail/1',
    });
    expect(Slides.insert).toHaveBeenCalledWith({
      meetingId: 'meeting001',
      presentationId: 'presentation001',
      slide: {
          height_ratio: 100,
          y_offset: 0,
          num: 2,
          x_offset: 0,
          current: true,
          png_uri: 'http://localhost/bigbluebutton/presentation/presentation001/png/2',
          txt_uri: 'http://localhost/bigbluebutton/presentation/presentation001/textfiles/' +
            'slide-2.txt',
          id: 'presentation001/2',
          width_ratio: 100,
          swf_uri: 'http://localhost/bigbluebutton/presentation/presentation001/slide/2',
          thumb_uri: 'http://localhost/bigbluebutton/presentation/presentation001/thumbnail/1',
        },
    });
  });
});
