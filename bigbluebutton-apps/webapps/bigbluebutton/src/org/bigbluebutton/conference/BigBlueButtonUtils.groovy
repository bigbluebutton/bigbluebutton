
package org.bigbluebutton.conference

import org.red5.server.api.Red5

class BigBlueButtonUtils{

	def getBbbSession() {
		return Red5.connectionLocal.getAttribute(Constants.SESSION)
	}	
}
