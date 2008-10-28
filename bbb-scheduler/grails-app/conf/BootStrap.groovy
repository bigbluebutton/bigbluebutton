class BootStrap {

     def init = { servletContext ->
     	println 'bootstrapping'
     	final String EMAIL_ADMIN = 'voadmin@test.com'
     	final String PASSWORD = 'changeme'
     	final String FULLNAME = 'VO ADMIN'
     	if (!User.findByEmail(EMAIL_ADMIN)) {
     		println 'saving new user'
     		new User(email:EMAIL_ADMIN, password:PASSWORD, fullName:FULLNAME).save()
     		User a = User.findByEmail(EMAIL_ADMIN)
     		println a.email
     	}
     }
     
     def destroy = {
     }
} 