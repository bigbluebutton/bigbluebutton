
package org.bigbluebutton.conference

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

public class BigBlueButtonSession {
	private static Logger log = Red5LoggerFactory.getLogger(BigBlueButtonSession.class, "bigbluebutton")
	
	private final def username
	private final def role
	private final def conference
	private final def mode
	private final def room
	private final def userid
	private final def sessionName
	
	public BigBlueButtonSession(def sessionName, def userid, def username, def role, def conference, def mode, def room){
		this.userid = userid
		this.sessionName = sessionName
		this.username = username
		this.role = role
		this.conference = conference
		this.mode = mode
		this.room = room
	}
	
	def playbackMode() {
		mode == Constants.PLAYBACK_MODE
	}
	
	
//	public Long getUserid() {
//		return userid
//	}
}
