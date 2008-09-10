package org.red5.server.jboss;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 *
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 2.1 of the License, or (at your option) any later
 * version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this library; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 */

import java.beans.Introspector;
import java.io.File;

import org.red5.server.jmx.JMXAgent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;

// TODO: Auto-generated Javadoc
/**
 * Red5 loader for JBoss.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public class JbossLoader implements ApplicationContextAware, JbossLoaderMBean {

	/** We store the application context in a ThreadLocal so we can access it later. */
	protected static ThreadLocal<ApplicationContext> applicationContext = new ThreadLocal<ApplicationContext>();

	// Initialize Logging
	/** The logger. */
	protected static Logger logger = LoggerFactory.getLogger(JbossLoader.class
			.getName());

	/**
	 * Initialization.
	 */
	public void start() {
		logger.info("Loading JBoss service");
        System.setProperty("red5.deployment.type", "jboss");

		logger.info("RED5 Server (http://www.osflash.org/red5)");
		//logger.info("Loading red5 global context from: " + red5Config);

		long time = System.currentTimeMillis();

		try {
			// get Red5 root as environment variable, this is set in the META-INF/jboss-service.xml
			String root = System.getProperty("red5.root");
			logger.info("Red5 root: " + root);
			String configRoot = System.getProperty("red5.config_root");
			logger.info("Red5 config root: " + configRoot);

			String classpath = System.getProperty("java.class.path");
			System.setProperty("java.class.path", classpath
					+ File.pathSeparatorChar + root + File.pathSeparatorChar
					+ configRoot);
			logger.debug("Updated classpath: "
					+ System.getProperty("java.class.path"));

			ClassPathXmlApplicationContext appCtx = new ClassPathXmlApplicationContext(
					configRoot + "beanRefContext.xml");

			/*
			GenericApplicationContext appCtx = new GenericApplicationContext();
			XmlBeanDefinitionReader xmlReader = new XmlBeanDefinitionReader(
					appCtx);
			Resource[] configResources = new Resource[] {
					new ClassPathResource("applicationContext.xml"),
					new ClassPathResource("red5-common.xml"),
					new ClassPathResource("red5-core.xml") };
			xmlReader.loadBeanDefinitions(configResources);
			PropertiesBeanDefinitionReader propReader = new PropertiesBeanDefinitionReader(
					appCtx);
			propReader.loadBeanDefinitions(new ClassPathResource(
					"red5.properties"));

			ConfigurableBeanFactory factory = appCtx.getBeanFactory();
			//register default add the context to the parent
			factory.registerSingleton("default.context", appCtx);


			appCtx.refresh();
			*/
			this.setApplicationContext(appCtx);

		} catch (Exception e) {
			logger.error("Error during startup", e);
		}

		long startupIn = System.currentTimeMillis() - time;
		logger.info("Startup done in: " + startupIn + " ms");

	}

	/* (non-Javadoc)
	 * @see org.red5.server.jboss.JbossLoaderMBean#isStarted()
	 */
	public boolean isStarted() {
		return true;
	}

	/**
	 * Shut server down.
	 */
	public void stop() {
		logger.info("Shutting down JBoss context");
		try {
			//prepare spring for shutdown
			Introspector.flushCaches();
			//shutdown our jmx agent
			JMXAgent.shutdown();
			//shutdown spring
			FileSystemXmlApplicationContext appContext = (FileSystemXmlApplicationContext) getApplicationContext();
			ConfigurableBeanFactory factory = appContext.getBeanFactory();
			if (factory.containsSingleton("default.context")) {
				for (String scope : factory.getRegisteredScopeNames()) {
					logger.debug("Registered scope: " + scope);
				}
				for (String singleton : factory.getSingletonNames()) {
					logger.debug("Registered singleton: " + singleton);
					//factory.destroyScopedBean(singleton);
				}
				factory.destroySingletons();
			}
			appContext.close();
			//LogFactory.release(Thread.currentThread().getContextClassLoader());
		} catch (Exception e) {
			logger.warn("JBoss could not be stopped", e);
		}
	}

	/* (non-Javadoc)
	 * @see org.springframework.context.ApplicationContextAware#setApplicationContext(org.springframework.context.ApplicationContext)
	 */
	public void setApplicationContext(ApplicationContext applicationCtx)
			throws BeansException {
		logger.debug("Attempt to set app context");
		applicationContext.set(applicationCtx);
	}

	/**
	 * Gets the application context.
	 * 
	 * @return the application context
	 */
	public ApplicationContext getApplicationContext() {
		logger.debug("Attempt to get app context");
		return applicationContext.get();
	}

}
