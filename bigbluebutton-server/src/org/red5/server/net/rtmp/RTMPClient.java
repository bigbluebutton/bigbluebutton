package org.red5.server.net.rtmp;

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

import java.net.InetSocketAddress;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.apache.mina.transport.socket.nio.SocketConnector;
import org.red5.io.object.Deserializer;
import org.red5.io.object.Serializer;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.service.IPendingServiceCall;
import org.red5.server.api.service.IPendingServiceCallback;
import org.red5.server.api.service.IServiceCall;
import org.red5.server.api.service.IServiceCapableConnection;
import org.red5.server.api.service.IServiceInvoker;
import org.red5.server.api.so.IClientSharedObject;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.net.rtmp.codec.RTMPCodecFactory;
import org.red5.server.net.rtmp.event.ChunkSize;
import org.red5.server.net.rtmp.event.Invoke;
import org.red5.server.net.rtmp.event.Notify;
import org.red5.server.net.rtmp.event.Ping;
import org.red5.server.net.rtmp.message.Header;
import org.red5.server.service.Call;
import org.red5.server.service.MethodNotFoundException;
import org.red5.server.service.PendingCall;
import org.red5.server.service.ServiceInvoker;
import org.red5.server.so.ClientSharedObject;
import org.red5.server.so.SharedObjectMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * RTMP client object. Initial client mode code by Christian Eckerle.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Christian Eckerle (ce@publishing-etc.de)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class RTMPClient extends BaseRTMPHandler {
    
    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(RTMPClient.class);
    
    /** I/O handler. */
	private RTMPMinaIoHandler ioHandler;
    
    /** Connection parameters. */
    private Map<String, Object> connectionParams;
    
    /** Connection callback. */
    private IPendingServiceCallback connectCallback;
    
    /** Service provider. */
    private Object serviceProvider;
    
    /** Service invoker. */
    private IServiceInvoker serviceInvoker = new ServiceInvoker();
    
    /** Shared objects map. */
    private Map<String, ClientSharedObject> sharedObjects = new HashMap<String, ClientSharedObject>();

	/**
	 * Constructs a new RTMPClient.
	 */
    public RTMPClient() {
		RTMPCodecFactory codecFactory = new RTMPCodecFactory();
		codecFactory.setDeserializer(new Deserializer());
		codecFactory.setSerializer(new Serializer());
		codecFactory.init();
		
		ioHandler = new RTMPMinaIoHandler();
		ioHandler.setCodecFactory(codecFactory);
		ioHandler.setMode(RTMP.MODE_CLIENT);
		ioHandler.setHandler(this);
		ioHandler.setRtmpConnManager(new RTMPClientConnManager());
	}

    /**
     * Connect RTMP client to server's application via given port.
     * 
     * @param server                 Server
     * @param port                   Connection port
     * @param application            Application at that server
     */
    public void connect(String server, int port, String application) {
		connect(server, port, application, null);
	}

    /**
     * Connect RTMP client to server's application via given port with given connection callback.
     * 
     * @param server                Server
     * @param port                  Connection port
     * @param application           Application at that server
     * @param connectCallback       Connection callback
     */
    public void connect(String server, int port, String application, IPendingServiceCallback connectCallback) {
		// Initialize default connection parameters
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("app", application);
		params.put("tcUrl", "rtmp://"+server+':'+port+'/'+application);
		connect(server, port, params, connectCallback);
	}

    /**
     * Connect RTMP client to server via given port and with given connection parameters.
     * 
     * @param server                 Server
     * @param port                   Connection port
     * @param connectionParams       Connection parameters
     */
    public void connect(String server, int port, Map<String, Object> connectionParams) {
		connect(server, port, connectionParams, null);
	}

    /**
     * Connect.
     * 
     * @param server the server
     * @param port the port
     * @param connectionParams the connection params
     * @param connectCallback the connect callback
     */
    public void connect(String server, int port, Map<String, Object> connectionParams, IPendingServiceCallback connectCallback) {
		this.connectionParams = connectionParams;
		if (!connectionParams.containsKey("objectEncoding"))
			connectionParams.put("objectEncoding", (double) 0);
		
		this.connectCallback = connectCallback;
		SocketConnector connector = new SocketConnector();
		connector.connect(new InetSocketAddress(server, port), ioHandler);
	}
	
	/**
	 * Register object that provides methods that can be called by the server.
	 * 
	 * @param serviceProvider         Service provider
	 */
	public void setServiceProvider(Object serviceProvider) {
		this.serviceProvider = serviceProvider;
	}
	
	/**
	 * Connect to client shared object.
	 * 
	 * @param name                    Client shared object name
	 * @param persistent              SO persistence flag
	 * 
	 * @return                        Client shared object instance
	 */
	public synchronized IClientSharedObject getSharedObject(String name, boolean persistent) {
		ClientSharedObject result = sharedObjects.get(name);
		if (result != null) {
			if (result.isPersistentObject() != persistent)
				throw new RuntimeException("Already connected to a shared object with this name, but with different persistence.");
			
			return result;
		}
		
		result = new ClientSharedObject(name, persistent);
		sharedObjects.put(name, result);
		return result;	
	}

	/**
	 * Invoke a method on the server.
	 * 
	 * @param method                  Method name
	 * @param callback                Callback handler
	 */
	public void invoke(String method, IPendingServiceCallback callback) {
		IConnection conn = Red5.getConnectionLocal();
		if (conn instanceof IServiceCapableConnection)
			((IServiceCapableConnection) conn).invoke(method, callback);
	}

	/**
	 * Invoke a method on the server and pass parameters.
	 * 
	 * @param method                 Method
	 * @param params                 Method call parameters
	 * @param callback               Callback object
	 */
	public void invoke(String method, Object[] params,
			IPendingServiceCallback callback) {
		IConnection conn = Red5.getConnectionLocal();
		if (conn instanceof IServiceCapableConnection)
			((IServiceCapableConnection) conn).invoke(method, params, callback);
	}
	
	/** {@inheritDoc} */
    @Override
	public void connectionOpened(RTMPConnection conn, RTMP state) {
		// Send "connect" call to the server
		Channel channel = conn.getChannel((byte) 3);
		PendingCall pendingCall = new PendingCall("connect");
		Invoke invoke = new Invoke(pendingCall);
		invoke.setConnectionParams(connectionParams);
		invoke.setInvokeId(conn.getInvokeId());
		if (connectCallback != null)
			pendingCall.registerCallback(connectCallback);
		conn.registerPendingCall(invoke.getInvokeId(), pendingCall);
		channel.write(invoke);
	}
	
	/** {@inheritDoc} */
    @Override
	protected void onInvoke(RTMPConnection conn, Channel channel,
			Header source, Notify invoke, RTMP rtmp) {
		final IServiceCall call = invoke.getCall();
		if (call.getServiceMethodName().equals("_result")
				|| call.getServiceMethodName().equals("_error")) {
			handlePendingCallResult(conn, invoke);
			return;
		}
		
		if (serviceProvider == null) {
			// Client doesn't support calling methods on him
			call.setStatus(Call.STATUS_METHOD_NOT_FOUND);
			call.setException(new MethodNotFoundException(
					call.getServiceMethodName()));
		} else {
			serviceInvoker.invoke(call, serviceProvider);
		}
		
		if (call instanceof IPendingServiceCall) {
			IPendingServiceCall psc = (IPendingServiceCall) call;
			Object result = psc.getResult();
			if (result instanceof DeferredResult) {
				DeferredResult dr = (DeferredResult) result;
				dr.setInvokeId(invoke.getInvokeId());
				dr.setServiceCall(psc);
				dr.setChannel(channel);
				conn.registerDeferredResult(dr);
			} else {
				Invoke reply = new Invoke();
				reply.setCall(call);
				reply.setInvokeId(invoke.getInvokeId());
				channel.write(reply);
			}
		}
	}

	/** {@inheritDoc} */
    @Override
	protected void onChunkSize(RTMPConnection conn, Channel channel,
			Header source, ChunkSize chunkSize) {
		// TODO: implement this
		log.info("ChunkSize is not implemented yet: " + chunkSize);
	}

	/** {@inheritDoc} */
    @Override
	protected void onPing(RTMPConnection conn, Channel channel,
			Header source, Ping ping) {
		switch (ping.getValue1()) {
			case 6:
				// The server wants to measure the RTT
				Ping pong = new Ping();
				pong.setValue1((short) Ping.PONG_SERVER);
				int now = (int) (System.currentTimeMillis() & 0xffffffff);
				pong.setValue2(now);
				pong.setValue3(Ping.UNDEFINED);
				conn.ping(pong);
				break;
				
			default:
				log.warn("Unhandled ping: " + ping);
		}
	}

	/** {@inheritDoc} */
    @Override
	protected void onSharedObject(RTMPConnection conn, Channel channel,
			Header source, SharedObjectMessage object) {
		ClientSharedObject so = sharedObjects.get(object.getName());
		if (so == null) {
			log.error("Ignoring request for non-existend SO: " + object);
			return;
		}
		if (so.isPersistentObject() != object.isPersistent()) {
			log.error("Ignoring request for wrong-persistent SO: " + object);
			return;
		}
		if (log.isDebugEnabled()) {
			log.debug("Received SO request: " + object);
		}
		so.dispatchEvent(object);
	}

    /**
     * The Class RTMPClientConnManager.
     */
    private class RTMPClientConnManager implements IRTMPConnManager {

		/* (non-Javadoc)
		 * @see org.red5.server.net.rtmp.IRTMPConnManager#createConnection(java.lang.Class)
		 */
		public RTMPConnection createConnection(Class connCls) {
			if (connCls != RTMPMinaConnection.class) {
				throw new IllegalArgumentException("Only support RTMPMinaConnection!");
			}
			RTMPMinaConnection conn = new RTMPMinaConnection();
			// TODO set conn properties
			return conn;
		}

		/* (non-Javadoc)
		 * @see org.red5.server.net.rtmp.IRTMPConnManager#getConnection(int)
		 */
		public RTMPConnection getConnection(int clientId) {
			// TODO Auto-generated method stub
			return null;
		}

		/* (non-Javadoc)
		 * @see org.red5.server.net.rtmp.IRTMPConnManager#removeConnection(int)
		 */
		public RTMPConnection removeConnection(int clientId) {
			// TODO Auto-generated method stub
			return null;
		}

		/* (non-Javadoc)
		 * @see org.red5.server.net.rtmp.IRTMPConnManager#removeConnections()
		 */
		public Collection<RTMPConnection> removeConnections() {
			// TODO Auto-generated method stub
			return null;
		}
    }
}
