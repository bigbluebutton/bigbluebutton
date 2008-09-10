package org.red5.server.net.remoting;

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

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.red5.compatibility.flex.data.messages.DataMessage;
import org.red5.compatibility.flex.data.messages.SequencedMessage;
import org.red5.compatibility.flex.messaging.messages.AbstractMessage;
import org.red5.compatibility.flex.messaging.messages.AcknowledgeMessage;
import org.red5.compatibility.flex.messaging.messages.AsyncMessage;
import org.red5.compatibility.flex.messaging.messages.CommandMessage;
import org.red5.compatibility.flex.messaging.messages.Constants;
import org.red5.compatibility.flex.messaging.messages.ErrorMessage;
import org.red5.compatibility.flex.messaging.messages.RemotingMessage;
import org.red5.io.utils.RandomGUID;
import org.red5.server.api.service.IPendingServiceCall;
import org.red5.server.api.service.IServiceInvoker;
import org.red5.server.exception.ClientDetailsException;
import org.red5.server.service.ConversionUtils;
import org.red5.server.service.PendingCall;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Service that can execute compatibility Flex messages.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class FlexMessagingService {

	/** Name of the service. */
	public static final String SERVICE_NAME = "flexMessaging";
	
    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(FlexMessagingService.class);

	/** Service invoker to use. */
	protected IServiceInvoker serviceInvoker;
	
	/** Configured endpoints. */
	@SuppressWarnings("unchecked")
	protected Map<String, Object> endpoints = Collections.EMPTY_MAP;
	
	/**
	 * Setup available end points.
	 * 
	 * @param endpoints the endpoints
	 */
	public void setEndpoints(Map<String, Object> endpoints) {
		this.endpoints = endpoints;
		log.info("Configured endpoints: " + endpoints);
	}
	
	/**
	 * Set the service invoker to use.
	 * 
	 * @param serviceInvoker the service invoker
	 */
	public void setServiceInvoker(IServiceInvoker serviceInvoker) {
		this.serviceInvoker = serviceInvoker;
	}
	
	/**
	 * Construct error message.
	 * 
	 * @param request the request
	 * @param faultCode the fault code
	 * @param faultString the fault string
	 * @param faultDetail the fault detail
	 * 
	 * @return the error message
	 */
	public static ErrorMessage returnError(AbstractMessage request, String faultCode, String faultString, String faultDetail) {
		ErrorMessage result = new ErrorMessage();
		result.timestamp = System.currentTimeMillis();
		result.headers = request.headers;
		result.destination = request.destination;
		result.correlationId = request.messageId;
		result.faultCode = faultCode;
		result.faultString = faultString;
		result.faultDetail = faultDetail;
		return result;
	}

	/**
	 * Construct error message from exception.
	 * 
	 * @param request the request
	 * @param faultCode the fault code
	 * @param faultString the fault string
	 * @param error the error
	 * 
	 * @return the error message
	 */
	public static ErrorMessage returnError(AbstractMessage request, String faultCode, String faultString, Throwable error) {
		ErrorMessage result = returnError(request, faultCode, faultString, "");
		if (error instanceof ClientDetailsException) {
			result.extendedData = ((ClientDetailsException) error).getParameters();
			if (((ClientDetailsException) error).includeStacktrace()) {
				StringBuilder stack = new StringBuilder();
				for (StackTraceElement element: error.getStackTrace()) {
					stack.append(element.toString()).append("\n");
				}
				result.faultDetail = stack.toString();
			}
		}
		return result;
	}

	/**
	 * Handle request coming from <code>mx:RemoteObject</code> tags.
	 * 
	 * @param msg the msg
	 * 
	 * @return the async message
	 * 
	 * @see <a href="http://livedocs.adobe.com/flex/2/langref/mx/rpc/remoting/mxml/RemoteObject.html">Adobe Livedocs (external)</a>
	 */
	public AsyncMessage handleRequest(RemotingMessage msg) {
		setClientId(msg);
		if (serviceInvoker == null) {
			log.error("No service invoker configured: " + msg);
			return returnError(msg, "Server.Invoke.Error", "No service invoker configured.", "No service invoker configured.");
		}
		
		Object endpoint = endpoints.get(msg.destination);
		if (endpoint == null) {
			log.error("Endpoint " + msg.destination + " doesn't exist (" + msg + ")");
			return returnError(msg, "Server.Invoke.Error", "Endpoint " + msg.destination + " doesn't exist.", "Endpoint " + msg.destination + " doesn't exist.");
		}
		
		Object[] args = (Object[]) ConversionUtils.convert(msg.body, Object[].class);
		IPendingServiceCall call = new PendingCall(msg.operation, args);
		try {
			if (!serviceInvoker.invoke(call, endpoint)) {
				if (call.getException() != null) {
					// Use regular exception handling
					Throwable err = call.getException();
					return returnError(msg, "Server.Invoke.Error", err.getMessage(), err);
				}
				return returnError(msg, "Server.Invoke.Error", "Can't invoke method.", "");
			}
		} catch (Throwable err) {
			log.error("Error while invoking method.", err);
			return returnError(msg, "Server.Invoke.Error", err.getMessage(), err);
		}
		
		// We got a valid result from the method call.
		AcknowledgeMessage result = new AcknowledgeMessage();
		result.body = call.getResult();
		result.headers = msg.headers;
		result.clientId = msg.clientId;
		result.correlationId = msg.messageId;
		return result;
	}

	/**
	 * Handle command message request.
	 * 
	 * @param msg the msg
	 * 
	 * @return the async message
	 */
	public AsyncMessage handleRequest(CommandMessage msg) {
		setClientId(msg);
		AsyncMessage result = null;
		switch (msg.operation) {
		case Constants.OPERATION_PING:
			// Send back pong message
			result = new AcknowledgeMessage();
			result.clientId = msg.clientId;
			result.correlationId = msg.messageId;
			break;
		
		case Constants.OPERATION_REGISTER:
			// Send back registration ok
			result = new AcknowledgeMessage();
			result.clientId = msg.clientId;
			result.correlationId = msg.messageId;
			// TODO: store client id and destination to send further updates
			break;
			
		case Constants.OPERATION_POLL:
			// Send back modifications
			result = new AcknowledgeMessage();
			result.clientId = msg.clientId;
			result.correlationId = msg.messageId;
			result.destination = msg.destination;
			// TODO: send back stored updates for this client
			break;
			
		default:
			log.error("Unknown CommandMessage request: " + msg);
			result = returnError(msg, "notImplemented", "Don't know how to handle " + msg, "Don't know how to handle " + msg);
		}
		return result;
	}

	/**
	 * Evaluate update requests sent by a client.
	 * 
	 * @param msg the msg
	 * @param event the event
	 */
	@SuppressWarnings("unchecked")
	private void evaluateDataUpdate(DataMessage msg, DataMessage event) {
		switch (event.operation) {
		case Constants.DATA_OPERATION_UPDATE_ATTRIBUTES:
			List<Object> contents = (List<Object>) event.body;
			@SuppressWarnings("unused")
			List<String> attributeNames = (List<String>) contents.get(0);
			@SuppressWarnings("unused")
			Map<String, Object> oldValues = (Map<String, Object>) contents.get(1);
			@SuppressWarnings("unused")
			Map<String, Object> newValues = (Map<String, Object>) contents.get(2);
			/*
			// Commented out as it triggeres a crash in the compiler on Java 1.5
			for (@SuppressWarnings("unused") String name: attributeNames) {
				// TODO: store attribute change for registered clients
			}
			*/
			break;
			
		default:
			log.error("Unknown data update request: " + event);
		}
	}
	
	/**
	 * Handle messages related to shared objects.
	 * 
	 * @param msg the msg
	 * 
	 * @return the async message
	 */
	@SuppressWarnings("unchecked")
	public AsyncMessage handleRequest(DataMessage msg) {
		setClientId(msg);
		SequencedMessage result = new SequencedMessage();
		result.clientId = msg.clientId;
		result.destination = msg.destination;
		result.correlationId = msg.messageId;
		switch (msg.operation) {
		case Constants.DATA_OPERATION_SET:
			result.body = new Object[]{msg.body};
			result.sequenceId = 0;
			result.sequenceSize = 1;
			// TODO: store initial version of object
			break;
			
		case Constants.DATA_OPERATION_UPDATE:
			for (DataMessage event: (List<DataMessage>) msg.body) {
				evaluateDataUpdate(msg, event);
			}
			AcknowledgeMessage res = new AcknowledgeMessage();
			res.clientId = msg.clientId;
			res.destination = msg.destination;
			res.correlationId = msg.messageId;
			res.body = msg.body;
			return res;

		default:
			log.error("Unknown DataMessage request: " + msg);
			return returnError(msg, "notImplemented", "Don't know how to handle " + msg, "Don't know how to handle " + msg);
				
		}
		return result;
	}
	
	/**
	 * Fallback method to handle arbitrary messages.
	 * 
	 * @param msg the msg
	 * 
	 * @return the error message
	 */
	public ErrorMessage handleRequest(AbstractMessage msg) {
		setClientId(msg);
		log.error("Unknown Flex compatibility request: " + msg);
		return returnError(msg, "notImplemented", "Don't know how to handle " + msg, "Don't know how to handle " + msg);
	}
	
	/**
	 * This is mandatory for client built from Flex 3 or later, or
	 * client will hang with concurrent accesses.
	 * 
	 * @param msg the msg
	 */
	private void setClientId(AbstractMessage msg) {
		if (msg.clientId == null) {
			msg.clientId = new RandomGUID().toString();
		}
	}
	
}
