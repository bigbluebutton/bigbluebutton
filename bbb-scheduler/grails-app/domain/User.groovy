import org.bigbluebutton.domain.Conference

class User {
	String email
	String password
	String fullName
	SortedSet conferences
	Date dateCreated
	Date lastUpdated
			
	static hasMany = [ conferences: Conference ]
	
	static constraints = {
		email(email:true,unique:true)
		password(matches:/[\w\d]+/,length:6..12)
		fullName(blank:false)	
	}
	
	String toString() {"${this.fullName}"}
}
