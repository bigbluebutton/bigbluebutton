import org.jsecurity.crypto.hash.Sha1Hash
import org.bigbluebutton.web.domain.Role
import org.bigbluebutton.web.domain.User
import org.bigbluebutton.web.domain.UserRoleRel

class BootStrap {
	def jmsContainer
	
     def init = { servletContext ->
     	log.debug "Bootstrapping"
     	// Administrator user and role.
		def adminRole = new Role(name: "Administrator").save()
		def adminUser = new User(username: "admin@test.com", passwordHash: new Sha1Hash("admin").toHex(),
									fullName: "Admin").save()
		new UserRoleRel(user: adminUser, role: adminRole).save()
		
		// A normal user.
		def userRole = new Role(name: "User").save()
		def normalUser = new User(username: "phil@test.com", passwordHash: new Sha1Hash("password").toHex(),
									fullName: "Phil").save()
		new UserRoleRel(user: normalUser, role: userRole).save()
		
		// Give another user the "User" role.
		normalUser = new User(username: "alice@test.com", passwordHash: new Sha1Hash("changeit").toHex(),
									fullName: "Alice").save()
		new UserRoleRel(user: normalUser, role: userRole).save()
     }
     
     def destroy = {
     }
} 