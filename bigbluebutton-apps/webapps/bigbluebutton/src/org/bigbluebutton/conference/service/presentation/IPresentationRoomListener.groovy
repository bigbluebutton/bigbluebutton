
package org.bigbluebutton.conference.service.presentation

interface IPresentationRoomListener {
	def getName()
	//def sendUpdateMessage(def message)	
	//def assignPresenter(def userid, def name, def assignedBy)	
	//def gotoSlide(def slide)
	def sendUpdateMessage
	def assignPresenter
	def gotoSlide
}
