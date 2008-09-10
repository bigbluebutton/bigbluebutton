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
 
import org.apache.mina.common.IoHandlerAdapter;

// TODO: Auto-generated Javadoc
/**
 * The Interface RTMPMinaTransportMBean.
 */
public interface RTMPMinaTransportMBean {

	/**
	 * Sets the address.
	 * 
	 * @param address the new address
	 */
	public void setAddress(String address);
	
	/**
	 * Sets the port.
	 * 
	 * @param port the new port
	 */
	public void setPort(int port);
	
	/**
	 * Sets the io threads.
	 * 
	 * @param ioThreads the new io threads
	 */
	public void setIoThreads(int ioThreads);
	
	/**
	 * Sets the event threads core.
	 * 
	 * @param eventThreadsCore the new event threads core
	 */
	public void setEventThreadsCore(int eventThreadsCore);
	
	/**
	 * Sets the event threads max.
	 * 
	 * @param eventThreadsMax the new event threads max
	 */
	public void setEventThreadsMax(int eventThreadsMax);
	
	/**
	 * Sets the event threads keepalive.
	 * 
	 * @param eventThreadsKeepalive the new event threads keepalive
	 */
	public void setEventThreadsKeepalive(int eventThreadsKeepalive);
	
	/**
	 * Sets the event threads queue.
	 * 
	 * @param eventThreadsQueue the new event threads queue
	 */
	public void setEventThreadsQueue(int eventThreadsQueue);
	
	/**
	 * Sets the checks if is logging traffic.
	 * 
	 * @param isLoggingTraffic the new checks if is logging traffic
	 */
	public void setIsLoggingTraffic(boolean isLoggingTraffic);
	
	/**
	 * Sets the io handler.
	 * 
	 * @param rtmpIOHandler the new io handler
	 */
	public void setIoHandler(IoHandlerAdapter rtmpIOHandler);
	
	/**
	 * Sets the receive buffer size.
	 * 
	 * @param receiveBufferSize the new receive buffer size
	 */
	public void setReceiveBufferSize(int receiveBufferSize);
	
	/**
	 * Sets the send buffer size.
	 * 
	 * @param sendBufferSize the new send buffer size
	 */
	public void setSendBufferSize(int sendBufferSize);
	
	/**
	 * Sets the tcp no delay.
	 * 
	 * @param tcpNoDelay the new tcp no delay
	 */
	public void setTcpNoDelay(boolean tcpNoDelay);
	
	/**
	 * Sets the use heap buffers.
	 * 
	 * @param useHeapBuffers the new use heap buffers
	 */
	public void setUseHeapBuffers(boolean useHeapBuffers);
	
	/**
	 * Start.
	 * 
	 * @throws Exception the exception
	 */
	public void start() throws Exception;
	
	/**
	 * Stop.
	 */
	public void stop();
}