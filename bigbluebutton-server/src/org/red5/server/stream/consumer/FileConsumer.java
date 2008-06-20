package org.red5.server.stream.consumer;

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

import java.io.File;
import java.io.IOException;
import java.util.Map;

import org.apache.mina.common.ByteBuffer;
import org.red5.io.IStreamableFile;
import org.red5.io.IStreamableFileFactory;
import org.red5.io.IStreamableFileService;
import org.red5.io.ITag;
import org.red5.io.ITagWriter;
import org.red5.io.StreamableFileFactory;
import org.red5.io.flv.impl.Tag;
import org.red5.server.api.IScope;
import org.red5.server.api.ScopeUtils;
import org.red5.server.api.stream.IClientStream;
import org.red5.server.messaging.IMessage;
import org.red5.server.messaging.IMessageComponent;
import org.red5.server.messaging.IPipe;
import org.red5.server.messaging.IPipeConnectionListener;
import org.red5.server.messaging.IPushableConsumer;
import org.red5.server.messaging.OOBControlMessage;
import org.red5.server.messaging.PipeConnectionEvent;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.message.Constants;
import org.red5.server.stream.IStreamData;
import org.red5.server.stream.message.RTMPMessage;
import org.red5.server.stream.message.ResetMessage;
import org.red5.server.stream.message.StatusMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Consumer that pushes messages to file. Used when recording live streams.
 */
public class FileConsumer implements Constants, IPushableConsumer,
		IPipeConnectionListener {
    
    /** Logger. */
    private static final Logger log = LoggerFactory.getLogger(FileConsumer.class);
    
    /** Scope. */
	private IScope scope;
    
    /** File. */
	private File file;
    
    /** Tag writer. */
	private ITagWriter writer;
    
    /** Operation mode. */
	private String mode;
    
    /** Offset. */
	private int offset;
    
    /** Last write timestamp. */
	private int lastTimestamp;
    
    /** Start timestamp. */
	private int startTimestamp;

    /**
     * Creates file consumer.
     * 
     * @param scope        Scope of consumer
     * @param file         File
     */
	public FileConsumer(IScope scope, File file) {
		this.scope = scope;
		this.file = file;
		offset = 0;
		lastTimestamp = 0;
		startTimestamp = -1;
	}

    /**
     * Push message through pipe
     * Synchronize this method to avoid FLV corruption from abrupt disconnection.
     * 
     * @param pipe         Pipe
     * @param message      Message to push
     * 
     * @throws IOException if message could not be written
     */
    public void pushMessage(IPipe pipe, IMessage message) throws IOException {
		if (message instanceof ResetMessage) {
			startTimestamp = -1;
			offset += lastTimestamp;
			return;
		} else if (message instanceof StatusMessage) {
			return;
		}
		if (!(message instanceof RTMPMessage)) {
			return;
		}
		if (writer == null) {
			init();
		}
		RTMPMessage rtmpMsg = (RTMPMessage) message;
		final IRTMPEvent msg = rtmpMsg.getBody();
		if (startTimestamp == -1) {
			startTimestamp = msg.getTimestamp();
		}
		int timestamp = msg.getTimestamp() - startTimestamp;
		if (timestamp < 0) {
			log.warn("Skipping message with negative timestamp.");
			return;
		}
		lastTimestamp = timestamp;

		ITag tag = new Tag();

		tag.setDataType(msg.getDataType());
		tag.setTimestamp(timestamp + offset);
		if (msg instanceof IStreamData) {
			ByteBuffer data = ((IStreamData) msg).getData().asReadOnlyBuffer();
			tag.setBodySize(data.limit());
			tag.setBody(data);
		}

		try {
		writer.writeTag(tag);
		} catch (IOException e) {
			log.error("error writing tag", e);
		}
	}

    /**
     * Out-of-band control message handler.
     * 
     * @param source            Source of message
     * @param pipe              Pipe that is used to transmit OOB message
     * @param oobCtrlMsg        OOB control message
     */
    public void onOOBControlMessage(IMessageComponent source, IPipe pipe,
			OOBControlMessage oobCtrlMsg) {
		// TODO Auto-generated method stub
	}

    /**
     * Pipe connection event handler.
     * 
     * @param event       Pipe connection event
     */
    public void onPipeConnectionEvent(PipeConnectionEvent event) {
		switch (event.getType()) {
			case PipeConnectionEvent.CONSUMER_CONNECT_PUSH:
				if (event.getConsumer() != this) {
					break;
				}
				Map paramMap = event.getParamMap();
				if (paramMap != null) {
					mode = (String) paramMap.get("mode");
				}
				break;
			case PipeConnectionEvent.CONSUMER_DISCONNECT:
				if (event.getConsumer() != this) {
					break;
				}
			case PipeConnectionEvent.PROVIDER_DISCONNECT:
				// we only support one provider at a time
				// so do releasing when provider disconnects
				uninit();
				break;
			default:
				break;
		}
	}

    /**
     * Initialization.
     * 
     * @throws IOException          I/O exception
     */
    private void init() throws IOException {
		IStreamableFileFactory factory = (IStreamableFileFactory) ScopeUtils
				.getScopeService(scope, IStreamableFileFactory.class,
						StreamableFileFactory.class);
		File folder = file.getParentFile();
		if (!folder.exists())
			if (!folder.mkdirs())
				throw new IOException("can't create parent folder");
		if (!file.isFile()) {
			// Maybe the (previously existing) file has been deleted
			file.createNewFile();
		} else if (!file.canWrite()) {
			throw new IOException("the file is read-only");
		}
		IStreamableFileService service = factory.getService(file);
		IStreamableFile flv = service.getStreamableFile(file);
		if (mode == null || mode.equals(IClientStream.MODE_RECORD)) {
			writer = flv.getWriter();
		} else if (mode.equals(IClientStream.MODE_APPEND)) {
			writer = flv.getAppendWriter();
		} else {
			throw new IllegalStateException("illegal mode type: " + mode);
		}
	}

    /**
     * Reset.
     */
    synchronized private void uninit() {
		if (writer != null) {
			writer.close();
			writer = null;
		}
	}

}
