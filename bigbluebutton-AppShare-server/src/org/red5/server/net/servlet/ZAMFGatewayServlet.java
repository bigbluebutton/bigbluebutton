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
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.mina.common.ByteBuffer;
import org.apache.mina.common.ConnectFuture;
import org.apache.mina.common.IoHandler;
import org.apache.mina.common.IoHandlerAdapter;
import org.apache.mina.common.IoSession;
import org.apache.mina.transport.vmpipe.VmPipeAddress;
import org.apache.mina.transport.vmpipe.VmPipeConnector;
import org.mortbay.util.ajax.Continuation;
import org.mortbay.util.ajax.ContinuationSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * The Class ZAMFGatewayServlet.
 */
public class ZAMFGatewayServlet extends HttpServlet {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 8763226003362000834L;

	/** The log. */
	@SuppressWarnings("all")
	protected static Logger log = LoggerFactory.getLogger(ZAMFGatewayServlet.class
			.getName());

	/** The Constant APPLICATION_AMF. */
	public static final String APPLICATION_AMF = "application/x-amf";

	/** {@inheritDoc} */
	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		// Continuation cont = ContinuationSupport.getContinuation(req, this);
		log.info("Service");

		if (req.getContentLength() == 0 || req.getContentType() == null
				|| !req.getContentType().equals(APPLICATION_AMF)) {
			resp.setStatus(HttpServletResponse.SC_OK);
			resp.getWriter().write("Gateway");
			resp.flushBuffer();
			return;
		}

		ByteBuffer reqBuffer = null;
		try {

			// req.getSession().getAttribute(REMOTING_CONNECTOR);

			reqBuffer = ByteBuffer.allocate(req.getContentLength());
			ServletUtils.copy(req.getInputStream(), reqBuffer.asOutputStream());
			reqBuffer.flip();

			// Connect to the server.
			VmPipeConnector connector = new VmPipeConnector();
			IoHandler handler = new Handler(req, resp);
			ConnectFuture connectFuture = connector.connect(new VmPipeAddress(
					5080), handler);
			connectFuture.join();
			IoSession session = connectFuture.getSession();
			session.setAttachment(resp);
			session.write(reqBuffer);

			ContinuationSupport.getContinuation(req, handler).suspend(1000);

		} catch (IOException e) {

			log.error("{}", e);

		}
		log.info("End");
	}

	/**
	 * The Class Handler.
	 */
	protected class Handler extends IoHandlerAdapter {

		/** The resp. */
		protected HttpServletResponse resp;

		/** The req. */
		protected HttpServletRequest req;

		/**
		 * Instantiates a new handler.
		 * 
		 * @param req the req
		 * @param resp the resp
		 */
		public Handler(HttpServletRequest req, HttpServletResponse resp) {
			this.req = req;
			this.resp = resp;
		}

		/** {@inheritDoc} */
		@Override
		public void messageReceived(IoSession session, Object message)
				throws Exception {
			log.info("<< message " + message);

			if (message instanceof ByteBuffer) {
				final Continuation cont = ContinuationSupport.getContinuation(
						req, this);
				if (cont.isPending()) {
					cont.resume();
				}
				try {
					final ServletOutputStream out = resp.getOutputStream();
					ByteBuffer buf = (ByteBuffer) message;
					resp.setStatus(HttpServletResponse.SC_OK);
					resp.setContentType(req.getContentType());
					resp.setContentLength(buf.limit());
					ServletUtils.copy(buf.asInputStream(), out);
					out.flush();
					out.close();
				} catch (IOException e) {
					log.error("Error sending response", e);
				}
			}
		}
	}

}
