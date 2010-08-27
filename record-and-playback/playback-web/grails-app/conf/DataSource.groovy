dataSource {
	pooled = true
	driverClassName = "com.mysql.jdbc.Driver"
	username = "bbb"
	password = "secret"
}
hibernate {
    cache.use_second_level_cache=true
    cache.use_query_cache=true
    cache.provider_class='net.sf.ehcache.hibernate.EhCacheProvider'
}
// environment specific settings
environments {
	development {
		dataSource {
			dbCreate = "update" // one of 'create', 'create-drop','update'
			url = "jdbc:mysql://localhost:3306/bigbluebutton_dev"
		}
	}
	test {
		dataSource {
                        dbCreate = "update"
			url = "jdbc:mysql://localhost:3306/bigbluebutton_dev"
		}
	}
	production {
		dataSource {
                        dbCreate = "update"
			url = "jdbc:mysql://localhost:3306/bigbluebutton_dev"
		}
	}
}