/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
dataSource {
	pooled = false
	driverClassName = "com.mysql.jdbc.Driver"
	username = "bbb@localhost"
	password = "secret"
}

hibernate {
    cache.use_second_level_cache=true
    cache.use_query_cache=true
    cache.provider_class='org.hibernate.cache.EhCacheProvider'
}

// environment specific settings
environments {
	development {
		dataSource {
			pooled = true
			dbCreate = "update" // one of 'create', 'create-drop','update'
		}
	}
	test {
		dataSource {
			dbCreate = 'create'
			url = "jdbc:hsqldb:mem:testDb"
		}
	}
	production {
		dataSource {
			pooled = true
			dbCreate = "update" // one of 'create', 'create-drop','update'
		}
	}
}