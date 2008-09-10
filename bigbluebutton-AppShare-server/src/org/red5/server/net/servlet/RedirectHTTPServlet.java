package org.red5.server.net.servlet;

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

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// TODO: Auto-generated Javadoc
/**
 * Servlet to redirect to HTTP port of Red5.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class RedirectHTTPServlet extends HttpServlet {

	/** Serialization UID. */
	private static final long serialVersionUID = -3543614516289102090L;

	/**
	 * Redirect to HTTP port.
	 * 
	 * @param req the req
	 * @param resp the resp
	 * 
	 * @throws ServletException the servlet exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		String host = System.getProperty("http.host");
		String port = System.getProperty("http.port");
		if ("0.0.0.0".equals(host)) {
			host = "127.0.0.1";
		}
		resp.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
		resp.addHeader("Location", "http://" + host + ":" + port);
		resp.setContentType("text/plain");
		String message = "Relocated to http://" + host + ":" + port;
		resp.setContentLength(message.length());
		resp.getWriter().write(message);
		resp.flushBuffer();
	}
	
}
