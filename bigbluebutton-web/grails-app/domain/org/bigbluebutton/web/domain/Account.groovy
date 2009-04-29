package org.bigbluebutton.web.domain

class Account implements Comparable {
	Date created
	Date lastUpdated
	String createdBy
	String updatedBy
	String type
	String name
	String description
	
	static belongsTo = [owner:User]
	static hasMany = [users:User, conferences:Conference]
	
	static constraints = {
		name(maxLength:50, blank:false)
		type(inList:['BASIC', 'ESSENTIAL', 'PREMIUM'])
	}
	
	String toString() {"${this.name}"}

    int compareTo(obj) {
        obj.id.compareTo(id)
    }
}
