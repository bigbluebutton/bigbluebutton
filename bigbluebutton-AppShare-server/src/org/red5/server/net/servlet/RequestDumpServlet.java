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
import java.util.Enumeration;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.mina.common.ByteBuffer;
import org.red5.io.utils.HexDump;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Servlet that dumps request data.
 */
public class RequestDumpServlet extends HttpServlet {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -7805924991663536258L;

    /** Logger. */
    protected static Logger log = LoggerFactory.getLogger(RequestDumpServlet.class);
    
    /** AMF MIME type. */
	public static final String APPLICATION_AMF = "application/x-amf";

	/** {@inheritDoc} */
    @Override
	protected void service(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		Enumeration en = req.getHeaderNames();
		while (en.hasMoreElements()) {
			String name = (String) en.nextElement();
			log.info(name + " => " + req.getHeader(name));
		}

		ByteBuffer reqBuffer = null;

		try {

			//req.getSession().getAttribute(REMOTING_CONNECTOR);

			reqBuffer = ByteBuffer.allocate(req.getContentLength());
			ServletUtils.copy(req.getInputStream(), reqBuffer.asOutputStream());
			//reqBuffer.flip();

			log.info(HexDump.formatHexDump(reqBuffer.getHexDump()));

		} catch (IOException e) {
			log.error("{}", e);
		}
		log.info("End");
	}

}
