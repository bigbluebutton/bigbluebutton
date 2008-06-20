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

import org.red5.server.api.stream.IClientStream;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.event.Invoke;
import org.red5.server.net.rtmp.event.Notify;
import org.red5.server.net.rtmp.message.Header;
import org.red5.server.net.rtmp.message.Packet;
import org.red5.server.net.rtmp.status.Status;
import org.red5.server.net.rtmp.status.StatusCodes;
import org.red5.server.service.Call;
import org.red5.server.service.PendingCall;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Identified connection that transfers packets.
 */
public class Channel {
    
    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(Channel.class);
    
    /** RTMP connection used to transfer packets. */
	private RTMPConnection connection;

    /** Channel id. */
    private int id;

	//private Stream stream;
    /**
	 * Creates channel from connection and channel id.
	 * 
	 * @param conn                Connection
	 * @param channelId           Channel id
	 */
	public Channel(RTMPConnection conn, int channelId) {
		connection = conn;
		id = channelId;
	}

    /**
     * Closes channel with this id on RTMP connection.
     */
    public void close() {
		connection.closeChannel(id);
	}

	/**
	 * Getter for id.
	 * 
	 * @return  Channel ID
	 */
    public int getId() {
		return id;
	}
	
	/**
	 * Getter for RTMP connection.
	 * 
	 * @return  RTMP connection
	 */
    protected RTMPConnection getConnection() {
		return connection;
	}

    /**
     * Writes packet from event data to RTMP connection.
     * 
     * @param event          Event data
     */
    public void write(IRTMPEvent event) {
		final IClientStream stream = connection.getStreamByChannelId(id);
		if (id > 3 && stream == null) {
			log.info("Stream doesn't exist any longer, discarding message "
					+ event);
			return;
		}

		final int streamId = (stream == null) ? 0 : stream.getStreamId();
		write(event, streamId);
	}

    /**
     * Writes packet from event data to RTMP connection and stream id.
     * 
     * @param event           Event data
     * @param streamId        Stream id
     */
    private void write(IRTMPEvent event, int streamId) {

		final Header header = new Header();
		final Packet packet = new Packet(header, event);

		header.setChannelId(id);
		header.setTimer(event.getTimestamp());
		header.setStreamId(streamId);
		header.setDataType(event.getDataType());
		if (event.getHeader() != null) {
			header.setTimerRelative(event.getHeader().isTimerRelative());
		}

		// should use RTMPConnection specific method.. 
		connection.write(packet);

	}

    /**
     * Sends status notification.
     * 
     * @param status           Status
     */
    public void sendStatus(Status status) {
		final boolean andReturn = !status.getCode().equals(
				StatusCodes.NS_DATA_START);
		final Invoke invoke;
		if (andReturn) {
			final PendingCall call = new PendingCall(null, "onStatus",
					new Object[] { status });
			invoke = new Invoke();
			invoke.setInvokeId(1);
			invoke.setCall(call);
		} else {
			final Call call = new Call(null, "onStatus", new Object[] { status });
			invoke = (Invoke) new Notify();
			invoke.setInvokeId(1);
			invoke.setCall(call);
		}
		// We send directly to the corresponding stream as for
		// some status codes, no stream has been created and thus
		// "getStreamByChannelId" will fail.
		write(invoke, connection.getStreamIdForChannel(id));
	}

}
