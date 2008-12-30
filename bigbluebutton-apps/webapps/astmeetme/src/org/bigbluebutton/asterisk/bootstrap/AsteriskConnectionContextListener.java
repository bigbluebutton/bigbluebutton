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
package org.bigbluebutton.asterisk.bootstrap;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import org.bigbluebutton.asterisk.IVoiceService;

/**
 * The listener interface for receiving asteriskConnectionContext events.
 * The class that is interested in processing a asteriskConnectionContext
 * event implements this interface, and the object created
 * with that class is registered with a component using the
 * component's <code>addAsteriskConnectionContextListener<code> method. When
 * the asteriskConnectionContext event occurs, that object's appropriate
 * method is invoked.
 * 
 * @see AsteriskConnectionContextEvent
 */
public class AsteriskConnectionContextListener implements ServletContextListener {
	
	/** The logger. */
	private final Log logger = LogFactory.getLog(getClass());
	
	/**
	 * @see javax.servlet.ServletContextListener#contextInitialized(javax.servlet.ServletContextEvent)
	 */
	public void contextInitialized(ServletContextEvent event) {
		
		WebApplicationContext ctx = 
			WebApplicationContextUtils.getRequiredWebApplicationContext(
				event.getServletContext());

		IVoiceService service = (IVoiceService) ctx.getBean("voiceService");
		logger.info("Logging into Asterisk server.");
		service.start();
		logger.info("Logged in from Asterisk server.");
	}
	
	/**
	 * @see javax.servlet.ServletContextListener#contextDestroyed(javax.servlet.ServletContextEvent)
	 */
	public void contextDestroyed(ServletContextEvent event) {
		WebApplicationContext ctx = 
			WebApplicationContextUtils.getRequiredWebApplicationContext(
				event.getServletContext());

		IVoiceService service = (IVoiceService) ctx.getBean("voiceService");
		logger.info("Logging out from Asterisk server.");
		service.stop();
		logger.info("Logged out from Asterisk server.");
	
	}

}