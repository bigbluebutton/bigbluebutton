
package org.bigbluebutton.conference.service.chat

interface IChatRoomListener {
	def getName()
	def newChatMessage(message)
}
