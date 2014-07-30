Meteor.methods
  addSlideToCollection: (meetingId, presentationId, slideObject) ->
    unless Meteor.Slides.findOne({meetingId: meetingId, "slide.id": slideObject.id})?
      entry =
        meetingId: meetingId
        presentationId: presentationId
        slide:
          height_ratio: slideObject.height_ratio
          y_offset: slideObject.y_offset
          num: slideObject.num
          x_offset: slideObject.x_offset
          current: slideObject.current
          png_uri: slideObject.png_uri
          txt_uri: slideObject.txt_uri
          id: slideObject.id
          width_ratio: slideObject.width_ratio
          swf_uri: slideObject.swf_uri
          thumb_uri: slideObject.thumb_uri

      id = Meteor.Slides.insert(entry)
      console.log "added slide id =[#{id}]:#{slideObject.id} in #{meetingId}. Now there are
       #{Meteor.Slides.find({meetingId: meetingId}).count()} slides in the meeting"

  removeSlideFromCollection: (meetingId, slideId) ->
    if meetingId? and slideId? and Meteor.Slides.findOne({meetingId: meetingId, "slide.id": slideId})?
      id = Meteor.Slides.findOne({meetingId: meetingId, "slide.id": slideId})
      if id?
        Meteor.Slides.remove(id._id)
        console.log "----removed slide[" + slideId + "] from " + meetingId
