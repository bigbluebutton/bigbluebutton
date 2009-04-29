package org.bigbluebutton.web.domain

class User {
    String username
    String passwordHash
	String fullName
	Date dateCreated
	Date lastUpdated

    static constraints = {
		username(nullable: false, blank:false,email:true,unique:true)
		fullName(blank:false)	
    }

	String toString() {"${this.id}:${this.username},${this.fullName}"}
}


