package org.red5.server.net.mrtmp;

import java.net.InetSocketAddress;

import org.apache.mina.common.ConnectFuture;
import org.apache.mina.common.IdleStatus;
import org.apache.mina.common.IoHandler;
import org.apache.mina.common.IoSession;
import org.apache.mina.transport.socket.nio.SocketConnector;
import org.apache.mina.transport.socket.nio.SocketConnectorConfig;
import org.apache.mina.transport.socket.nio.SocketSessionConfig;

// TODO: Auto-generated Javadoc
/**
 * The Class MRTMPClient.
 */
public class MRTMPClient implements Runnable {
	
	/** The io handler. */
	private IoHandler ioHandler;
	
	/** The io handler wrapper. */
	private IoHandler ioHandlerWrapper;
	
	/** The server. */
	private String server;
	
	/** The port. */
	private int port;
	
	/** The connect thread. */
	private Thread connectThread;
	
	/** The need reconnect. */
	private boolean needReconnect;
	
	/**
	 * Gets the server.
	 * 
	 * @return the server
	 */
	public String getServer() {
		return server;
	}
	
	/**
	 * Sets the server.
	 * 
	 * @param address the new server
	 */
	public void setServer(String address) {
		this.server = address;
	}
	
	/**
	 * Gets the io handler.
	 * 
	 * @return the io handler
	 */
	public IoHandler getIoHandler() {
		return ioHandler;
	}
	
	/**
	 * Sets the io handler.
	 * 
	 * @param ioHandler the new io handler
	 */
	public void setIoHandler(IoHandler ioHandler) {
		this.ioHandler = ioHandler;
	}
	
	/**
	 * Gets the port.
	 * 
	 * @return the port
	 */
	public int getPort() {
		return port;
	}
	
	/**
	 * Sets the port.
	 * 
	 * @param port the new port
	 */
	public void setPort(int port) {
		this.port = port;
	}
	
	/**
	 * Start.
	 */
	public void start() {
		needReconnect = true;
		ioHandlerWrapper = new IoHandlerWrapper(ioHandler);
		connectThread = new Thread(this, "MRTMPClient");
		connectThread.setDaemon(true);
		connectThread.start();
	}
	
	/* (non-Javadoc)
	 * @see java.lang.Runnable#run()
	 */
	public void run() {
		while (true) {
			synchronized (ioHandlerWrapper) {
				if (needReconnect) {
					doConnect();
					needReconnect = false;
				}
				try {
					ioHandlerWrapper.wait();
				} catch (Exception e) {}
			}
		}
	}
	
	/**
	 * Do connect.
	 */
	private void doConnect() {
		SocketConnector connector = new SocketConnector();
		SocketConnectorConfig config = new SocketConnectorConfig();
		SocketSessionConfig sessionConf =
			(SocketSessionConfig) config.getSessionConfig();
		sessionConf.setTcpNoDelay(true);
		while (true) {
			ConnectFuture future = connector.connect(new InetSocketAddress(server, port), ioHandlerWrapper, config);
			future.join();
			if (future.isConnected()) {
				break;
			}
			try {
				Thread.sleep(500);
			} catch (Exception e) {}
		}
	}
	
	/**
	 * Reconnect.
	 */
	private void reconnect() {
		synchronized (ioHandlerWrapper) {
			needReconnect = true;
			ioHandlerWrapper.notifyAll();
		}
	}
	
	/**
	 * The Class IoHandlerWrapper.
	 */
	private class IoHandlerWrapper implements IoHandler {
		
		/** The wrapped. */
		private IoHandler wrapped;
		
		/**
		 * Instantiates a new io handler wrapper.
		 * 
		 * @param wrapped the wrapped
		 */
		public IoHandlerWrapper(IoHandler wrapped) {
			this.wrapped = wrapped;
		}

		/* (non-Javadoc)
		 * @see org.apache.mina.common.IoHandler#exceptionCaught(org.apache.mina.common.IoSession, java.lang.Throwable)
		 */
		public void exceptionCaught(IoSession session, Throwable cause) throws Exception {
			wrapped.exceptionCaught(session, cause);
			MRTMPClient.this.reconnect();
		}

		/* (non-Javadoc)
		 * @see org.apache.mina.common.IoHandler#messageReceived(org.apache.mina.common.IoSession, java.lang.Object)
		 */
		public void messageReceived(IoSession session, Object message) throws Exception {
			wrapped.messageReceived(session, message);
		}

		/* (non-Javadoc)
		 * @see org.apache.mina.common.IoHandler#messageSent(org.apache.mina.common.IoSession, java.lang.Object)
		 */
		public void messageSent(IoSession session, Object message) throws Exception {
			wrapped.messageSent(session, message);
		}

		/* (non-Javadoc)
		 * @see org.apache.mina.common.IoHandler#sessionClosed(org.apache.mina.common.IoSession)
		 */
		public void sessionClosed(IoSession session) throws Exception {
			wrapped.sessionClosed(session);
		}

		/* (non-Javadoc)
		 * @see org.apache.mina.common.IoHandler#sessionCreated(org.apache.mina.common.IoSession)
		 */
		public void sessionCreated(IoSession session) throws Exception {
			wrapped.sessionCreated(session);
		}

		/* (non-Javadoc)
		 * @see org.apache.mina.common.IoHandler#sessionIdle(org.apache.mina.common.IoSession, org.apache.mina.common.IdleStatus)
		 */
		public void sessionIdle(IoSession session, IdleStatus status) throws Exception {
			wrapped.sessionIdle(session, status);
		}

		/* (non-Javadoc)
		 * @see org.apache.mina.common.IoHandler#sessionOpened(org.apache.mina.common.IoSession)
		 */
		public void sessionOpened(IoSession session) throws Exception {
			wrapped.sessionOpened(session);
		}
	}
}
