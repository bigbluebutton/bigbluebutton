package org.red5.server.stream.filter;

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

import org.red5.server.messaging.IFilter;
import org.red5.server.messaging.IMessage;
import org.red5.server.messaging.IMessageComponent;
import org.red5.server.messaging.IPipe;
import org.red5.server.messaging.IPipeConnectionListener;
import org.red5.server.messaging.OOBControlMessage;
import org.red5.server.messaging.PipeConnectionEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Controls stream bandwidth.
 */
public class StreamBandwidthController implements IFilter,
		IPipeConnectionListener, Runnable {

    /** Logger. */
    private static final Logger log = LoggerFactory.getLogger(StreamBandwidthController.class);
    
    /** Class name. */
	public static final String KEY = StreamBandwidthController.class.getName();
    
    /** Stream provider pipe. */
	private IPipe providerPipe;
    
    /** Stream consumer pipe. */
	private IPipe consumerPipe;
    
    /** Daemon thread that pulls data from provider and pushes to consumer, using this controller. */
	private Thread puller;

    /** Start state. */
    private boolean isStarted;

	/** {@inheritDoc} */
    public void onPipeConnectionEvent(PipeConnectionEvent event) {
		switch (event.getType()) {
			case PipeConnectionEvent.PROVIDER_CONNECT_PULL:
				if (event.getProvider() != this && providerPipe == null) {
					providerPipe = (IPipe) event.getSource();
				}
				break;
			case PipeConnectionEvent.PROVIDER_DISCONNECT:
				if (event.getSource() == providerPipe) {
					providerPipe = null;
				}
				break;
			case PipeConnectionEvent.CONSUMER_CONNECT_PUSH:
				if (event.getConsumer() != this && consumerPipe == null) {
					consumerPipe = (IPipe) event.getSource();
				}
				break;
			case PipeConnectionEvent.CONSUMER_DISCONNECT:
				if (event.getSource() == consumerPipe) {
					consumerPipe = null;
				}
				break;
			default:
				break;
		}
	}

	/** {@inheritDoc} */
    public void onOOBControlMessage(IMessageComponent source, IPipe pipe,
			OOBControlMessage oobCtrlMsg) {
	}

	/** {@inheritDoc} */
    public void run() {
		while (isStarted && providerPipe != null && consumerPipe != null) {
			try {
				IMessage message = providerPipe.pullMessage();
				if (log.isDebugEnabled()) {
					log.debug("got message: " + message);
				}
				consumerPipe.pushMessage(message);
			} catch (Exception e) {
				break;
			}
		}
		isStarted = false;
	}

    /**
     * Start pulling (streaming).
     */
    public void start() {
		startThread();
	}

    /**
     * Stop pulling, close stream.
     */
    public void close() {
		isStarted = false;
	}

    /**
     * Start puller thread.
     */
    private void startThread() {
		if (!isStarted && providerPipe != null && consumerPipe != null) {
			puller = new Thread(this);
			puller.setDaemon(true);
			isStarted = true;
			puller.start();
		}
	}
}
