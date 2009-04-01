
package org.bigbluebutton.conference.service.voice


interface IVoiceServer{
	def start()
	def stop()
	def initializeRoom(room)
	def mute(user, conference, mute)	
	def mute(conference, mute)
	def kick(user, conference)
	def kick(conference)
}
