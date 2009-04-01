package org.bigbluebutton.conference.service.archive.playback

interface IPlaybackNotifier {
	def sendMessage(Map message)
	def notifierName()	
}
