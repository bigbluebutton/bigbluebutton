// Place your Spring DSL code here
import org.slf4j.Logger
import org.slf4j.LoggerFactory

Logger logger = LoggerFactory.getLogger("org.bigbluebutton.web.services.turn.StunTurnService")

beans = {
  def turnConfigFilePath = "/etc/bigbluebutton/turn-stun-servers.xml"
  def turnConfigFile = new File(turnConfigFilePath)
  if (turnConfigFile.canRead()) {
    logger.info("Reading stun/turn server config from overlay config file " + turnConfigFilePath)
    importBeans('file:' + turnConfigFilePath)
  } else {
    logger.info("Overlay stun/turn server config file " + turnConfigFilePath
      + " not found/readable, reading from default config file location")
    importBeans('spring/turn-stun-servers.xml')
  }
}

/*
Add back applicationContext.xml

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="grailsApplication" class="org.grails.commons.GrailsApplicationFactoryBean">
        <description>Grails application factory bean</description>
        <property name="grailsDescriptor" value="/WEB-INF/grails.xml" />
    </bean>

    <bean id="pluginManager" class="org.grails.plugins.GrailsPluginManagerFactoryBean">
        <description>A bean that manages Grails plugins</description>
        <property name="grailsDescriptor" value="/WEB-INF/grails.xml" />
        <property name="application" ref="grailsApplication" />
    </bean>

    <bean id="grailsConfigurator" class="org.grails.commons.spring.GrailsRuntimeConfigurator">
        <constructor-arg>
            <ref bean="grailsApplication" />
        </constructor-arg>
        <property name="pluginManager" ref="pluginManager" />
    </bean>

    <bean id="characterEncodingFilter" class="org.springframework.web.filter.CharacterEncodingFilter">
        <property name="encoding">
            <value>utf-8</value>
        </property>
    </bean>

    <bean id="conversionService" class="org.springframework.context.support.ConversionServiceFactoryBean" />
</beans>

*/
