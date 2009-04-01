class Attendees {
	Integer conferenceNumber
	String channelId
	Integer userNumber
	Date dateJoined
	Date dateLeft
	String callerName
	String callerNumber
	    	
	String toString() {"${this.callerName} ${this.callerNumber}"}
}
