package org.red5.server.net.rtmpt;

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

import org.mortbay.jetty.Server;
import org.red5.server.api.IServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.support.ClassPathXmlApplicationContext;

// TODO: Auto-generated Javadoc
/**
 * Loader for the RTMPT server.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class RTMPTLoader implements ApplicationContextAware {

    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(RTMPTLoader.class);
    
    /** Application context. */
	protected ApplicationContext applicationContext;
    
    /** RTMP config path. */
	protected String rtmptConfig = "classpath:/red5-rtmpt.xml";
    
    /** RTMP server. */
	protected Server rtmptServer;
    
    /** Red5 server instance. */
	protected IServer server;

	/**
	 * Setter for server.
	 * 
	 * @param server Server instance
	 */
    public void setServer(IServer server) {
		this.server = server;
	}

	/** {@inheritDoc} */
    public void setApplicationContext(ApplicationContext context)
			throws BeansException {
		applicationContext = context;
	}

    /**
     * Initialization.
     * 
     * @throws Exception       Exception
     */
    public void init() throws Exception {
		// So this class is left just starting jetty
		log.info("Loading RTMPT context from: " + rtmptConfig);
		ApplicationContext appCtx = new ClassPathXmlApplicationContext(rtmptConfig);
		Server rtmptServer = (Server) appCtx.getBean("Server");
		log.info("Starting RTMPT server");
		rtmptServer.start();

	}

}
