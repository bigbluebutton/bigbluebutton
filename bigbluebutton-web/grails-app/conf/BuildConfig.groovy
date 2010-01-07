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

//  This closure is to enable logging in production. 
//	This closure is passed the location of the staging directory that
//	is zipped up to make the WAR file, and the command line arguments.
//	Here we copy over oug log4j.properties file while the web.xml is
//  overridden from what's in src/templates/war/web.xml.
// (ralam, jan 7, 2010)
grails.war.resources = {stagingDir, args ->
	//println '*** Copying our custom web.xml and log4j.properties as workaround for logging problem. ***'
	//println '*** Copying our custom web.xml as workaround for logging problem. ***'
	//copy(file: "grails-app/conf/custom-web.xml", tofile: "${stagingDir}/WEB-INF/web.xml")
	println '*** Copying our custom log4j.properties as workaround for logging problem. ***'
	copy(file: "grails-app/conf/log4j.properties", tofile: "${stagingDir}/WEB-INF/classes/log4j.properties")
}	
	

