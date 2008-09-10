package org.red5.server.net.remoting.codec;

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

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.apache.mina.common.ByteBuffer;
import org.apache.mina.common.IoSession;
import org.red5.compatibility.flex.messaging.messages.AbstractMessage;
import org.red5.compatibility.flex.messaging.messages.ErrorMessage;
import org.red5.io.amf.Output;
import org.red5.io.object.Serializer;
import org.red5.server.api.Red5;
import org.red5.server.api.IConnection.Encoding;
import org.red5.server.api.remoting.IRemotingConnection;
import org.red5.server.api.remoting.IRemotingHeader;
import org.red5.server.net.protocol.BaseProtocolEncoder;
import org.red5.server.net.protocol.ProtocolState;
import org.red5.server.net.protocol.SimpleProtocolEncoder;
import org.red5.server.net.remoting.FlexMessagingService;
import org.red5.server.net.remoting.message.RemotingCall;
import org.red5.server.net.remoting.message.RemotingPacket;
import org.red5.server.net.rtmp.status.StatusCodes;
import org.red5.server.service.ServiceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Remoting protocol encoder.
 */
public class RemotingProtocolEncoder extends BaseProtocolEncoder implements SimpleProtocolEncoder {
    
    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(RemotingProtocolEncoder.class);
    
    /** I/O logger. */
	protected static Logger ioLog = LoggerFactory.getLogger(RemotingProtocolEncoder.class.getName() + ".out");

    /** Data serializer. */
    private Serializer serializer;

	/** {@inheritDoc} */
    public ByteBuffer encode(ProtocolState state, Object message) throws Exception {
		RemotingPacket resp = (RemotingPacket) message;
		ByteBuffer buf = ByteBuffer.allocate(1024);
		buf.setAutoExpand(true);
		Output output;
		if (resp.getEncoding() == Encoding.AMF0) {
			buf.putShort((short) 0);  // encoded using AMF0
		} else {
			buf.putShort((short) 3);  // encoded using AMF3
		}
		
		IRemotingConnection conn = (IRemotingConnection) Red5.getConnectionLocal();
		Collection<IRemotingHeader> headers = conn.getHeaders();
		synchronized (headers) {
			buf.putShort((short) headers.size()); // write the header count
			if (resp.getEncoding() == Encoding.AMF0) {
				output = new Output(buf);
			} else {
				output = new org.red5.io.amf3.Output(buf);
			}
			for (IRemotingHeader header: headers) {
				Output.putString(buf, IRemotingHeader.PERSISTENT_HEADER);
				output.writeBoolean(false);
				Map<String, Object> param = new HashMap<String, Object>();
				param.put("name", header.getName());
				param.put("mustUnderstand", header.getMustUnderstand() ? Boolean.TRUE : Boolean.FALSE);
				param.put("data", header.getName());
				serializer.serialize(output, param);
			}
			headers.clear();
		}
		
		buf.putShort((short) resp.getCalls().size()); // write the number of bodies
		for (RemotingCall call: resp.getCalls()) {
			if (log.isDebugEnabled()) {
				log.debug("Call");
			}
			Output.putString(buf, call.getClientResponse());
			if (!call.isMessaging) {
				Output.putString(buf, "null");
			} else {
				Output.putString(buf, "");
			}
			buf.putInt(-1);
			if (log.isDebugEnabled()) {
				log.info("result:" + call.getResult());
			}
			if (call.isAMF3) {
				output = new org.red5.io.amf3.Output(buf);
			} else {
				output = new Output(buf);
			}
			Object result = call.getClientResult();
			if (!call.isSuccess()) {
				if (call.isMessaging && !(result instanceof ErrorMessage)) {
					// Generate proper error result for the Flex messaging client
					AbstractMessage request = (AbstractMessage) call.getArguments()[0];
					if (result instanceof ServiceNotFoundException) {
						ServiceNotFoundException ex = (ServiceNotFoundException) result;
						if (FlexMessagingService.SERVICE_NAME.equals(ex.getServiceName())) {
							result = FlexMessagingService.returnError(request, "serviceNotAvailable", "Flex messaging not activated", ex.getMessage());
						} else {
							// This should never happen as the service name is hardcoded...
							result = FlexMessagingService.returnError(request, "serviceNotAvailable", "Flex messaging not activated", ex.getMessage());
						}
					} else if (result instanceof Throwable) {
						result = FlexMessagingService.returnError(request, "Server.Invoke.Error", ((Throwable) result).getMessage(), (Throwable) result);
					} else {
						result = FlexMessagingService.returnError(request, "Server.Invoke.Error", result.toString(), "");
					}
				} else if (!call.isMessaging) {
					// Generate proper error object to return
					result = generateErrorResult(StatusCodes.NC_CALL_FAILED, call.getException());
				}
			}
			serializer.serialize(output, result);
		}
		//buf.compact();
		buf.flip();
		if (log.isDebugEnabled()) {
			log.debug(">>" + buf.getHexDump());
		}
		return buf;

	}

    /**
     * Dispose I/O session, not implemented yet.
     * 
     * @param ioSession         I/O session
     * 
     * @throws Exception        Exception
     */
	public void dispose(IoSession ioSession) throws Exception {
		// TODO Auto-generated method stub
	}

	/**
	 * Setter for serializer.
	 * 
	 * @param serializer  New serializer
	 */
    public void setSerializer(Serializer serializer) {
		this.serializer = serializer;
	}

}
