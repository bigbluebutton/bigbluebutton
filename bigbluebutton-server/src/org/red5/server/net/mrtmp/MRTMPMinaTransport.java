package org.red5.server.net.mrtmp;

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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.mina.common.ByteBuffer;
import org.apache.mina.common.IoFilter;
import org.apache.mina.common.IoHandlerAdapter;
import org.apache.mina.common.SimpleByteBufferAllocator;
import org.apache.mina.common.ThreadModel;
import org.apache.mina.filter.LoggingFilter;
import org.apache.mina.filter.executor.ExecutorFilter;
import org.apache.mina.transport.socket.nio.SocketAcceptor;
import org.apache.mina.transport.socket.nio.SocketAcceptorConfig;
import org.apache.mina.transport.socket.nio.SocketSessionConfig;
import org.red5.server.jmx.JMXAgent;

// TODO: Auto-generated Javadoc
/**
 * The Class MRTMPMinaTransport.
 */
public class MRTMPMinaTransport {
	
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
	private static final Log log = LogFactory.getLog(MRTMPMinaTransport.class);

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

	/** The io threads. */
	private int ioThreads = DEFAULT_IO_THREADS;

	/** The is logging traffic. */
	private boolean isLoggingTraffic = false;

	/** MBean object name used for de/registration purposes. */
	private ObjectName oName;

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
			log.info("No rtmp IO Handler associated - using defaults");
			ioHandler = new OriginMRTMPHandler();
		}
	}

	/**
	 * Sets the address.
	 * 
	 * @param address the new address
	 */
	public void setAddress(String address) {
		if ("*".equals(address) || "0.0.0.0".equals(address)) {
			address = null;
		}
		this.address = address;
	}

	/**
	 * Sets the event threads core.
	 * 
	 * @param eventThreadsCore the new event threads core
	 */
	public void setEventThreadsCore(int eventThreadsCore) {
		this.eventThreadsCore = eventThreadsCore;
	}

	/**
	 * Sets the event threads keepalive.
	 * 
	 * @param eventThreadsKeepalive the new event threads keepalive
	 */
	public void setEventThreadsKeepalive(int eventThreadsKeepalive) {
		this.eventThreadsKeepalive = eventThreadsKeepalive;
	}

	/**
	 * Sets the event threads max.
	 * 
	 * @param eventThreadsMax the new event threads max
	 */
	public void setEventThreadsMax(int eventThreadsMax) {
		this.eventThreadsMax = eventThreadsMax;
	}

	/**
	 * Sets the event threads queue.
	 * 
	 * @param eventThreadsQueue the new event threads queue
	 */
	public void setEventThreadsQueue(int eventThreadsQueue) {
		this.eventThreadsQueue = eventThreadsQueue;
	}

	/**
	 * Sets the io handler.
	 * 
	 * @param rtmpIOHandler the new io handler
	 */
	public void setIoHandler(IoHandlerAdapter rtmpIOHandler) {
		this.ioHandler = rtmpIOHandler;
	}

	/**
	 * Sets the io threads.
	 * 
	 * @param ioThreads the new io threads
	 */
	public void setIoThreads(int ioThreads) {
		this.ioThreads = ioThreads;
	}

	/**
	 * Sets the checks if is logging traffic.
	 * 
	 * @param isLoggingTraffic the new checks if is logging traffic
	 */
	public void setIsLoggingTraffic(boolean isLoggingTraffic) {
		this.isLoggingTraffic = isLoggingTraffic;
	}

	/**
	 * Sets the port.
	 * 
	 * @param port the new port
	 */
	public void setPort(int port) {
		this.port = port;
		JMXAgent.updateMBeanAttribute(oName, "port", port);
	}

	/**
	 * Sets the receive buffer size.
	 * 
	 * @param receiveBufferSize the new receive buffer size
	 */
	public void setReceiveBufferSize(int receiveBufferSize) {
		this.receiveBufferSize = receiveBufferSize;
	}

	/**
	 * Sets the send buffer size.
	 * 
	 * @param sendBufferSize the new send buffer size
	 */
	public void setSendBufferSize(int sendBufferSize) {
		this.sendBufferSize = sendBufferSize;
	}

	/**
	 * Sets the tcp no delay.
	 * 
	 * @param tcpNoDelay the new tcp no delay
	 */
	public void setTcpNoDelay(boolean tcpNoDelay) {
		this.tcpNoDelay = tcpNoDelay;
	}

	/**
	 * Sets the use heap buffers.
	 * 
	 * @param useHeapBuffers the new use heap buffers
	 */
	public void setUseHeapBuffers(boolean useHeapBuffers) {
		this.useHeapBuffers = useHeapBuffers;
	}

	/**
	 * Start.
	 * 
	 * @throws Exception the exception
	 */
	public void start() throws Exception {
		initIOHandler();

		ByteBuffer.setUseDirectBuffers(!useHeapBuffers); // this is global, oh well.
		if (useHeapBuffers)
			ByteBuffer.setAllocator(new SimpleByteBufferAllocator()); // dont pool for heap buffers.

		log.info("MRTMP Mina Transport Settings");
		log.info("IO Threads: " + ioThreads);
		log.info("Event Threads:" + " core: " + eventThreadsCore + "+1"
				+ " max: " + eventThreadsMax + "+1" + " queue: "
				+ eventThreadsQueue + " keepalive: " + eventThreadsKeepalive);

		eventExecutor = new ThreadPoolExecutor(eventThreadsCore + 1,
				eventThreadsMax + 1, eventThreadsKeepalive, TimeUnit.SECONDS,
				threadQueue(eventThreadsQueue));
		// Avoid the reject by setting CallerRunsPolicy
		// This prevents memory leak in Mina ExecutorFilter
		((ThreadPoolExecutor) eventExecutor).setRejectedExecutionHandler(
				new ThreadPoolExecutor.CallerRunsPolicy()
				);

		// Executors.newCachedThreadPool() is always preferred by IoService
		// See http://mina.apache.org/configuring-thread-model.html for details
		acceptor = new SocketAcceptor(ioThreads, Executors.newCachedThreadPool());

		acceptor.getFilterChain().addLast("threadPool",
				new ExecutorFilter(eventExecutor));

		SocketAcceptorConfig config = acceptor.getDefaultConfig();
		config.setThreadModel(ThreadModel.MANUAL);
		config.setReuseAddress(false);
		config.setBacklog(100);

		log.info("TCP No Delay: " + tcpNoDelay);
		log.info("Receive Buffer Size: " + receiveBufferSize);
		log.info("Send Buffer Size: " + sendBufferSize);

		SocketSessionConfig sessionConf = (SocketSessionConfig) config
				.getSessionConfig();
		sessionConf.setReuseAddress(true);
		sessionConf.setTcpNoDelay(tcpNoDelay);
		// XXX ignore the config of buffer settings
//		sessionConf.setReceiveBufferSize(receiveBufferSize);
//		sessionConf.setSendBufferSize(sendBufferSize);

		if (isLoggingTraffic) {
			log.info("Configuring traffic logging filter");
			IoFilter filter = new LoggingFilter();
			acceptor.getFilterChain().addFirst("LoggingFilter", filter);
		}
		
		SocketAddress socketAddress = null;
		while (true) {
			try {
				socketAddress = (address == null) ? new InetSocketAddress(port) : new InetSocketAddress(address, port);
				acceptor.bind(socketAddress, ioHandler);
				break;
			} catch (Exception e) {
				port++;
			}
		}
		
		log.info("MRTMP Mina Transport bound to " + socketAddress.toString());
	}

	/**
	 * Stop.
	 */
	public void stop() {
		log.info("MRTMP Mina Transport unbind");
		acceptor.unbindAll();
		eventExecutor.shutdown();
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
		return "MRTMP Mina Transport [port=" + port + "]";
	}
}
