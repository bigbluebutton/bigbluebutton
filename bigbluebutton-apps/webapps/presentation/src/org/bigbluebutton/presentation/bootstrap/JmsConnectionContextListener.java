/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.presentation.bootstrap;


import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.bigbluebutton.presentation.IConversionUpdatesService;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;


/**
 * The listener interface for receiving jmsConnectionContext events.
 * The class that is interested in processing a jmsConnectionContext
 * event implements this interface, and the object created
 * with that class is registered with a component using the
 * component's <code>addJmsConnectionContextListener<code> method. When
 * the jmsConnectionContext event occurs, that object's appropriate
 * method is invoked.
 * 
 * @see JmsConnectionContextEvent
 */
public class JmsConnectionContextListener implements ServletContextListener {
	
	/** The logger. */
	protected static Logger logger = LoggerFactory.getLogger(JmsConnectionContextListener.class);
	
	/**
	 * Starts the ConversionUpdatesService.
	 * @see javax.servlet.ServletContextListener#contextInitialized(javax.servlet.ServletContextEvent)
	 */
	public void contextInitialized(ServletContextEvent event) {
		
		WebApplicationContext ctx = 
			WebApplicationContextUtils.getRequiredWebApplicationContext(
				event.getServletContext());

		IConversionUpdatesService service = (IConversionUpdatesService) ctx.getBean("presentationService");
		logger.info("Connecting to presentation service");
		service.start();
		logger.info("Connected to presentation service");
	}
	
	/**
	 * Stops the ConversionUpdatesService.
	 * @see javax.servlet.ServletContextListener#contextDestroyed(javax.servlet.ServletContextEvent)
	 */
	public void contextDestroyed(ServletContextEvent event) {
		WebApplicationContext ctx = 
			WebApplicationContextUtils.getRequiredWebApplicationContext(
				event.getServletContext());

		IConversionUpdatesService service = (IConversionUpdatesService) ctx.getBean("presentationService");
		logger.info("Disconnecting from presentation service");
		service.stop();
		logger.info("Disconnected to presentation service");
	
	}



}
