<jsec:isLoggedIn>
	<jsec:hasRole name="Administrator">
	  <div align="right">
	  	<g:link controller="user" action="list">Manage Users</g:link> |
	  	Logged in as: <jsec:principal/> (<g:link controller="auth" action="signOut">sign out</g:link>)
	  </div>
	</jsec:hasRole>
	<jsec:lacksRole name="Administrator">
	  <div align="right">Logged in as: <jsec:principal/> (<g:link controller="auth" action="signOut">sign out</g:link>)</div>
	</jsec:lacksRole>
</jsec:isLoggedIn>