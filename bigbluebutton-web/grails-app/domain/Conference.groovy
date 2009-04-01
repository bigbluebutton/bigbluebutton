class Conference implements Comparable {
	Date dateCreated
	Date lastUpdated
	String username
	String conferenceName
	Integer conferenceNumber
	SortedSet schedules
	
	static hasMany = [ schedules : Schedule ]
	static belongsTo = [user : User]
			
	static constraints = {
		username(blank:false)
		conferenceName(maxLength:50, blank:false)
		conferenceNumber(maxLength:10, unique:true, blank:false)
	}

	String toString() {"${this.conferenceName}"}

    int compareTo(obj) {
        obj.id.compareTo(id)
    }

}
