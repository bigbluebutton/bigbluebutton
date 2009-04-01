
package org.bigbluebutton.conference.service.voice

interface IVoiceRoomListener {
	def getName()
	
	def joined(participant, name, muted, talking)
	def left(participant)
	def mute(participant, mute)
	def talk(participant, talk)
}
