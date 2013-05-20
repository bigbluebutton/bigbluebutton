package org.bigbluebutton.core.apps.poll

class Poll(val title: String, val allowMultipleAnswers: Boolean, id: String, question: Question) {						
	private var _active: Boolean = false
	
	def active = _active
	
	def activate():Unit = {
		_active = true;
	}

	def deactivate():Unit = {
	  _active = false;
	}
	
	def response(responseID: String, userID: String):Unit = {
	  
	}
}