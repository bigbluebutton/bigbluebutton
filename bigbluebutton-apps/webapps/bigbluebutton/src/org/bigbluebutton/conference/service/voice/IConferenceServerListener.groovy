
package org.bigbluebutton.conference.service.voice


interface IConferenceServerListener{
	def joined(room, participant, name, muted, talking)
	def left(room, participant)
	def mute(participant, room, mute)
	def talk(participant, room, talk)	
}
