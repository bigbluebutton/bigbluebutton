package org.bigbluebutton.web.services

class DemoService {
	def deleteDirectory = {directory ->
		directory.delete()
	}
}
