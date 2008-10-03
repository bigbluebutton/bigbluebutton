The following libraries are included in the Spring Framework distribution because they are
required either for building the framework or for running the sample apps. Note that each
of these libraries is subject to the respective license; check the respective project
distribution/website before using any of them in your own applications.

* ant/ant.jar, ant/ant-launcher.jar, ant-trax.jar, ant-junit.jar
- Ant 1.6.5 (http://ant.apache.org)
- used to build the framework and the sample apps

* antlr/antlr-2.7.6.jar
- ANTLR 2.7.6 (http://www.antlr.org)
- required for running PetClinic (by Hibernate3)

* aopalliance/aopalliance.jar
- AOP Alliance 1.0 (http://aopalliance.sourceforge.net)
- required for building the framework
- included in spring.jar and spring-aop.jar

* asm/asm*-2.2.2.jar
- ObjectWeb ASM 2.2.2 (http://asm.objectweb.org)
- required for building the framework
- required at runtime when using parameter name discovery with AspectJ

* aspectj/aspectjweaver.jar, aspectj/aspectjrt.jar, (aspectj/aspectjtools.jar)
- AspectJ 1.5.2a (http://www.aspectj.org)
- required for building the framework
- required at runtime when using Spring's AspectJ support

NOTE: aspectjtools.jar is not included in the Spring distribution because of its size.
It needs to be taken from the AspectJ distribution or from Spring CVS. Note that this
is only necessary if you want to rebuild the Spring jars including the AspectJ aspects.

* axis/axis.jar, axis/saaj.jar, axis/wsdl4j.jar
- Apache Axis 1.3 (http://ws.apache.org/axis)
- required for running JPetStore

* bsh/bsh-2.0b4.jar
- BeanShell 2.0 beta 4 (http://www.beanshell.org)
- required for building the framework
- required at runtime when using Spring's BeanShell support

* c3p0/c3p0-0.9.0.4.jar
- C3P0 0.9.0.4 connection pool (http://sourceforge.net/projects/c3p0)
- required for building the framework
- required at runtime when using Spring's C3P0NativeJdbcExtractor
- required for running Image Database

* caucho/hessian-3.0.20.jar
- Hessian/Burlap 3.0.20 (http://www.caucho.com/hessian)
- required for building the framework
- required at runtime when using Spring's Hessian/Burlap remoting support

* cglib/cglib-nodep-2.1_3.jar
- CGLIB 2.1_3 with ObjectWeb ASM 1.5.3 (http://cglib.sourceforge.net)
- required for building the framework
- required at runtime when proxying full target classes via Spring AOP

* commonj/commonj-twm.jar
- CommonJ TimerManager and WorkManager API 1.1 (http://dev2dev.bea.com/wlplatform/commonj/twm.html)
- required for building the framework
- required at runtime when using Spring's CommonJ support

* cos/cos.jar
- Jason Hunter's COS 05Nov02 (http://www.servlets.com/cos)
- required for building the framework
- required at runtime when using Spring's CosMultipartResolver or CosMailSender

* dom4j/dom4j-1.6.1, dom4j/jaxen-1.1-beta-7.jar
- DOM4J 1.6.1 XML parser (http://www.dom4j.org)
- required for running PetClinic (by Hibernate)

* easymock/easymock.jar, easymock/easymockclassextension.jar
- EasyMock 1.2 (JDK 1.3 version) (http://www.easymock.org)
- required for building and running the framework test suite

* ehcache/ehcache-1.2.3.jar
- EHCache 1.2.3 (http://ehcache.sourceforge.net)
- required for building the framework
- required at runtime when using Spring's EHCache support
- required for running PetClinic (by Hibernate)

* freemarker/freemarker.jar
- FreeMarker 2.3.8 (http://www.freemarker.org)
- required for building the framework
- required at runtime when using Spring's FreeMarker support

* glassfish/glassfish-clapi.jar
- GlassFish ClassLoader API extract (http://glassfish.dev.java.net)
- required for building the framework

* groovy/groovy-1.0-jsr-04.jar
- Groovy 1.0 JSR-04 (http://groovy.codehaus.org)
- required for building the framework
- required at runtime when using Spring's Groovy support

* hibernate/hibernate2.jar
- Hibernate 2.1.8 (http://www.hibernate.org)
- required for building the framework
- required at runtime when using Spring's Hibernate 2.1 support

* hibernate/hibernate3.jar
- Hibernate 3.2.1 (http://www.hibernate.org)
- required for building the framework
- required at runtime when using Spring's Hibernate 3.x support

* hibernate/hibernate-annotation.jar
- Hibernate Annotations 3.2.0 (http://www.hibernate.org)
- required for building the "tiger" part of the framework
- required at runtime when using Spring's Hibernate Annotations support

* hibernate/hibernate-entitymanager.jar
- Hibernate EntityManager 3.2.0 (http://www.hibernate.org)
- required for building the "tiger" part of the framework
- required at runtime when using Spring's Hibernate-specific JPA support

* hsqldb/hsqldb.jar
- HSQLDB 1.8.0.1 (http://hsqldb.sourceforge.net)
- required for running JPetStore and PetClinic

* ibatis/ibatis-sqlmap-2.jar, ibatis/ibatis-common-2.jar
- iBATIS SQL Maps 2.2.0 b638 (http://ibatis.apache.org)
- required for building the framework
- required at runtime when using Spring's iBATIS SQL Maps 2.x support

* itext/itext-1.3.jar
- iText PDF 1.3 (http://www.lowagie.com/itext)
- required for building the framework
- required at runtime when using Spring's AbstractPdfView

* j2ee/activation.jar
- JavaBeans Activation Framework 1.0.2 (http://java.sun.com/products/javabeans/glasgow/jaf.html)
- required for building the framework
- required at runtime when using Spring's JavaMailSender

* j2ee/connector.jar
- J2EE Connector Architecture 1.0 (http://java.sun.com/j2ee/connector)
- required at runtime when using Hibernate's JCA Connector

* j2ee/ejb.jar
- Enterprise JavaBeans API 2.0 (http://java.sun.com/products/ejb)
- required for building the framework
- required at runtime when using Spring's EJB support

* j2ee/jaxrpc.jar
- JAX-RPC API 1.1 (http://java.sun.com/xml/jaxrpc)
- required for building the framework
- required at runtime when using Spring's JAX-RPC support

* j2ee/jms.jar
- Java Message Service API 1.1 (java.sun.com/products/jms)
- required for building the framework
- required at runtime when using Spring's JMS support

* j2ee/jsp-api.jar
- JSP API 2.0 (http://java.sun.com/products/jsp)
- required for building the framework
- required at runtime when using Spring's JSP support

* j2ee/jstl.jar
- JSP Standard Tag Library API 1.1 (http://java.sun.com/products/jstl)
- required for building the framework
- required at runtime when using Spring's JstlView

* j2ee/jta.jar
- Java Transaction API 1.0.1b (http://java.sun.com/products/jta)
- required for building the framework
- required at runtime when using Spring's JtaTransactionManager

* j2ee/mail.jar
- JavaMail 1.3.2 (http://java.sun.com/products/javamail)
- required for building the framework
- required at runtime when using Spring's JavaMailSender

* j2ee/rowset.jar
- JDBC RowSet Implementations 1.0.1 (http://java.sun.com/products/jdbc)
- required for building the framework on JDK < 1.5
- required at runtime when using Spring's RowSet support on JDK < 1.5

* j2ee/servlet-api.jar
- Servlet API 2.4 (http://java.sun.com/products/servlet)
- required for building the framework
- required at runtime when using Spring's web support

* jakarta-commons/commons-attributes-api.jar, jakarta-commons/commons-attributes-compiler.jar
- Commons Attributes 2.2 (http://jakarta.apache.org/commons/attributes)
- commons-attributes-api.jar has a patched manifest (not declaring QDox and Ant as required extensions)
- required for building the framework
- required at runtime when using Spring's Commons Attributes support

* jakarta-commons/commons-beanutils.jar
- Commons BeanUtils 1.7 (http://jakarta.apache.org/commons/beanutils)
- required for running JPetStore's Struts web tier

* jakarta-commons/commons-collections.jar
- Commons Collections 3.2 (http://jakarta.apache.org/commons/collections)
- required for building the framework
- optional for using linked/identity maps in Spring core (on JDK < 1.4)
- required for running PetClinic, JPetStore (by Commons DBCP, Hibernate)

* jakarta-commons/commons-dbcp.jar
- Commons DBCP 1.2.1 (http://jakarta.apache.org/commons/dbcp)
- required for building the framework
- required at runtime when using Spring's CommonsDbcpNativeJdbcExtractor
- required for running JPetStore

* jakarta-commons/commons-digester.jar
- Commons Digester 1.6 (http://jakarta.apache.org/commons/digester)
- required for running JPetStore's Struts web tier

* jakarta-commons/commons-discovery.jar
- Commons Discovery 0.2 (http://jakarta.apache.org/commons/discovery)
- required for running JPetStore (by Axis)

* jakarta-commons/commons-fileupload.jar
- Commons FileUpload 1.1.1 (http://jakarta.apache.org/commons/fileupload)
- required for building the framework
- required at runtime when using Spring's CommonsMultipartResolver

* jakarta-commons/commons-httpclient.jar
- Commons HttpClient 3.0.1 (http://jakarta.apache.org/commons/httpclient)
- required for building the framework
- required at runtime when using Spring's CommonsHttpInvokerRequestExecutor

* jakarta-commons/commons-io.jar
- Commons IO 1.1 (http://jakarta.apache.org/commons/io)
- required at runtime when using Spring's CommonsMultipartResolver (by Commons FileUpload)

* jakarta-commons/commons-javaflow.jar
- Commons JavaFlow 20060411 (taken from JasperReports 1.2.5 distribution)
- required at runtime when using Spring's JasperReports support (by JasperReports)

* jakarta-commons/commons-lang.jar
- Commons Lang 2.2 (http://jakarta.apache.org/commons/lang)
- required at runtime when using Spring's OpenJPA support (by OpenJPA)

* jakarta-commons/commons-logging.jar
- Commons Logging 1.1 (http://jakarta.apache.org/commons/logging)
- required for building the framework
- required at runtime, as Spring uses it for all logging

* jakarta-commons/commons-pool.jar
- Commons Pool 1.3 (http://jakarta.apache.org/commons/pool)
- required for running JPetStore and Image Database (by Commons DBCP)

* jakarta-commons/commons-validator.jar
- Commons Validator 1.1.4 (http://jakarta.apache.org/commons/validator)
- required for running JPetStore's Struts web tier on servers that eagerly load tag libraries (e.g. Resin)

* jakarta-taglibs/standard.jar
- Jakarta's JSTL implementation 1.1.2 (http://jakarta.apache.org/taglibs)
- required for running JPetStore, PetClinic, Countries

* jamon/JAMon.jar
- JAMon API (Java Application Monitor) 1.0 (http://www.jamonapi.com)
- required for building the framework
- required at runtime when using Spring's JamonPerformanceMonitorInterceptor

* jasperreports/jasperreports-1.2.8.jar
- JasperReports 1.2.8 (http://jasperreports.sourceforge.net)
- required for building the framework
- required at runtime when using Spring's JasperReports support

* jdo/jdo2-api.jar
- JDO API 2.0 (http://db.apache.org/jdo)
- required for building the framework
- required at runtime when using Spring's JDO support (or jdo.jar for JDO 1.0)

* jexcelapi/jxl.jar
- JExcelApi 2.5.7 (http://jexcelapi.sourceforge.net)
- required for building the framework
- required at runtime when using Spring's AbstractJExcelView

* jmx/jmxri.jar
- JMX 1.2.1 reference implementation
- required for building the framework on JDK < 1.5
- required at runtime when using Spring's JMX support on JDK < 1.5

* jmx/jmxremote.jar
- JMX Remote API 1.0.1 reference implementation
- required for building the framework on JDK < 1.5
- required at runtime when using Spring's JMX support on JDK < 1.5

* jmx/jmxremote_optional.jar
- JMXMP connector (from JMX Remote API 1.0.1 reference implementation)
- required for running the framework test suite (even on JDK 1.5)
- required at runtime when using the JMXMP connector (even on JDK 1.5)

* jotm/jotm.jar
- JOTM 2.0.10 (http://jotm.objectweb.org)
- required for building the framework
- required at runtime when using Spring's JotmFactoryBean

* jotm/xapool.jar
- XAPool 1.5.0 (http://xapool.experlog.com, also included in JOTM)
- required for building the framework
- required at runtime when using Spring's XAPoolNativeJdbcExtractor

* jpa/persistence.jar
- Java Persistence API 1.0 (http://www.oracle.com/technology/products/ias/toplink/jpa)
- required for building the framework
- required at runtime when using Spring's JPA support

* jruby/jruby.jar
- JRuby 0.9.1 (http://jruby.sourceforge.net)
- required for building the framework
- required at runtime when using Spring's JRuby support

* jsf/jsf-api.jar
- JSF API 1.1 (http://java.sun.com/j2ee/javaserverfaces)
- required for building the framework
- required at runtime when using Spring's JSF support

* junit/junit.jar
- JUnit 3.8.1 (http://www.junit.org)
- required for building the test suite

* log4j/log4j-1.2.14.jar
- Log4J 1.2.14 (http://logging.apache.org/log4j)
- required for building the framework
- required at runtime when using Spring's Log4jConfigurer

* oc4j/oc4j-clapi.jar
- Oracle OC4J 10.1.3.1 ClassLoader API extract (http://www.oracle.com/technology/tech/java/oc4j)
- required for building the framework

* openjpa/openjpa-all-0.9.6-incubating.jar
- OpenJPA 0.9.6 Nov 20 snapshot (http://incubator.apache.org/openjpa)
- required for building the framework
- required at runtime when using Spring's JPA support with OpenJPA as provider

* oro/jakarta-oro-2.0.8.jar
- Jakarta ORO 2.0.8 (http://jakarta.apache.org/oro)
- required for building the framework
- required at runtime when using Spring's RegexpMethodPointcut

* poi/poi-2.5.1.jar
- Apache POI 2.5.1 (http://jakarta.apache.org/poi)
- required for building the framework
- required at runtime when using Spring's AbstractExcelView

* portlet/portlet-api.jar
- Portlet API 1.0 (http://jcp.org/aboutJava/communityprocess/final/jsr168)
- required for building the framework
- required at runtime when using Spring's Portlet support

* qdox/qdox-1.5.jar
- QDox 1.5 (http://qdox.codehaus.org)
- used by Commons Attributes 2.2 to parse source-level metadata in the build process
- required for building the framework and the attributes version of JPetStore

* quartz/quartz-1.6.0.jar
- Quartz 1.6.0 (http://www.opensymphony.com/quartz)
- required for building the framework
- required at runtime when using Spring's Quartz scheduling support

* serp/serp-1.12.1.jar
- Serp 1.12.1 (http://http://serp.sourceforge.net)
- required at runtime when using Spring's OpenJPA support (by OpenJPA)

* struts/struts.jar
- Apache Struts 1.2.9 (http://jakarta.apache.org/struts)
- required for building the framework
- required at runtime when using the Struts support or TilesView
- required for running JPetStore's Struts web tier

* tomcat/catalina.jar
- Apache Tomcat 5.5.17 (http://tomcat.apache.org)
- required for building the Tomcat-specific weaver

* toplink/toplink-api.jar
- Oracle TopLink 10.1.3 API (http://www.oracle.com/technology/products/ias/toplink)
- required for building the framework
- replaced with full toplink.jar at runtime when using Spring's TopLink support

* toplink/toplink-essentials.jar
- Oracle TopLink Essentials v2 b16 (http://www.oracle.com/technology/products/ias/toplink/jpa)
- required for building the framework
- required at runtime when using Spring's JPA support with TopLink as provider

* velocity/velocity-1.4.jar
- Velocity 1.4 (http://jakarta.apache.org/velocity)
- required for building the framework
- required at runtime when using Spring's VelocityView

* velocity/velocity-tools-generic-1.2.jar, velocity/velocity-tools-view-1.2.jar
- Velocity Tools 1.2 (http://jakarta.apache.org/velocity/tools)
- required for building the framework
- required at runtime when using VelocityView's support for Velocity Tools
