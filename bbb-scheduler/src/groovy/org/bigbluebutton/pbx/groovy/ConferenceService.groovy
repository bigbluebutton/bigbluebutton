package org.bigbluebutton.pbx.groovy;

class ConferenceService {

	def findByNumber = {
		Conference.findByNumber(it)
	}
}