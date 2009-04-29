package org.bigbluebutton.web.controllers

import org.jsecurity.crypto.hash.Sha1Hash
import org.bigbluebutton.web.domain.Role
import org.bigbluebutton.web.domain.User
import org.bigbluebutton.web.domain.UserRoleRel

class AuthControllerTests extends GroovyTestCase {

    void testLogin() {
//    	 Administrator user and role.
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
		
		assertEquals 3, User.list().size()
		
		def ac = new AuthController()
		ac.params.username = "admin@test.com"
		ac.params.password = "admin"
		ac.params.targetUri = "/login-success"
		ac.signIn()
		
		assertEquals "/login-success", ac.response.redirectedUrl
    }
}
