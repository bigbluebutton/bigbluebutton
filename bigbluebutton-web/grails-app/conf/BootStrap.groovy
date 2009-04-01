import org.jsecurity.crypto.hash.Sha1Hash
//import org.springframework.jms.listener.DefaultMessageListenerContainer

class BootStrap {
	def jmsContainer
	
     def init = { servletContext ->
     	// Administrator user and role.
		def adminRole = new Role(name: "Administrator").save()
		def adminUser = new User(username: "admin", passwordHash: new Sha1Hash("admin").toHex(),
									email: "admin@test.com", fullName: "Admin").save()
		new UserRoleRel(user: adminUser, role: adminRole).save()
		
		// A normal user.
		def userRole = new Role(name: "User").save()
		def normalUser = new User(username: "phil", passwordHash: new Sha1Hash("password").toHex(),
									email: "phil@test.com", fullName: "Phil").save()
		new UserRoleRel(user: normalUser, role: userRole).save()
		
		// Give another user the "User" role.
		normalUser = new User(username: "alice", passwordHash: new Sha1Hash("changeit").toHex(),
									email: "alice@test.com", fullName: "Alice").save()
		new UserRoleRel(user: normalUser, role: userRole).save()
		
		/** Start the JMS Container defined in resources.groovy**/
		
		log.info "Starting JMS Container"
		println "Starting JMS Container"
		jmsContainer.initialize()
		jmsContainer.start()
		println "Started JMS Container"
     }
     
     def destroy = {
     }
} 