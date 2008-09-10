package org.red5.server.net.rtmp.codec;

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

import java.util.List;
import java.util.Map;

import org.apache.mina.common.ByteBuffer;
import org.red5.io.object.Output;
import org.red5.io.object.Serializer;
import org.red5.io.utils.BufferUtils;
import org.red5.server.api.IConnection.Encoding;
import org.red5.server.api.service.IPendingServiceCall;
import org.red5.server.api.service.IServiceCall;
import org.red5.server.net.protocol.BaseProtocolEncoder;
import org.red5.server.net.protocol.ProtocolState;
import org.red5.server.net.protocol.SimpleProtocolEncoder;
import org.red5.server.net.rtmp.RTMPUtils;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.net.rtmp.event.BytesRead;
import org.red5.server.net.rtmp.event.ChunkSize;
import org.red5.server.net.rtmp.event.ClientBW;
import org.red5.server.net.rtmp.event.FlexMessage;
import org.red5.server.net.rtmp.event.FlexStreamSend;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.event.Invoke;
import org.red5.server.net.rtmp.event.Notify;
import org.red5.server.net.rtmp.event.Ping;
import org.red5.server.net.rtmp.event.ServerBW;
import org.red5.server.net.rtmp.event.Unknown;
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.net.rtmp.message.Constants;
import org.red5.server.net.rtmp.message.Header;
import org.red5.server.net.rtmp.message.Packet;
import org.red5.server.net.rtmp.message.SharedObjectTypeMapping;
import org.red5.server.net.rtmp.status.StatusCodes;
import org.red5.server.net.rtmp.status.StatusObject;
import org.red5.server.service.Call;
import org.red5.server.so.ISharedObjectEvent;
import org.red5.server.so.ISharedObjectMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * RTMP protocol encoder encodes RTMP messages and packets to byte buffers.
 */
public class RTMPProtocolEncoder extends BaseProtocolEncoder 
	implements SimpleProtocolEncoder, Constants, IEventEncoder {

    /** Logger. */
    protected static Logger log = LoggerFactory.getLogger(RTMPProtocolEncoder.class
			.getName());

    /** I/O operations logger. */
    protected static Logger ioLog = LoggerFactory.getLogger(RTMPProtocolEncoder.class
			.getName()
			+ ".out");

    /** Serializer object. */
    private Serializer serializer;

	/** {@inheritDoc} */
    public ByteBuffer encode(ProtocolState state, Object message)
			throws Exception {
		try {
			final RTMP rtmp = (RTMP) state;
			if (message instanceof ByteBuffer) {
				return (ByteBuffer) message;
			} else {
				return encodePacket(rtmp, (Packet) message);
			}
		} catch (RuntimeException e) {
			log.error("Error encoding object: ", e);
		}
		return null;
	}

    /**
     * Encode packet.
     * 
     * @param rtmp        RTMP protocol state
     * @param packet      RTMP packet
     * 
     * @return            Encoded data
     */
    public ByteBuffer encodePacket(RTMP rtmp, Packet packet) {

		final Header header = packet.getHeader();
		final int channelId = header.getChannelId();
		final IRTMPEvent message = packet.getMessage();
		ByteBuffer data;

		if (message instanceof ChunkSize) {
			ChunkSize chunkSizeMsg = (ChunkSize) message;
			rtmp.setWriteChunkSize(chunkSizeMsg.getSize());
		}

		try {
			data = encodeMessage(rtmp, header, message);
		} finally {
			message.release();
		}

		if (data.position() != 0) {
			data.flip();
		} else {
			data.rewind();
		}
		header.setSize(data.limit());

		final Header lastHeader = rtmp.getLastWriteHeader(channelId);
		final int headerSize = calculateHeaderSize(header, lastHeader);
		
		rtmp.setLastWriteHeader(channelId, header);
		rtmp.setLastWritePacket(channelId, packet);
		
		final int chunkSize = rtmp.getWriteChunkSize();
		int chunkHeaderSize = 1;
		if (header.getChannelId() > 320)
			chunkHeaderSize = 3;
		else if (header.getChannelId() > 63)
			chunkHeaderSize = 2;
		final int numChunks = (int) Math.ceil(header.getSize()
				/ (float) chunkSize);
		final int bufSize = header.getSize() + headerSize
				+ (numChunks > 0 ? (numChunks - 1) * chunkHeaderSize : 0);
		final ByteBuffer out = ByteBuffer.allocate(bufSize, false);
		
		encodeHeader(header, lastHeader, out);
		
		if (numChunks == 1) {
			// we can do it with a single copy
			BufferUtils.put(out, data, out.remaining());
		} else {
			for (int i = 0; i < numChunks - 1; i++) {
				BufferUtils.put(out, data, chunkSize);
				RTMPUtils.encodeHeaderByte(out, HEADER_CONTINUE, header
						.getChannelId());
			}
			BufferUtils.put(out, data, out.remaining());
		}

		data.release();
		out.flip();
		data = null;

		return out;
	}

    /**
     * Determine type of header to use.
     * 
     * @param header      RTMP message header
     * @param lastHeader  Previous header
     * 
     * @return            Header type to use.
     */
    private byte getHeaderType(Header header, Header lastHeader) {
		byte headerType;
		if (lastHeader == null
				|| header.getStreamId() != lastHeader.getStreamId()
				|| !header.isTimerRelative()) {
            // New header mark if header for another stream
            headerType = HEADER_NEW;
		} else if (header.getSize() != lastHeader.getSize()
				|| header.getDataType() != lastHeader.getDataType()) {
            // Same source header if last header data type or size differ
            headerType = HEADER_SAME_SOURCE;
		} else if (header.getTimer() != lastHeader.getTimer()) {
            // Timer change marker if there's time gap between headers timestamps
            headerType = HEADER_TIMER_CHANGE;
		} else {
            // Continue encoding
            headerType = HEADER_CONTINUE;
		}
		return headerType;
    }
    
    /**
     * Calculate number of bytes necessary to encode the header.
     * 
     * @param header      RTMP message header
     * @param lastHeader  Previous header
     * 
     * @return            Calculated size
     */
    private int calculateHeaderSize(Header header, Header lastHeader) {
		final byte headerType = getHeaderType(header, lastHeader);
		int channelIdAdd;
		if (header.getChannelId() > 320)
			channelIdAdd = 2;
		else if (header.getChannelId() > 63)
			channelIdAdd = 1;
		else
			channelIdAdd = 0;
		
		return RTMPUtils.getHeaderLength(headerType) + channelIdAdd;
    }
    
    /**
     * Encode RTMP header.
     * 
     * @param header      RTMP message header
     * @param lastHeader  Previous header
     * 
     * @return            Encoded header data
     */
    public ByteBuffer encodeHeader(Header header, Header lastHeader) {
    	ByteBuffer result = ByteBuffer.allocate(calculateHeaderSize(header, lastHeader));
    	encodeHeader(header, lastHeader, result);
    	return result;
    }
    
    /**
     * Encode RTMP header into given ByteBuffer.
     * 
     * @param header      RTMP message header
     * @param lastHeader  Previous header
     * @param buf         Buffer to write encoded header to
     * 
     * @return            Encoded header data
     */
    public void encodeHeader(Header header, Header lastHeader, ByteBuffer buf) {
		final byte headerType = getHeaderType(header, lastHeader);
		RTMPUtils.encodeHeaderByte(buf, headerType, header
				.getChannelId());

		switch (headerType) {
			case HEADER_NEW:
				RTMPUtils.writeMediumInt(buf, header.getTimer());
				RTMPUtils.writeMediumInt(buf, header.getSize());
				buf.put(header.getDataType());
				RTMPUtils.writeReverseInt(buf, header.getStreamId());
				break;
			case HEADER_SAME_SOURCE:
				RTMPUtils.writeMediumInt(buf, header.getTimer());
				RTMPUtils.writeMediumInt(buf, header.getSize());
				buf.put(header.getDataType());
				break;
			case HEADER_TIMER_CHANGE:
				RTMPUtils.writeMediumInt(buf, header.getTimer());
				break;
			case HEADER_CONTINUE:
				break;
			default:
		}
	}

    /**
     * Encode message.
     * 
     * @param rtmp        RTMP protocol state
     * @param header      RTMP message header
     * @param message     RTMP message (event)
     * 
     * @return            Encoded message data
     */
    public ByteBuffer encodeMessage(RTMP rtmp, Header header, IRTMPEvent message) {
		switch (header.getDataType()) {
			case TYPE_CHUNK_SIZE:
				return encodeChunkSize((ChunkSize) message);
			case TYPE_INVOKE:
				return encodeInvoke((Invoke) message, rtmp);
			case TYPE_NOTIFY:
				if (((Notify) message).getCall() == null) {
					return encodeStreamMetadata((Notify) message);
				} else {
					return encodeNotify((Notify) message, rtmp);
				}
			case TYPE_PING:
				return encodePing((Ping) message);
			case TYPE_BYTES_READ:
				return encodeBytesRead((BytesRead) message);
			case TYPE_AUDIO_DATA:
				return encodeAudioData((AudioData) message);
			case TYPE_VIDEO_DATA:
				return encodeVideoData((VideoData) message);
			case TYPE_FLEX_SHARED_OBJECT:
				return encodeFlexSharedObject((ISharedObjectMessage) message, rtmp);
			case TYPE_SHARED_OBJECT:
				return encodeSharedObject((ISharedObjectMessage) message, rtmp);
			case TYPE_SERVER_BANDWIDTH:
				return encodeServerBW((ServerBW) message);
			case TYPE_CLIENT_BANDWIDTH:
				return encodeClientBW((ClientBW) message);
			case TYPE_FLEX_MESSAGE:
				return encodeFlexMessage((FlexMessage) message, rtmp);
			case TYPE_FLEX_STREAM_SEND:
				return encodeFlexStreamSend((FlexStreamSend) message);
			default:
				log.warn("Unknown object type: " + header.getDataType());
				return null;
		}
	}

    /**
     * Encode server-side bandwidth event.
     * 
     * @param serverBW    Server-side bandwidth event
     * 
     * @return            Encoded event data
     */
    private ByteBuffer encodeServerBW(ServerBW serverBW) {
		final ByteBuffer out = ByteBuffer.allocate(4);
		out.putInt(serverBW.getBandwidth());
		return out;
	}

    /**
     * Encode client-side bandwidth event.
     * 
     * @param clientBW    Client-side bandwidth event
     * 
     * @return            Encoded event data
     */
    private ByteBuffer encodeClientBW(ClientBW clientBW) {
		final ByteBuffer out = ByteBuffer.allocate(5);
		out.putInt(clientBW.getBandwidth());
		out.put(clientBW.getValue2());
		return out;
	}

	/** {@inheritDoc} */
    public ByteBuffer encodeChunkSize(ChunkSize chunkSize) {
		final ByteBuffer out = ByteBuffer.allocate(4);
		out.putInt(chunkSize.getSize());
		return out;
	}

	/** {@inheritDoc} */
    public ByteBuffer encodeFlexSharedObject(ISharedObjectMessage so, RTMP rtmp) {
		final ByteBuffer out = ByteBuffer.allocate(128);
		out.setAutoExpand(true);
		// TODO: also support sending of AMF3 encoded data
		out.put((byte) 0x00);
    	doEncodeSharedObject(so, rtmp, out);
    	return out;
    }

	/** {@inheritDoc} */
    public ByteBuffer encodeSharedObject(ISharedObjectMessage so, RTMP rtmp) {
		final ByteBuffer out = ByteBuffer.allocate(128);
		out.setAutoExpand(true);
    	doEncodeSharedObject(so, rtmp, out);
    	return out;
    }

    /**
     * Perform the actual encoding of the shared object contents.
     * 
     * @param so the so
     * @param rtmp the rtmp
     * @param out the out
     */
    public void doEncodeSharedObject(ISharedObjectMessage so, RTMP rtmp, ByteBuffer out) {
		final Output output = new org.red5.io.amf.Output(out);

		output.putString(so.getName());
		// SO version
		out.putInt(so.getVersion());
		// Encoding (this always seems to be 2 for persistent shared objects)
		out.putInt(so.isPersistent() ? 2 : 0);
		// unknown field
		out.putInt(0);

		int mark, len;

        for (ISharedObjectEvent event : so.getEvents()) {
            byte type = SharedObjectTypeMapping.toByte(event.getType());

            switch (event.getType()) {
                case SERVER_CONNECT:
                case CLIENT_INITIAL_DATA:
                case CLIENT_CLEAR_DATA:
                    out.put(type);
                    out.putInt(0);
                    break;

                case SERVER_DELETE_ATTRIBUTE:
                case CLIENT_DELETE_DATA:
                case CLIENT_UPDATE_ATTRIBUTE:
                    out.put(type);
                    mark = out.position();
                    out.skip(4); // we will be back
                    output.putString(event.getKey());
                    len = out.position() - mark - 4;
                    out.putInt(mark, len);
                    break;

                case SERVER_SET_ATTRIBUTE:
                case CLIENT_UPDATE_DATA:
                    if (event.getKey() == null) {
                        // Update multiple attributes in one request
                        Map initialData = (Map) event.getValue();

                        for (Object o : initialData.keySet()) {

                            out.put(type);
                            mark = out.position();
                            out.skip(4); // we will be back

                            String key = (String) o;
                            output.putString(key);
                            serializer.serialize(output, initialData.get(key));

                            len = out.position() - mark - 4;
                            out.putInt(mark, len);
                        }
                    } else {
                        out.put(type);
                        mark = out.position();
                        out.skip(4); // we will be back

                        output.putString(event.getKey());
                        serializer.serialize(output, event.getValue());

                        len = out.position() - mark - 4;
                        out.putInt(mark, len);
                    }
                    break;

                case CLIENT_SEND_MESSAGE:
                case SERVER_SEND_MESSAGE:
                    // Send method name and value
                    out.put(type);
                    mark = out.position();
                    out.skip(4);
                    // Serialize name of the handler to call...
                    serializer.serialize(output, event.getKey());
                    // ...and the arguments
                    for (Object arg : (List) event.getValue()) {
                        serializer.serialize(output, arg);
                    }
                    len = out.position() - mark - 4;
                    //log.debug(len);
                    out.putInt(mark, len);
                    //log.info(out.getHexDump());
                    break;

                case CLIENT_STATUS:
                    out.put(type);
                	final String status = event.getKey();
                	final String message = (String) event.getValue();
                	out.putInt(message.length() + status.length() + 4);
                	output.putString(message);
                	output.putString(status);
                    break;
                    
                default:
                    //log.error("Unknown event " + event.getType());
                    // XXX: come back here, need to make this work in server or
                    // client mode
                    // talk to joachim about this part.
                    out.put(type);
                    mark = out.position();
                    //out.putInt(0);
                    out.skip(4); // we will be back
                    output.putString(event.getKey());
                    serializer.serialize(output, event.getValue());
                    len = out.position() - mark - 4;
                    out.putInt(mark, len);
                    break;

            }
        }
	}

	/** {@inheritDoc} */
	public ByteBuffer encodeNotify(Notify notify, RTMP rtmp) {
		return encodeNotifyOrInvoke(notify, rtmp);
	}

	/** {@inheritDoc} */
	public ByteBuffer encodeInvoke(Invoke invoke, RTMP rtmp) {
		return encodeNotifyOrInvoke(invoke, rtmp);
	}

    /**
     * Encode notification event.
     * 
     * @param invoke            Notification event
     * @param rtmp the rtmp
     * 
     * @return                  Encoded event data
     */
    protected ByteBuffer encodeNotifyOrInvoke(Notify invoke, RTMP rtmp) {
		ByteBuffer out = ByteBuffer.allocate(1024);
		out.setAutoExpand(true);
		encodeNotifyOrInvoke(out, invoke, rtmp);
		return out;
	}

    /**
     * Encode notification event and fill given byte buffer.
     * 
     * @param out               Byte buffer to fill
     * @param invoke            Notification event
     * @param rtmp the rtmp
     */
	protected void encodeNotifyOrInvoke(ByteBuffer out, Notify invoke, RTMP rtmp) {
		// TODO: tidy up here
		// log.debug("Encode invoke");
		Output output = new org.red5.io.amf.Output(out);
		final IServiceCall call = invoke.getCall();
		final boolean isPending = (call.getStatus() == Call.STATUS_PENDING);

		if (!isPending) {
			if (log.isDebugEnabled()) {
				log.debug("Call has been executed, send result");
			}
			serializer.serialize(output, call.isSuccess() ? "_result" : "_error"); // seems right
		} else {
			if (log.isDebugEnabled()) {
				log.debug("This is a pending call, send request");
			}
			final String action = (call.getServiceName() == null) ? call
					.getServiceMethodName() : call.getServiceName() + '.'
					+ call.getServiceMethodName();
			serializer.serialize(output, action); // seems right
		}
		if (invoke instanceof Invoke) {
			serializer.serialize(output, Integer.valueOf(invoke.getInvokeId()));
			serializer.serialize(output, invoke.getConnectionParams());
		}

		if (call.getServiceName() == null && "connect".equals(call.getServiceMethodName())) {
			// Response to initial connect, always use AMF0
			output = new org.red5.io.amf.Output(out);
		} else {
			if (rtmp.getEncoding() == Encoding.AMF3) {
				output = new org.red5.io.amf3.Output(out);
			} else {
				output = new org.red5.io.amf.Output(out);
			}
		}

		if (!isPending && (invoke instanceof Invoke)) {
			IPendingServiceCall pendingCall = (IPendingServiceCall) call;
			if (!call.isSuccess()) {
				StatusObject status = generateErrorResult(StatusCodes.NC_CALL_FAILED, call.getException());
				pendingCall.setResult(status);
			}
			if (log.isDebugEnabled()) {
				log.debug("Writing result: " + pendingCall.getResult());
			}
			serializer.serialize(output, pendingCall.getResult());
		} else {
			if (log.isDebugEnabled()) {
				log.debug("Writing params");
			}
			final Object[] args = invoke.getCall().getArguments();
			if (args != null) {
				for (Object element : args) {
					serializer.serialize(output, element);
				}
			}
		}
	}

	/** {@inheritDoc} */
	public ByteBuffer encodePing(Ping ping) {
		int len = 6;
		if (ping.getValue3() != Ping.UNDEFINED) {
			len += 4;
		}
		if (ping.getValue4() != Ping.UNDEFINED) {
			len += 4;
		}
		final ByteBuffer out = ByteBuffer.allocate(len);
		out.putShort(ping.getValue1());
		out.putInt(ping.getValue2());
		if (ping.getValue3() != Ping.UNDEFINED) {
			out.putInt(ping.getValue3());
		}
		if (ping.getValue4() != Ping.UNDEFINED) {
			out.putInt(ping.getValue4());
		}
		return out;
	}

	/** {@inheritDoc} */
	public ByteBuffer encodeBytesRead(BytesRead bytesRead) {
		final ByteBuffer out = ByteBuffer.allocate(4);
		out.putInt(bytesRead.getBytesRead());
		return out;
	}

	/** {@inheritDoc} */
	public ByteBuffer encodeAudioData(AudioData audioData) {
		final ByteBuffer result = audioData.getData();
		result.acquire();
		return result;
	}

	/** {@inheritDoc} */
	public ByteBuffer encodeVideoData(VideoData videoData) {
		final ByteBuffer result = videoData.getData();
		result.acquire();
		return result;
	}

	/** {@inheritDoc} */
    public ByteBuffer encodeUnknown(Unknown unknown) {
		final ByteBuffer result = unknown.getData();
		result.acquire();
		return result;
	}

	/**
	 * Encode stream metadata.
	 * 
	 * @param metaData the meta data
	 * 
	 * @return the byte buffer
	 */
	public ByteBuffer encodeStreamMetadata(Notify metaData) {
		final ByteBuffer result = metaData.getData();
		result.acquire();
		return result;
	}

	/**
	 * Setter for serializer.
	 * 
	 * @param serializer Serializer
	 */
    public void setSerializer(org.red5.io.object.Serializer serializer) {
		this.serializer = serializer;
	}

    /**
     * Encodes Flex message event.
     * 
     * @param msg                Flex message event
     * @param rtmp the rtmp
     * 
     * @return                   Encoded data
     */
    public ByteBuffer encodeFlexMessage(FlexMessage msg, RTMP rtmp) {
		ByteBuffer out = ByteBuffer.allocate(1024);
		out.setAutoExpand(true);
		// Unknown byte, always 0?
		out.put((byte) 0);
		encodeNotifyOrInvoke(out, msg, rtmp);
		return out;
	}

	/**
	 * Encode flex stream send.
	 * 
	 * @param msg the msg
	 * 
	 * @return the byte buffer
	 */
	public ByteBuffer encodeFlexStreamSend(FlexStreamSend msg) {
		final ByteBuffer result = msg.getData();
		result.acquire();
		return result;
	}


}
