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

grails.config.locations = [ "classpath:bigbluebutton.properties","file:/etc/default/bigbluebutton", "file:${userHome}/.bigbluebutton/bigbluebutton.properties"]

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
log4j {
    appender.stdout = "org.apache.log4j.ConsoleAppender"
    appender.'stdout.layout'="org.apache.log4j.PatternLayout"
    appender.'stdout.layout.ConversionPattern'='[%r] %c{2} %m%n'
    appender.errors = "org.apache.log4j.FileAppender"
    appender.'errors.layout'="org.apache.log4j.PatternLayout"
    appender.'errors.layout.ConversionPattern'='[%r] %c{2} %m%n'
    appender.'errors.File'="stacktrace.log"
    appender.logfile = "org.apache.log4j.DailyRollingFileAppender "
    appender.'logfile.File' = "bbb-web.log"
    appender.'logfile.layout' = "org.apache.log4j.PatternLayout"
    appender.'logfile.layout.ConversionPattern' = '%d{[dd.MM.yy HH:mm:ss.SSS]} %-5p %c %x - %m%n'
    rootLogger="error,stdout"
    logger {
        grails="error"
        StackTrace="error,errors"
        org {
            codehaus.groovy.grails.web.servlet="error"  //  controllers
            codehaus.groovy.grails.web.pages="error" //  GSP
            codehaus.groovy.grails.web.sitemesh="error" //  layouts
            codehaus.groovy.grails."web.mapping.filter"="error" // URL mapping
            codehaus.groovy.grails."web.mapping"="error" // URL mapping
            codehaus.groovy.grails.commons="info" // core / classloading
            codehaus.groovy.grails.plugins="error" // plugins
            codehaus.groovy.grails.orm.hibernate="error" // hibernate integration
            springframework="off"
            hibernate="off"
        }        
    }
    additivity.StackTrace=false
}

environments {
    development {
    	grails.serverURL = "http://localhost:8080"
        log4j {
        	appender.'logfile.File' = "bbb-web-dev.log"
        	/* GRAILS 1.04 doesn't seem to like this format (ralam 04/19/2009)
        	 * logger {
        	 * 	 grails.app.controller="debug, stdout, logfile"
        	 * }
        	 */
        	//logger.grails.app="debug, stdout, logfile"
       }
   }
   production {
	   grails.serverURL = "http://www.changeme.com"
       log4j {
	       	appender.'logfile.File' = "bbb-web-prod.log"
	       	/* GRAILS 1.04 doesn't seem to like this format (ralam 04/19/2009)
	         * logger {
	         * 	 grails.app.controller="debug, stdout, logfile"
	         * }
	         */
	        //logger.grails.app="debug, stdout, logfile"
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

