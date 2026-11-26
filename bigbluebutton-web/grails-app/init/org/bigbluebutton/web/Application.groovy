package org.bigbluebutton.web

import grails.boot.GrailsApp
import grails.boot.config.GrailsAutoConfiguration
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.core.env.MutablePropertySources
import org.springframework.core.env.StandardEnvironment

class Application extends GrailsAutoConfiguration {
    static void main(String[] args) {
        GrailsApp app = new GrailsApp(Application)
        app.addInitializers(new SystemPropertiesFirst())
        app.run(args)
    }

    // grails.config.locations adds the properties files above everything else. Put system
    // properties and environment variables back on top, so that they override the files.
    static class SystemPropertiesFirst implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        void initialize(ConfigurableApplicationContext context) {
            MutablePropertySources sources = context.environment.propertySources
            [StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
             StandardEnvironment.SYSTEM_PROPERTIES_PROPERTY_SOURCE_NAME].each { name ->
                def source = sources.remove(name)
                if (source) {
                    sources.addFirst(source)
                }
            }
        }
    }
}
