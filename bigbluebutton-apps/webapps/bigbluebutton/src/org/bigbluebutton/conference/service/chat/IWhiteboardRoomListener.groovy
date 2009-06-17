
package org.bigbluebutton.conference.service.whiteboard

interface IWhiteboardRoomListener {
	def getName()
	def newWhiteboardMessage(message)
}
