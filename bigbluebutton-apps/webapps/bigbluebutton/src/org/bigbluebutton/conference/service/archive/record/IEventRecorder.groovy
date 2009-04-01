
package org.bigbluebutton.conference.service.archive.record


interface IEventRecorder{

	def acceptRecorder(IRecorder recorder)
	def recordEvent(Map event)
	def getName()
}
