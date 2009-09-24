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
// locations to search for config files that get merged into the main config
// config files can either be Java properties files or ConfigSlurper scripts

// grails.config.locations = [ "classpath:${appName}-config.properties",
//                             "classpath:${appName}-config.groovy",
//                             "file:${userHome}/.grails/${appName}-config.properties",
//                             "file:${userHome}/.grails/${appName}-config.groovy"]

grails.config.locations = [ "classpath:bigbluebutton.properties","file:/etc/default/bigbluebutton"]

// if(System.properties["${appName}.config.location"]) {
//    grails.config.locations << "file:" + System.properties["${appName}.config.location"]
// }
grails.mime.file.extensions = true // enables the parsing of file extensions from URLs into the request format
grails.mime.types = [ html: ['text/html','application/xhtml+xml'],
                      xml: ['text/xml', 'application/xml'],
                      text: 'text-plain',
                      js: 'text/javascript',
                      rss: 'application/rss+xml',
                      atom: 'application/atom+xml',
                      css: 'text/css',
                      csv: 'text/csv',
                      all: '*/*',
                      json: ['application/json','text/json'],
                      form: 'application/x-www-form-urlencoded',
                      multipartForm: 'multipart/form-data'
                    ]
// The default codec used to encode data with ${}
grails.views.default.codec="none" // none, html, base64
grails.views.gsp.encoding="UTF-8"
grails.converters.encoding="UTF-8"

// enabled native2ascii conversion of i18n properties files
grails.enable.native2ascii = true

// set per-environment serverURL stem for creating absolute links
//environments {
//    production {
//        grails.serverURL = "http://www.changeme.com"
//    }
//}

// log4j configuration
log4j = {
    rootLogger="error,stdout"
    error  	'org.codehaus.groovy.grails.web.servlet',  //  controllers
    		'org.codehaus.groovy.grails.web.pages', //  GSP
    		'org.codehaus.groovy.grails.web.sitemesh', //  layouts
    		'org.codehaus.groovy.grails.web.mapping.filter', // URL mapping
    		'org.codehaus.groovy.grails.web.mapping', // URL mapping
    		'org.codehaus.groovy.grails.commons', // core / classloading
    		'org.codehaus.groovy.grails.plugins', // plugins
    		'org.codehaus.groovy.grails.orm.hibernate', // hibernate integration
    		'org.springframework',
    		'org.hibernate'

    warn   'org.mortbay.log'

    additivity.StackTrace=false
}

environments {
    development {
    	grails.serverURL = "http://localhost:8080"    	
        log4j = {
    	    appenders {
    	    	rollingFile name:"logfile", maxFileSize:1024, file:"/tmp/logs/bbb-web-dev.log"
    	    	console name:'console', layout:pattern(conversionPattern: '%d{[dd.MM.yy HH:mm:ss.SSS]} %-5p %c %x - %m%n')
    	    }
        	debug logfile:"grails.app.controller"
    	}
   }
   production {
	   grails.serverURL = "http://www.changeme.com"
	   log4j = {
	   	    appenders {
	   	    	rollingFile name:"logfile", maxFileSize:1024, file:"/tmp/logs/bbb-web-prod.log"
	   	    	console name:'console', layout:pattern(conversionPattern: '%d{[dd.MM.yy HH:mm:ss.SSS]} %-5p %c %x - %m%n')
	   	    }
	       	debug logfile:"grails.app.controller"
	   }
   }
   test {
       log4j {
    	   appender.'logfile.File' = "bbb-web-test.log"
   	       	/* GRAILS 1.04 doesn't seem to like this format (ralam 04/19/2009)
   	         * logger {
   	         * 	 grails.app.controller="debug, stdout, logfile"
   	         * }
   	         */
   	        //logger.grails.app="debug, stdout, logfile"
       }
   }
}

