package org.bigbluebutton.web.domain

class ScheduledSession implements Comparable {
	Date dateCreated
	Date lastUpdated
	String createdBy
	String modifiedBy
	
	String name
	String description
	/* The id for this session. This can be used as the conference room in Red5, for example. */
	String sessionId
	/* An id that we can use in the URL to join this conference session */
	String tokenId
	Integer numberOfAttendees = new Integer(3)
	/* Is there a time limit for this session? */
	Boolean timeLimited = true
	Date startDateTime
	/* If there is a time limit, until when? */
	Date endDateTime
	/* Is this session going to be recorded? */
	Boolean record = false
	/* Do we require a password to join this session? */
	Boolean passwordProtect = true
	String hostPassword = 'change-me-please'
	String moderatorPassword = 'change-me-please'
	String attendeePassword = 'change-me-please'
	String voiceConferenceBridge
	
	public ScheduledSession() {
		startDateTime = new Date()
		// Set the end to 1 hour after start
		endDateTime = new Date(startDateTime.time + 60*60*1000)
	}
	
	Conference conference
			
	static constraints = {		
		name(maxLength:50, blank:false)
		tokenId(blank:false)
		sessionId(blank:false)
		numberOfAttendees()
	}
	
	String toString() {"${this.id}:${this.name} - ${this.sessionId} ${this.tokenId}"}

    int compareTo(obj) {
        obj.id.compareTo(id)
    }
}
