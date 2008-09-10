package org.red5.server;

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

import java.util.HashMap;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;
import org.springframework.core.io.Resource;

// TODO: Auto-generated Javadoc
/**
 * Red5 applications loader.
 */
public class ContextLoader implements ApplicationContextAware {
	
	/** Logger. */
	protected static Logger log = LoggerFactory.getLogger(ContextLoader.class);

	/** Spring Application context. */
	protected ApplicationContext applicationContext;

	/** Spring parent app context. */
	protected ApplicationContext parentContext;

	/** Context location files. */
	protected String contextsConfig;

	/** Context map. */
	protected HashMap<String, ApplicationContext> contextMap = new HashMap<String, ApplicationContext>();

	/**
	 * Sets the application context.
	 * 
	 * @param applicationContext Spring application context
	 * 
	 * @throws BeansException Top level exception for app context (that is, in fact, beans
	 * factory)
	 */
	public void setApplicationContext(ApplicationContext applicationContext)
			throws BeansException {
		this.applicationContext = applicationContext;
	}

	/**
	 * Setter for parent app context.
	 * 
	 * @param parentContext Parent Spring application context
	 */
	public void setParentContext(ApplicationContext parentContext) {
		this.parentContext = parentContext;
	}

	/**
	 * Setter for context config name.
	 * 
	 * @param contextsConfig Context config name
	 */
	public void setContextsConfig(String contextsConfig) {
		this.contextsConfig = contextsConfig;
	}

	/**
	 * Loads context settings from ResourceBundle (.properties file)
	 * 
	 * @throws Exception I/O exception, casting exception and others
	 */
	public void init() throws Exception {
		// Load properties bundle
		Properties props = new Properties();
		Resource res = applicationContext.getResource(contextsConfig);
		if (!res.exists()) {
			log.error("Contexts config must be set.");
			return;
		}

		// Load properties file
		props.load(res.getInputStream());

		// Iterate thru properties keys and replace config attributes with
		// system attributes
		for (Object key : props.keySet()) {
			String name = (String) key;
			String config = props.getProperty(name);
			// TODO: we should support arbitrary property substitution
			config = config.replace("${red5.root}", System
					.getProperty("red5.root"));
			config = config.replace("${red5.config_root}", System
					.getProperty("red5.config_root"));
			log.info("Loading: " + name + " = " + config);

			// Load context
			loadContext(name, config);
		}

	}

	/**
	 * Loads context (Red5 application) and stores it in context map, then adds
	 * it's beans to parent (that is, Red5).
	 * 
	 * @param name Context name
	 * @param config Filename
	 */
	protected void loadContext(String name, String config) {
		log.debug("Load context - name: " + name + " config: " + config);
		ApplicationContext context = new FileSystemXmlApplicationContext(
				new String[] { config }, parentContext);
		contextMap.put(name, context);
		// add the context to the parent, this will be red5.xml
		ConfigurableBeanFactory factory = ((ConfigurableApplicationContext) applicationContext)
				.getBeanFactory();
		// Register context in parent bean factory
		factory.registerSingleton(name, context);
	}

	/**
	 * Return context by name.
	 * 
	 * @param name Context name
	 * 
	 * @return Application context for given name
	 */
	public ApplicationContext getContext(String name) {
		return contextMap.get(name);
	}
}
