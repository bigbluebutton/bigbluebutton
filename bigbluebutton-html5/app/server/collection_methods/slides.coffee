# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@displayThisSlide = (meetingId, newSlideId, slideObject) ->
	presentationId = newSlideId.split("/")[0] # grab the presentationId part of the slideId
	# change current to false for the old slide
	Meteor.Slides.update({presentationId: presentationId, "slide.current": true}, {$set: {"slide.current": false}})
	# for the new slide: remove the version which came with presentation_shared_message from the Collection
	# to avoid using old data (this message contains everything we need for the new slide)
	removeSlideFromCollection(meetingId, newSlideId)
	# add the new slide to the collection
	addSlideToCollection(meetingId, presentationId, slideObject)


@addSlideToCollection = (meetingId, presentationId, slideObject) ->
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
		#Meteor.log.info "added slide id =[#{id}]:#{slideObject.id} in #{meetingId}. Now there are #{Meteor.Slides.find({meetingId: meetingId}).count()} slides in the meeting"

@removeSlideFromCollection = (meetingId, slideId) ->
	if meetingId? and slideId? and Meteor.Slides.findOne({meetingId: meetingId, "slide.id": slideId})?
		id = Meteor.Slides.findOne({meetingId: meetingId, "slide.id": slideId})
		if id?
			Meteor.Slides.remove(id._id)
			Meteor.log.info "----removed slide[" + slideId + "] from " + meetingId

# called on server start and meeting end
@clearSlidesCollection = (meetingId) ->
	if meetingId?
		Meteor.Slides.remove({meetingId: meetingId}, Meteor.log.info "cleared Slides Collection (meetingId: #{meetingId}!")
	else
		Meteor.Slides.remove({}, Meteor.log.info "cleared Slides Collection (all meetings)!")

# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------
