import grails.util.BuildSettings
import grails.util.Environment
import org.springframework.boot.logging.logback.ColorConverter
import org.springframework.boot.logging.logback.WhitespaceThrowableProxyConverter

import java.nio.charset.Charset

conversionRule 'clr', ColorConverter
conversionRule 'wex', WhitespaceThrowableProxyConverter

// See http://logback.qos.ch/manual/groovy.html for details on configuration
appender('STDOUT', ConsoleAppender) {
    encoder(PatternLayoutEncoder) {
        charset = Charset.forName('UTF-8')

        pattern =
                '%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} ' + // Date
                        '%clr(%5p) ' + // Log level
                        '%clr(---){faint} %clr([%15.15t]){faint} ' + // Thread
                        '%clr(%-40.40logger{39}){cyan} %clr(:){faint} ' + // Logger
                        '%m%n%wex' // Message
    }
}

logger('org.grails.web.servlet', ERROR) // controllers
logger('org.grails.web.pages', ERROR)   // GSP
logger('org.grails.web.sitemesh', ERROR)       // layouts
logger('org.grails.web.mapping.filter', ERROR) // URL mapping
logger('org.grails.web.mapping', ERROR)        // URL mapping
logger('org.grails.commons', ERROR)            // core / classloading
logger('org.grails.plugins', ERROR)            // plugins
logger('org.springframework', ERROR)

logger('io.lettuce', INFO)

logger('org.bigbluebutton', DEBUG)
logger('grails.app.controllers', DEBUG)
logger('grails.app.services', DEBUG)

def targetDir = BuildSettings.TARGET_DIR
if (Environment.isDevelopmentMode() && targetDir != null) {
    appender("FULL_STACKTRACE", FileAppender) {
        file = "${targetDir}/stacktrace.log"
        append = true
        encoder(PatternLayoutEncoder) {
            pattern = "%level %logger - %msg%n"
        }
    }
    logger("StackTrace", ERROR, ['FULL_STACKTRACE'], false)
}
root(ERROR, ['STDOUT'])
