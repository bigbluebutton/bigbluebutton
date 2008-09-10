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

import java.io.IOException;
import java.util.Collection;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.mina.common.ByteBuffer;
import org.red5.server.net.rtmp.IRTMPConnManager;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.net.servlet.ServletUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

// TODO: Auto-generated Javadoc
/**
 * Servlet that handles all RTMPT requests.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class RTMPTServlet extends HttpServlet {

	/** Serialization UID. */
	private static final long serialVersionUID = 5925399677454936613L;

	/** Logger. */
	protected static Logger log = LoggerFactory.getLogger(RTMPTServlet.class);

	/** HTTP request method to use for RTMPT calls. */
	private static final String REQUEST_METHOD = "POST";

	/** Content-Type to use for RTMPT requests / responses. */
	private static final String CONTENT_TYPE = "application/x-fcs";

	/** Try to generate responses that contain at least 32768 bytes data. Increasing this value results in better stream performance, but also increases the latency. */
	private static final int RESPONSE_TARGET_SIZE = 32768;

	/** Web app context. */
	protected WebApplicationContext appCtx;

	/** Reference to RTMPT handler;. */
	private static RTMPTHandler handler;
	
    /** The rtmp conn manager. */
    private static IRTMPConnManager rtmpConnManager;

    /**
     * Sets the rtmp conn manager.
     * 
     * @param rtmpConnManager the new rtmp conn manager
     */
    public void setRtmpConnManager(IRTMPConnManager rtmpConnManager) {
		RTMPTServlet.rtmpConnManager = rtmpConnManager;
	}
	
	/**
	 * Set the RTMPTHandler to use in this servlet.
	 * 
	 * @param handler the handler
	 */
	public void setHandler(RTMPTHandler handler) {
		RTMPTServlet.handler = handler;
	}

	/**
	 * Return an error message to the client.
	 * 
	 * @param message Message
	 * @param resp Servlet response
	 * 
	 * @throws IOException I/O exception
	 */
	protected void handleBadRequest(String message, HttpServletResponse resp)
			throws IOException {
		resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		resp.setContentType("text/plain");
		resp.setContentLength(message.length());
		resp.getWriter().write(message);
		resp.flushBuffer();
	}

	/**
	 * Return a single byte to the client.
	 * 
	 * @param message Message
	 * @param resp Servlet response
	 * 
	 * @throws IOException I/O exception
	 */
	protected void returnMessage(byte message, HttpServletResponse resp)
			throws IOException {
		resp.setStatus(HttpServletResponse.SC_OK);
		resp.setHeader("Connection", "Keep-Alive");
		resp.setHeader("Cache-Control", "no-cache");
		resp.setContentType(CONTENT_TYPE);
		resp.setContentLength(1);
		resp.getWriter().write(message);
		resp.flushBuffer();
	}

	/**
	 * Return a message to the client.
	 * 
	 * @param message Message
	 * @param resp Servlet response
	 * 
	 * @throws IOException I/O exception
	 */
	protected void returnMessage(String message, HttpServletResponse resp)
			throws IOException {
		resp.setStatus(HttpServletResponse.SC_OK);
		resp.setHeader("Connection", "Keep-Alive");
		resp.setHeader("Cache-Control", "no-cache");
		resp.setContentType(CONTENT_TYPE);
		resp.setContentLength(message.length());
		resp.getWriter().write(message);
		resp.flushBuffer();
	}

	/**
	 * Return raw data to the client.
	 * 
	 * @param client RTMP connection
	 * @param buffer Raw data as byte buffer
	 * @param resp Servlet response
	 * 
	 * @throws IOException I/O exception
	 */
	protected void returnMessage(RTMPTConnection client, ByteBuffer buffer,
			HttpServletResponse resp) throws IOException {
		resp.setStatus(HttpServletResponse.SC_OK);
		resp.setHeader("Connection", "Keep-Alive");
		resp.setHeader("Cache-Control", "no-cache");
		resp.setContentType(CONTENT_TYPE);
		if (log.isDebugEnabled()) {
			log.debug("Sending " + buffer.limit() + " bytes.");
		}
		resp.setContentLength(buffer.limit() + 1);
		ServletOutputStream output = resp.getOutputStream();
		output.write(client.getPollingDelay());
		ServletUtils.copy(buffer.asInputStream(), output);
		buffer.release();
		buffer = null;
	}

	/**
	 * Return the client id from a url like /send/123456/12 -> 123456.
	 * 
	 * @param req Servlet request
	 * 
	 * @return Client id
	 */
	protected Integer getClientId(HttpServletRequest req) {
		String path = req.getPathInfo();
		if (path.equals("")) {
			return null;
		}

		while (path.length() > 1 && path.charAt(0) == '/') {
			path = path.substring(1);
		}

		int endPos = path.indexOf('/');
		if (endPos != -1) {
			path = path.substring(0, endPos);
		}
		try {
			return Integer.parseInt(path);
		} catch (NumberFormatException e) {
			return null;
		}
	}

	/**
	 * Get the RTMPT client for a session.
	 * 
	 * @param req Servlet request
	 * 
	 * @return RTMP client connection
	 */
	protected RTMPTConnection getClient(HttpServletRequest req) {
		final Integer id = getClientId(req);
		return getConnection(id);
	}

	/**
	 * Skip data sent by the client.
	 * 
	 * @param req Servlet request
	 * 
	 * @throws IOException I/O exception
	 */
	protected void skipData(HttpServletRequest req) throws IOException {
		ByteBuffer data = ByteBuffer.allocate(req.getContentLength());
		ServletUtils.copy(req.getInputStream(), data.asOutputStream());
		data.flip();
		data.release();
		data = null;
	}

	/**
	 * Send pending messages to client.
	 * 
	 * @param client RTMP connection
	 * @param resp Servlet response
	 * 
	 * @throws IOException I/O exception
	 */
	protected void returnPendingMessages(RTMPTConnection client,
			HttpServletResponse resp) throws IOException {

		ByteBuffer data = client.getPendingMessages(RESPONSE_TARGET_SIZE);
		if (data == null) {
			// no more messages to send...
			if (client.isClosing())
				// Tell client to close connection
				returnMessage((byte) 0, resp);
			else
				returnMessage(client.getPollingDelay(), resp);
			return;
		}

		returnMessage(client, data, resp);
	}

	/**
	 * Start a new RTMPT session.
	 * 
	 * @param req Servlet request
	 * @param resp Servlet response
	 * 
	 * @throws ServletException Servlet exception
	 * @throws IOException I/O exception
	 */
	protected void handleOpen(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		// Skip sent data
		skipData(req);

		// TODO: should we evaluate the pathinfo?
		RTMPTConnection client = createConnection();
		client.setServlet(this);
		if (client.getId() == 0) {
			// no more clients are available for serving
			returnMessage((byte) 0, resp);
			return;
		}

		// Return connection id to client
		returnMessage(client.getId() + "\n", resp);
	}

	/**
	 * Close a RTMPT session.
	 * 
	 * @param req Servlet request
	 * @param resp Servlet response
	 * 
	 * @throws ServletException Servlet exception
	 * @throws IOException I/O exception
	 */
	protected void handleClose(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		// Skip sent data
		skipData(req);

		RTMPTConnection client = getClient(req);
		if (client == null) {
			handleBadRequest("Unknown client.", resp);
			return;
		}
		removeConnection(client.getId());

		client.setServletRequest(req);
		handler.connectionClosed(client, client.getState());

		returnMessage((byte) 0, resp);
		client.realClose();
	}

	/**
	 * Add data for an established session.
	 * 
	 * @param req Servlet request
	 * @param resp Servlet response
	 * 
	 * @throws ServletException Servlet exception
	 * @throws IOException I/O exception
	 */
	protected void handleSend(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		RTMPTConnection client = getClient(req);
		if (client == null) {
			handleBadRequest("Unknown client.", resp);
			return;
		} else if (client.getState().getState() == RTMP.STATE_DISCONNECTED) {
			removeConnection(client.getId());
			handleBadRequest("Connection already closed.", resp);
			return;
		}

		client.setServletRequest(req);

		// Put the received data in a ByteBuffer
		int length = req.getContentLength();
		ByteBuffer data = ByteBuffer.allocate(length);
		ServletUtils.copy(req.getInputStream(), data.asOutputStream());
		data.flip();

		// Decode the objects in the data
		List messages = client.decode(data);
		data.release();
		data = null;
		if (messages == null || messages.isEmpty()) {
			returnMessage(client.getPollingDelay(), resp);
			return;
		}

		// Execute the received RTMP messages
		for (Object message : messages) {
			try {
				handler.messageReceived(client, client.getState(), message);
			} catch (Exception e) {
				log.error("Could not process message.", e);
			}
		}

		// Send results to client
		returnPendingMessages(client, resp);
	}

	/**
	 * Poll RTMPT session for updates.
	 * 
	 * @param req Servlet request
	 * @param resp Servlet response
	 * 
	 * @throws ServletException Servlet exception
	 * @throws IOException I/O exception
	 */
	protected void handleIdle(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		// Skip sent data
		skipData(req);

		RTMPTConnection client = getClient(req);
		if (client == null) {
			handleBadRequest("Unknown client.", resp);
			return;
		} else if (client.isClosing()) {
			// Tell client to close the connection
			returnMessage((byte) 0, resp);
			client.realClose();
			return;
		} else if (client.getState().getState() == RTMP.STATE_DISCONNECTED) {
			removeConnection(client.getId());
			handleBadRequest("Connection already closed.", resp);
			return;
		}

		client.setServletRequest(req);
		returnPendingMessages(client, resp);
	}

	/**
	 * Main entry point for the servlet.
	 * 
	 * @param req Request object
	 * @param resp Response object
	 * 
	 * @throws ServletException the servlet exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	@Override
	protected void service(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		if (!REQUEST_METHOD.equals(req.getMethod())
				|| req.getContentLength() == 0
				|| !CONTENT_TYPE.equals(req.getContentType())) {
			// Bad request - return simple error page
			handleBadRequest("Bad request, only RTMPT supported.", resp);
			return;
		}

		// XXX Paul: since the only current difference in the type of request
		// that we are interested in is the 'second' character, we can double
		// the speed of this entry point by using a switch on the second
		// charater.
		String path = req.getServletPath();
		char p = path.charAt(1);
		switch (p) {
			case 'o': // OPEN_REQUEST
				handleOpen(req, resp);
				break;
			case 'c': // CLOSE_REQUEST
				handleClose(req, resp);
				break;
			case 's': // SEND_REQUEST
				handleSend(req, resp);
				break;
			case 'i': // IDLE_REQUEST
				handleIdle(req, resp);
				break;
			default:
				handleBadRequest(
						"RTMPT command " + path + " is not supported.", resp);
		}

	}

	/** {@inheritDoc} */
	@Override
	public void init() throws ServletException {
		super.init();
		appCtx = WebApplicationContextUtils
				.getWebApplicationContext(getServletContext());
		if (appCtx == null) {
			appCtx = (WebApplicationContext) getServletContext()
					.getAttribute(
							WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
		}
	}

	/** {@inheritDoc} */
	@Override
	public void destroy() {
		// Cleanup connections
		Collection<RTMPConnection> conns = rtmpConnManager.removeConnections();
		for (RTMPConnection conn: conns) {
			conn.close();
		}
		super.destroy();
	}

	/**
	 * A connection has been closed that was created by this servlet.
	 * 
	 * @param conn the conn
	 */
	protected void notifyClosed(RTMPTConnection conn) {
		rtmpConnManager.removeConnection(conn.getId());
	}
	
    /**
     * Gets the connection.
     * 
     * @param clientId the client id
     * 
     * @return the connection
     */
    protected RTMPTConnection getConnection(int clientId) {
    	return (RTMPTConnection) rtmpConnManager.getConnection(clientId);
    }
    
    /**
     * Creates the connection.
     * 
     * @return the rTMPT connection
     */
    protected RTMPTConnection createConnection() {
    	RTMPTConnection conn = (RTMPTConnection) rtmpConnManager.createConnection(RTMPTConnection.class);
    	conn.setRTMPTHandle(handler);
    	handler.connectionOpened(conn, conn.getState());
    	return conn;
    }
    
    /**
     * Removes the connection.
     * 
     * @param clientId the client id
     */
    protected void removeConnection(int clientId) {
    	rtmpConnManager.removeConnection(clientId);
    }
}
