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
import java.net.SocketAddress;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import javax.management.ObjectName;

import org.apache.mina.common.ByteBuffer;
import org.apache.mina.common.IoHandlerAdapter;
import org.apache.mina.common.SimpleByteBufferAllocator;
import org.apache.mina.common.ThreadModel;
import org.apache.mina.filter.LoggingFilter;
import org.apache.mina.filter.executor.ExecutorFilter;
import org.apache.mina.integration.jmx.IoServiceManager;
import org.apache.mina.integration.jmx.IoServiceManagerMBean;
import org.apache.mina.transport.socket.nio.SocketAcceptor;
import org.apache.mina.transport.socket.nio.SocketAcceptorConfig;
import org.apache.mina.transport.socket.nio.SocketSessionConfig;
import org.red5.server.jmx.JMXAgent;
import org.red5.server.jmx.JMXFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Transport setup class configures socket acceptor and thread pools for RTMP in Mina.
 * Note: This code originates from AsyncWeb, I've modified it for use with Red5. - Luke
 */
public class RTMPMinaTransport implements RTMPMinaTransportMBean {

	/** The Constant DEFAULT_EVENT_THREADS_CORE. */
	private static final int DEFAULT_EVENT_THREADS_CORE = 16;

	/** The Constant DEFAULT_EVENT_THREADS_KEEPALIVE. */
	private static final int DEFAULT_EVENT_THREADS_KEEPALIVE = 60;

	/** The Constant DEFAULT_EVENT_THREADS_MAX. */
	private static final int DEFAULT_EVENT_THREADS_MAX = 32;

	/** The Constant DEFAULT_EVENT_THREADS_QUEUE. */
	private static final int DEFAULT_EVENT_THREADS_QUEUE = -1;

	/** The Constant DEFAULT_IO_THREADS. */
	private static final int DEFAULT_IO_THREADS = Runtime.getRuntime()
			.availableProcessors() + 1;

	/** The Constant DEFAULT_PORT. */
	private static final int DEFAULT_PORT = 1935;

	/** The Constant DEFAULT_RECEIVE_BUFFER_SIZE. */
	private static final int DEFAULT_RECEIVE_BUFFER_SIZE = 256 * 1024;

	/** The Constant DEFAULT_SEND_BUFFER_SIZE. */
	private static final int DEFAULT_SEND_BUFFER_SIZE = 64 * 1024;

	/** The Constant DEFAULT_TCP_NO_DELAY. */
	private static final boolean DEFAULT_TCP_NO_DELAY = false;

	/** The Constant DEFAULT_USE_HEAP_BUFFERS. */
	private static final boolean DEFAULT_USE_HEAP_BUFFERS = true;

	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(RTMPMinaTransport.class);

	/** The acceptor. */
	private SocketAcceptor acceptor;

	/** The address. */
	private String address = null;

	/** The event executor. */
	private ExecutorService eventExecutor;

	/** The event threads core. */
	private int eventThreadsCore = DEFAULT_EVENT_THREADS_CORE;

	/** The event threads keepalive. */
	private int eventThreadsKeepalive = DEFAULT_EVENT_THREADS_KEEPALIVE;

	/** The event threads max. */
	private int eventThreadsMax = DEFAULT_EVENT_THREADS_MAX;

	/** The event threads queue. */
	private int eventThreadsQueue = DEFAULT_EVENT_THREADS_QUEUE;

	/** The io handler. */
	private IoHandlerAdapter ioHandler;

	/** The service manager. */
	private IoServiceManager serviceManager;
	
	/** The io threads. */
	private int ioThreads = DEFAULT_IO_THREADS;

	/** The is logging traffic. */
	private boolean isLoggingTraffic = false;

	/** MBean object name used for de/registration purposes. */
	private ObjectName oName;
	
	/** The service manager object name. */
	private ObjectName serviceManagerObjectName;
	
	/** The jmx poll interval. */
	private int jmxPollInterval = 1000;

	/** The port. */
	private int port = DEFAULT_PORT;

	/** The receive buffer size. */
	private int receiveBufferSize = DEFAULT_RECEIVE_BUFFER_SIZE;

	/** The send buffer size. */
	private int sendBufferSize = DEFAULT_SEND_BUFFER_SIZE;

	/** The tcp no delay. */
	private boolean tcpNoDelay = DEFAULT_TCP_NO_DELAY;

	/** The use heap buffers. */
	private boolean useHeapBuffers = DEFAULT_USE_HEAP_BUFFERS;

	/**
	 * Inits the io handler.
	 */
	private void initIOHandler() {
		if (ioHandler == null) {
			log.info("No RTMP IO Handler associated - using defaults");
			ioHandler = new RTMPMinaIoHandler();
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setAddress(java.lang.String)
	 */
	public void setAddress(String address) {
		if ("*".equals(address) || "0.0.0.0".equals(address)) {
			address = null;
		}
		this.address = address;
		//update the mbean
		//TODO: get the correct address for fallback when address is null
		JMXAgent.updateMBeanAttribute(oName, "address",
				(address == null ? "0.0.0.0" : address));
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setEventThreadsCore(int)
	 */
	public void setEventThreadsCore(int eventThreadsCore) {
		this.eventThreadsCore = eventThreadsCore;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setEventThreadsKeepalive(int)
	 */
	public void setEventThreadsKeepalive(int eventThreadsKeepalive) {
		this.eventThreadsKeepalive = eventThreadsKeepalive;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setEventThreadsMax(int)
	 */
	public void setEventThreadsMax(int eventThreadsMax) {
		this.eventThreadsMax = eventThreadsMax;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setEventThreadsQueue(int)
	 */
	public void setEventThreadsQueue(int eventThreadsQueue) {
		this.eventThreadsQueue = eventThreadsQueue;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setIoHandler(org.apache.mina.common.IoHandlerAdapter)
	 */
	public void setIoHandler(IoHandlerAdapter rtmpIOHandler) {
		this.ioHandler = rtmpIOHandler;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setIoThreads(int)
	 */
	public void setIoThreads(int ioThreads) {
		this.ioThreads = ioThreads;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setIsLoggingTraffic(boolean)
	 */
	public void setIsLoggingTraffic(boolean isLoggingTraffic) {
		this.isLoggingTraffic = isLoggingTraffic;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setPort(int)
	 */
	public void setPort(int port) {
		this.port = port;
		JMXAgent.updateMBeanAttribute(oName, "port", port);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setReceiveBufferSize(int)
	 */
	public void setReceiveBufferSize(int receiveBufferSize) {
		this.receiveBufferSize = receiveBufferSize;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setSendBufferSize(int)
	 */
	public void setSendBufferSize(int sendBufferSize) {
		this.sendBufferSize = sendBufferSize;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setTcpNoDelay(boolean)
	 */
	public void setTcpNoDelay(boolean tcpNoDelay) {
		this.tcpNoDelay = tcpNoDelay;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#setUseHeapBuffers(boolean)
	 */
	public void setUseHeapBuffers(boolean useHeapBuffers) {
		this.useHeapBuffers = useHeapBuffers;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#start()
	 */
	public void start() throws Exception {
		initIOHandler();

		ByteBuffer.setUseDirectBuffers(!useHeapBuffers); // this is global, oh well.
		if (useHeapBuffers) {
			ByteBuffer.setAllocator(new SimpleByteBufferAllocator()); // dont pool for heap buffers.
        }
		log.info("RTMP Mina Transport Settings");
		log.info("IO Threads: {}", ioThreads);
		log.info("Event Threads - core: {}, max: {}, queue: {}, keepalive: {}", new Object[]{eventThreadsCore, eventThreadsMax, eventThreadsQueue, eventThreadsKeepalive});

		eventExecutor = new ThreadPoolExecutor(eventThreadsCore, eventThreadsMax, eventThreadsKeepalive, TimeUnit.SECONDS, threadQueue(eventThreadsQueue));
		// Avoid the reject by setting CallerRunsPolicy
		// This prevents memory leak in Mina ExecutorFilter
		((ThreadPoolExecutor) eventExecutor).setRejectedExecutionHandler(
				new ThreadPoolExecutor.CallerRunsPolicy()
				);
		
		// Executors.newCachedThreadPool() is always preferred by IoService
		// See http://mina.apache.org/configuring-thread-model.html for details
		acceptor = new SocketAcceptor(ioThreads, Executors.newCachedThreadPool());

		acceptor.getFilterChain().addLast("threadPool", new ExecutorFilter(eventExecutor));

		SocketAcceptorConfig config = acceptor.getDefaultConfig();
		config.setThreadModel(ThreadModel.MANUAL);
		config.setReuseAddress(true);
		config.setBacklog(100);

		log.info("TCP No Delay: {}", tcpNoDelay);
		log.info("Receive Buffer Size: {}", receiveBufferSize);
		log.info("Send Buffer Size: {}", sendBufferSize);

		SocketSessionConfig sessionConf = (SocketSessionConfig) config
				.getSessionConfig();
		sessionConf.setReuseAddress(true);
		sessionConf.setTcpNoDelay(tcpNoDelay);
		sessionConf.setReceiveBufferSize(receiveBufferSize);
		sessionConf.setSendBufferSize(sendBufferSize);

		if (isLoggingTraffic) {
			log.info("Configuring traffic logging filter");
			acceptor.getFilterChain().addFirst("LoggingFilter", new LoggingFilter());
		}

		SocketAddress socketAddress = (address == null) ? new InetSocketAddress(
				port)
				: new InetSocketAddress(address, port);
		acceptor.bind(socketAddress, ioHandler);

		log.info("RTMP Mina Transport bound to {}", socketAddress.toString());

		//create a new mbean for this instance
		oName = JMXFactory.createObjectName("type", "RTMPMinaTransport",
				"address", (address == null ? "0.0.0.0" : address), "port",
				port + "");
		JMXAgent.registerMBean(this, this.getClass().getName(),
				RTMPMinaTransportMBean.class, oName);
		
		//enable only if user wants it
		if (JMXAgent.isEnableMinaMonitor()) {
    		//add a service manager to allow for more introspection into the workings of mina
    		serviceManager = new IoServiceManager(acceptor);
    		//poll every second
    		serviceManager.startCollectingStats(jmxPollInterval);
    		serviceManagerObjectName = JMXFactory.createObjectName("type", "IoServiceManager",
    				"address", (address == null ? "0.0.0.0" : address), "port",
    				port + "");
    		JMXAgent.registerMBean(serviceManager, serviceManager.getClass().getName(), IoServiceManagerMBean.class, serviceManagerObjectName);		
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.RTMPMinaTransportMBean#stop()
	 */
	public void stop() {
		log.info("RTMP Mina Transport unbind");
		acceptor.unbindAll();
		eventExecutor.shutdown();
		// deregister with jmx
		JMXAgent.unregisterMBean(oName);
		if (serviceManagerObjectName != null) {
			//if the service manager (stats collector) is not null then clean up
			if (serviceManager != null) {
    			serviceManager.stopCollectingStats();
    			serviceManager.closeAllSessions();
			}
			JMXAgent.unregisterMBean(serviceManagerObjectName);
		}
	}

	/**
	 * Thread queue.
	 * 
	 * @param size the size
	 * 
	 * @return the blocking queue< runnable>
	 */
	private BlockingQueue<Runnable> threadQueue(int size) {
		switch (size) {
			case -1:
				return new LinkedBlockingQueue<Runnable>();
			case 0:
				return new SynchronousQueue<Runnable>();
			default:
				return new ArrayBlockingQueue<Runnable>(size);
		}
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		return "RTMP Mina Transport [port=" + port + "]";
	}

	/**
	 * Gets the jmx poll interval.
	 * 
	 * @return the jmx poll interval
	 */
	public int getJmxPollInterval() {
		return jmxPollInterval;
	}

	/**
	 * Sets the jmx poll interval.
	 * 
	 * @param jmxPollInterval the new jmx poll interval
	 */
	public void setJmxPollInterval(int jmxPollInterval) {
		this.jmxPollInterval = jmxPollInterval;
	}
}