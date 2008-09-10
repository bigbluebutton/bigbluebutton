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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.mina.common.ByteBuffer;
import org.red5.io.amf.AMF;
import org.red5.io.object.Deserializer;
import org.red5.io.object.Input;
import org.red5.io.utils.BufferUtils;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.IConnection.Encoding;
import org.red5.server.net.protocol.HandshakeFailedException;
import org.red5.server.net.protocol.ProtocolException;
import org.red5.server.net.protocol.ProtocolState;
import org.red5.server.net.protocol.SimpleProtocolDecoder;
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
import org.red5.server.service.Call;
import org.red5.server.service.PendingCall;
import org.red5.server.so.FlexSharedObjectMessage;
import org.red5.server.so.ISharedObjectEvent;
import org.red5.server.so.ISharedObjectMessage;
import org.red5.server.so.SharedObjectMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * RTMP protocol decoder.
 */
public class RTMPProtocolDecoder implements Constants, SimpleProtocolDecoder,
		IEventDecoder {

    /** Logger. */
    protected static Logger log = LoggerFactory.getLogger(RTMPProtocolDecoder.class
			.getName());

    /** I/O logger. */
    protected static Logger ioLog = LoggerFactory.getLogger(RTMPProtocolDecoder.class
			.getName()
			+ ".in");

    /** Deserializer. */
    private Deserializer deserializer;

	/**
	 * Constructs a new RTMPProtocolDecoder.
	 */
    public RTMPProtocolDecoder() {

	}

    /**
     * Setter for deserializer.
     * 
     * @param deserializer  Deserializer
     */
    public void setDeserializer(Deserializer deserializer) {
		this.deserializer = deserializer;
	}

    /** {@inheritDoc} */
    public List decodeBuffer(ProtocolState state, ByteBuffer buffer) {

		final List<Object> result = new LinkedList<Object>();

		try {
			while (true) {

				final int remaining = buffer.remaining();
				if (state.canStartDecoding(remaining)) {
					state.startDecoding();
				} else {
					break;
				}

				final Object decodedObject = decode(state, buffer);

				if (state.hasDecodedObject()) {
					result.add(decodedObject);
				} else if (state.canContinueDecoding()) {
					continue;
				} else {
					break;
				}

				if (!buffer.hasRemaining()) {
					break;
				}
			}
		} catch (HandshakeFailedException hfe) {
		    // patched by Victor to clear buffer if something is wrong in protocol decoding.
		    buffer.clear();

			IConnection conn = Red5.getConnectionLocal();
			if (conn != null) {
				conn.close();
			} else {
				log.error("Handshake validation failed but no current connection!?");
			}
			return null;
		// Exception handling is patched by Victor - we catch any exception in the decoding
		// Then clear the buffer to eliminate memory leaks when we can't parse protocol
		// Also close Connection because we can't parse data from it
		} catch (Exception ex) {
			log.error("Error decoding buffer", ex);
            buffer.clear();
            IConnection conn = Red5.getConnectionLocal();
            if (conn != null) {
                    log.warn("Closing connection because decoding failed: "+conn.toString());
                    conn.close();
            } else {
                    log.error("Decoding buffer failed but no current connection!?");
            }
            return null;
		} finally {
			buffer.compact();
		}
		return result;
	}

    /**
     * Setup the classloader to use when deserializing custom objects.
     */
	protected void setupClassLoader() {
		IConnection conn = Red5.getConnectionLocal();
		if (conn == null) {
			return;
		}

		IScope scope = conn.getScope();
		if (scope != null) {
			Thread.currentThread().setContextClassLoader(scope.getClassLoader());
		}
	}

    /**
     * Decodes byte buffer.
     * 
     * @param state                   Protocol state
     * @param in                      Input byte buffer
     * 
     * @return                        Decoded object
     * 
     * @throws ProtocolException      Exception during decoding
     */
    public Object decode(ProtocolState state, ByteBuffer in)
			throws ProtocolException {
		int start = in.position();
		try {
			final RTMP rtmp = (RTMP) state;
			switch (rtmp.getState()) {
				case RTMP.STATE_CONNECTED:
					return decodePacket(rtmp, in);
				case RTMP.STATE_ERROR:
					// attempt to correct error
					return null;
				case RTMP.STATE_CONNECT:
				case RTMP.STATE_HANDSHAKE:
					return decodeHandshake(rtmp, in);
				default:
					return null;
			}
		} catch (ProtocolException pe) {
			// Raise to caller unmodified
			throw pe;
		} catch (RuntimeException e) {
			throw new ProtocolException("Error during decoding", e);
		}
	}

    /**
     * Decodes handshake message.
     * 
     * @param rtmp                    RTMP protocol state
     * @param in                      Byte buffer
     * 
     * @return                        Byte buffer
     */
    public ByteBuffer decodeHandshake(RTMP rtmp, ByteBuffer in) {

		final int remaining = in.remaining();

		if (rtmp.getMode() == RTMP.MODE_SERVER) {

			if (rtmp.getState() == RTMP.STATE_CONNECT) {

				if (remaining < HANDSHAKE_SIZE + 1) {
					if (log.isDebugEnabled()) {
						log.debug("Handshake init too small, buffering. remaining: " + remaining);
					}
					rtmp.bufferDecoding(HANDSHAKE_SIZE + 1);
					return null;
				} else {
					final ByteBuffer hs = ByteBuffer.allocate(HANDSHAKE_SIZE);
					in.get(); // skip the header byte
					BufferUtils.put(hs, in, HANDSHAKE_SIZE);
					hs.flip();
					rtmp.setState(RTMP.STATE_HANDSHAKE);
					return hs;
				}
			}

			if (rtmp.getState() == RTMP.STATE_HANDSHAKE) {
				if (log.isDebugEnabled()) {
					log.debug("Handshake reply");
				}
				if (remaining < HANDSHAKE_SIZE) {
					if (log.isDebugEnabled()) {
						log.debug("Handshake reply too small, buffering. remaining: " + remaining);
					}
					rtmp.bufferDecoding(HANDSHAKE_SIZE);
					return null;
				} else {
					// Skip first 8 bytes when comparing the handshake, they seem to
					// be changed when connecting from a Mac client.
					if (!rtmp.validateHandshakeReply(in, 8, HANDSHAKE_SIZE-8)) {
						if (log.isDebugEnabled()) {
							log.debug("Handshake reply validation failed, disconnecting client.");
						}
						in.skip(HANDSHAKE_SIZE);
						rtmp.setState(RTMP.STATE_ERROR);
						throw new HandshakeFailedException("Handshake validation failed");
					}
					in.skip(HANDSHAKE_SIZE);
					rtmp.setState(RTMP.STATE_CONNECTED);
					rtmp.continueDecoding();
					return null;
				}
			}

		} else {
			// else, this is client mode.
			if (rtmp.getState() == RTMP.STATE_CONNECT) {
				final int size = (2 * HANDSHAKE_SIZE) + 1;
				if (remaining < size) {
					if (log.isDebugEnabled()) {
						log.debug("Handshake init too small, buffering. remaining: " + remaining);
					}
					rtmp.bufferDecoding(size);
					return null;
				} else {
					final ByteBuffer hs = ByteBuffer.allocate(size);
					BufferUtils.put(hs, in, size);
					hs.flip();
					rtmp.setState(RTMP.STATE_CONNECTED);
					return hs;
				}
			}
		}
		return null;
	}

    /**
     * Decodes packet.
     * 
     * @param rtmp                    RTMP protocol state
     * @param in                      Byte buffer
     * 
     * @return                        Byte buffer
     */
    public Packet decodePacket(RTMP rtmp, ByteBuffer in) {

		final int remaining = in.remaining();

		// We need at least one byte
		if (remaining < 1) {
			rtmp.bufferDecoding(1);
			return null;
		}

		final int position = in.position();
		byte headerByte = in.get();
		int headerValue;
		int byteCount;
		if ((headerByte & 0x3f) == 0) {
			// Two byte header
			if (remaining < 2) {
				in.position(position);
				rtmp.bufferDecoding(2);
				return null;
			}
			headerValue = ((int) headerByte & 0xff) << 8 | ((int) in.get() & 0xff);
			byteCount = 2;
		} else if ((headerByte & 0x3f) == 1) {
			// Three byte header
			if (remaining < 3) {
				in.position(position);
				rtmp.bufferDecoding(3);
				return null;
			}
			headerValue = ((int) headerByte & 0xff) << 16 | ((int) in.get() & 0xff) << 8 | ((int) in.get() & 0xff);
			byteCount = 3;
		} else {
			// Single byte header
			headerValue = (int) headerByte & 0xff;
			byteCount = 1;
		}
		final int channelId = RTMPUtils.decodeChannelId(headerValue, byteCount);

		if (channelId < 0) {
			throw new ProtocolException("Bad channel id: " + channelId);
		}

		// Get the header size and length
		int headerLength = RTMPUtils.getHeaderLength(RTMPUtils.decodeHeaderSize(headerValue, byteCount));
		headerLength += byteCount - 1;

		if (headerLength > remaining) {
			if (log.isDebugEnabled()) {
				log.debug("Header too small, buffering. remaining: " + remaining);
			}
			in.position(position);
			rtmp.bufferDecoding(headerLength);
			return null;
		}

		// Move the position back to the start
		in.position(position);

		final Header header = decodeHeader(in, rtmp
				.getLastReadHeader(channelId));

		if (header == null) {
			throw new ProtocolException("Header is null, check for error");
		}

		// Save the header
		rtmp.setLastReadHeader(channelId, header);

		// Check to see if this is a new packets or continue decoding an
		// existing one.
		Packet packet = rtmp.getLastReadPacket(channelId);

		if (packet == null) {
			packet = new Packet(header);
			rtmp.setLastReadPacket(channelId, packet);
		}

		final ByteBuffer buf = packet.getData();
		final int addSize = (header.getTimer() == 0xffffff ? 4 : 0);
		final int readRemaining = header.getSize() + addSize - buf.position();
		final int chunkSize = rtmp.getReadChunkSize();
		final int readAmount = (readRemaining > chunkSize) ? chunkSize
				: readRemaining;

		if (in.remaining() < readAmount) {
			if (log.isDebugEnabled()) {
				log.debug("Chunk too small, buffering (" + in.remaining() + ','
						+ readAmount);
			}
			// skip the position back to the start
			in.position(position);
			rtmp.bufferDecoding(headerLength + readAmount);
			return null;
		}

		BufferUtils.put(buf, in, readAmount);

		if (buf.position() < header.getSize() + addSize) {
			rtmp.continueDecoding();
			return null;
		}

		if (log.isWarnEnabled()) {
			// Check workaround for SN-19 to find cause for BufferOverflowException
			if (buf.position() > header.getSize() + addSize) {
				log.warn("Packet size expanded from " + (header.getSize() + addSize) +
						" to " + buf.position() + " (" + header + ")");
			}
		}

		buf.flip();

		try {
			final IRTMPEvent message = decodeMessage(rtmp, packet.getHeader(), buf);
			packet.setMessage(message);

			if (message instanceof ChunkSize) {
				ChunkSize chunkSizeMsg = (ChunkSize) message;
				rtmp.setReadChunkSize(chunkSizeMsg.getSize());
			}
		} finally {
			rtmp.setLastReadPacket(channelId, null);
		}
		return packet;

	}

    /**
     * Decodes packet header.
     * 
     * @param in                      Input byte buffer
     * @param lastHeader              Previous header
     * 
     * @return                        Decoded header
     */
    public Header decodeHeader(ByteBuffer in, Header lastHeader) {

		byte headerByte = in.get();
		int headerValue;
		int byteCount = 1;
		if ((headerByte & 0x3f) == 0) {
			// Two byte header
			headerValue = ((int) headerByte & 0xff) << 8 | ((int) in.get() & 0xff);
			byteCount = 2;
		} else if ((headerByte & 0x3f) == 1) {
			// Three byte header
			headerValue = ((int) headerByte & 0xff) << 16 | ((int) in.get() & 0xff) << 8 | ((int) in.get() & 0xff);
			byteCount = 3;
		} else {
			// Single byte header
			headerValue = (int) headerByte & 0xff;
			byteCount = 1;
		}
		final int channelId = RTMPUtils.decodeChannelId(headerValue, byteCount);
		final int headerSize = RTMPUtils.decodeHeaderSize(headerValue, byteCount);
		Header header = new Header();
		header.setChannelId(channelId);
		header.setTimerRelative(headerSize != HEADER_NEW);

		switch (headerSize) {

			case HEADER_NEW:
				header.setTimer(RTMPUtils.readUnsignedMediumInt(in));
				header.setSize(RTMPUtils.readMediumInt(in));
				header.setDataType(in.get());
				header.setStreamId(RTMPUtils.readReverseInt(in));
				break;

			case HEADER_SAME_SOURCE:
				header.setTimer(RTMPUtils.readUnsignedMediumInt(in));
				header.setSize(RTMPUtils.readMediumInt(in));
				header.setDataType(in.get());
				header.setStreamId(lastHeader.getStreamId());
				break;

			case HEADER_TIMER_CHANGE:
				header.setTimer(RTMPUtils.readUnsignedMediumInt(in));
				header.setSize(lastHeader.getSize());
				header.setDataType(lastHeader.getDataType());
				header.setStreamId(lastHeader.getStreamId());
				break;

			case HEADER_CONTINUE:
				header.setTimer(lastHeader.getTimer());
				header.setSize(lastHeader.getSize());
				header.setDataType(lastHeader.getDataType());
				header.setStreamId(lastHeader.getStreamId());
				break;

			default:
				log.error("Unexpected header size: " + headerSize);
				return null;

		}
		return header;
	}

    /**
     * Decodes RTMP message event.
     * 
     * @param rtmp                    RTMP protocol state
     * @param header                  RTMP header
     * @param in                      Input byte buffer
     * 
     * @return                        RTMP event
     */
    public IRTMPEvent decodeMessage(RTMP rtmp, Header header, ByteBuffer in) {
		IRTMPEvent message;
		if (header.getTimer() == 0xffffff) {
			// Skip first four bytes
			int unknown = in.getInt();
			if (log.isDebugEnabled()) {
				log.debug("Unknown 4 bytes: " + unknown);
			}
		}

		switch (header.getDataType()) {
			case TYPE_CHUNK_SIZE:
				message = decodeChunkSize(in);
				break;
			case TYPE_INVOKE:
				message = decodeInvoke(in, rtmp);
				break;
			case TYPE_NOTIFY:
				if (header.getStreamId() == 0)
					message = decodeNotify(in, header, rtmp);
				else
					message = decodeStreamMetadata(in);
				break;
			case TYPE_PING:
				message = decodePing(in);
				break;
			case TYPE_BYTES_READ:
				message = decodeBytesRead(in);
				break;
			case TYPE_AUDIO_DATA:
				message = decodeAudioData(in);
				break;
			case TYPE_VIDEO_DATA:
				message = decodeVideoData(in);
				break;
			case TYPE_FLEX_SHARED_OBJECT:
				message = decodeFlexSharedObject(in, rtmp);
				break;
			case TYPE_SHARED_OBJECT:
				message = decodeSharedObject(in, rtmp);
				break;
			case TYPE_SERVER_BANDWIDTH:
				message = decodeServerBW(in);
				break;
			case TYPE_CLIENT_BANDWIDTH:
				message = decodeClientBW(in);
				break;
			case TYPE_FLEX_MESSAGE:
				message = decodeFlexMessage(in, rtmp);
				break;
			case TYPE_FLEX_STREAM_SEND:
				message = decodeFlexStreamSend(in);
				break;
			default:
				log.warn("Unknown object type: " + header.getDataType());
				message = decodeUnknown(header.getDataType(), in);
				break;
		}
		message.setHeader(header);
		message.setTimestamp(header.getTimer());
		return message;
	}

    /**
     * Decodes server bandwidth.
     * 
     * @param in                      Byte buffer
     * 
     * @return                        RTMP event
     */
    private IRTMPEvent decodeServerBW(ByteBuffer in) {
		return new ServerBW(in.getInt());
	}

    /**
     * Decodes client bandwidth.
     * 
     * @param in                      Byte buffer
     * 
     * @return                        RTMP event
     */
    private IRTMPEvent decodeClientBW(ByteBuffer in) {
		return new ClientBW(in.getInt(), in.get());
	}

	/** {@inheritDoc} */
	public Unknown decodeUnknown(byte dataType, ByteBuffer in) {
		return new Unknown(dataType, in.asReadOnlyBuffer());
	}

	/** {@inheritDoc} */
	public ChunkSize decodeChunkSize(ByteBuffer in) {
		return new ChunkSize(in.getInt());
	}

	/** {@inheritDoc} */
	public ISharedObjectMessage decodeFlexSharedObject(ByteBuffer in, RTMP rtmp) {
		byte encoding = in.get();
		Input input;
		if (encoding == 0) {
			input = new org.red5.io.amf.Input(in);
		} else if (encoding == 3) {
			input = new org.red5.io.amf3.Input(in);
		} else {
			throw new RuntimeException("Unknown SO encoding: " + encoding);
		}
		String name = input.getString();
		// Read version of SO to modify
		int version = in.getInt();
		// Read persistence informations
		boolean persistent = in.getInt() == 2;
		// Skip unknown bytes
		in.skip(4);

		final SharedObjectMessage so = new FlexSharedObjectMessage(null, name,
				version, persistent);
		doDecodeSharedObject(so, in, input);
		return so;
	}

	/** {@inheritDoc} */
	public ISharedObjectMessage decodeSharedObject(ByteBuffer in, RTMP rtmp) {
		final Input input = new org.red5.io.amf.Input(in);
		String name = input.getString();
		// Read version of SO to modify
		int version = in.getInt();
		// Read persistence informations
		boolean persistent = in.getInt() == 2;
		// Skip unknown bytes
		in.skip(4);

		final SharedObjectMessage so = new FlexSharedObjectMessage(null, name,
				version, persistent);
		doDecodeSharedObject(so, in, input);
		return so;
	}

	/**
	 * Perform the actual decoding of the shared object contents.
	 * 
	 * @param so the so
	 * @param in the in
	 * @param input the input
	 */
	protected void doDecodeSharedObject(SharedObjectMessage so, ByteBuffer in, Input input) {
		// Parse request body
		setupClassLoader();
		Input amf3Input = new org.red5.io.amf3.Input(in);
		while (in.hasRemaining()) {

			final ISharedObjectEvent.Type type = SharedObjectTypeMapping
					.toType(in.get());
			if (type == null) {
				in.skip(in.remaining());
				return;
			}
			String key = null;
			Object value = null;

			//if(log.isDebugEnabled())
			//	log.debug("type: "+SharedObjectTypeMapping.toString(type));

			//SharedObjectEvent event = new SharedObjectEvent(,null,null);
			final int length = in.getInt();
			if (type == ISharedObjectEvent.Type.CLIENT_STATUS) {
				// Status code
				key = input.getString();
				// Status level
				value = input.getString();
			} else if (type == ISharedObjectEvent.Type.CLIENT_UPDATE_DATA) {
				key = null;
				// Map containing new attribute values
				final Map<String, Object> map = new HashMap<String, Object>();
				final int start = in.position();
				while (in.position() - start < length) {
					String tmp = input.getString();
					map.put(tmp, deserializer.deserialize(input, Object.class));
				}
				value = map;
			} else if (type != ISharedObjectEvent.Type.SERVER_SEND_MESSAGE
					&& type != ISharedObjectEvent.Type.CLIENT_SEND_MESSAGE) {
				if (length > 0) {
					key = input.getString();
					if (length > key.length() + 2) {
						// FIXME workaround for player version >= 9.0.115.0
						byte objType = in.get();
						in.position(in.position()-1);
						Input propertyInput;
						if (objType == AMF.TYPE_AMF3_OBJECT && !(input instanceof org.red5.io.amf3.Input)) {
							// The next parameter is encoded using AMF3
							propertyInput = amf3Input;
						} else {
							// The next parameter is encoded using AMF0
							propertyInput = input;
						}
						value = deserializer.deserialize(propertyInput, Object.class);
					}
				}
			} else {
				final int start = in.position();
				// the "send" event seems to encode the handler name
				// as complete AMF string including the string type byte
				key = deserializer.deserialize(input, String.class);

				// read parameters
				final List<Object> list = new LinkedList<Object>();
				while (in.position() - start < length) {
					Object tmp = deserializer.deserialize(input, Object.class);
					list.add(tmp);
				}
				value = list;
			}
			so.addEvent(type, key, value);
		}
	}

	/** {@inheritDoc} */
	public Notify decodeNotify(ByteBuffer in, RTMP rtmp) {
		return decodeNotify(in, null, rtmp);
	}

	/**
	 * Decode notify.
	 * 
	 * @param in the in
	 * @param header the header
	 * @param rtmp the rtmp
	 * 
	 * @return the notify
	 */
	public Notify decodeNotify(ByteBuffer in, Header header, RTMP rtmp) {
		return decodeNotifyOrInvoke(new Notify(), in, header, rtmp);
	}

	/** {@inheritDoc} */
	public Invoke decodeInvoke(ByteBuffer in, RTMP rtmp) {
		return (Invoke) decodeNotifyOrInvoke(new Invoke(), in, null, rtmp);
	}

	/**
	 * Checks if the passed action is a reserved stream method.
	 * 
	 * @param action          Action to check
	 * 
	 * @return                <code>true</code> if passed action is a reserved stream method, <code>false</code> otherwise
	 */
	private boolean isStreamCommand(String action) {
		return (ACTION_CREATE_STREAM.equals(action)
				|| ACTION_DELETE_STREAM.equals(action)
				|| ACTION_PUBLISH.equals(action) || ACTION_PLAY.equals(action)
				|| ACTION_SEEK.equals(action) || ACTION_PAUSE.equals(action)
				|| ACTION_CLOSE_STREAM.equals(action)
				|| ACTION_RECEIVE_VIDEO.equals(action) || ACTION_RECEIVE_AUDIO
				.equals(action));
	}

    /**
     * Decodes notification event.
     * 
     * @param notify             Notify event
     * @param in                 Byte buffer
     * @param header             Header
     * @param rtmp               RTMP protocol state
     * 
     * @return                   Notification event
     */
    protected Notify decodeNotifyOrInvoke(Notify notify, ByteBuffer in, Header header, RTMP rtmp) {
		// TODO: we should use different code depending on server or client mode
		int start = in.position();
		Input input;
		if (rtmp.getEncoding() == Encoding.AMF3)
			input = new org.red5.io.amf3.Input(in);
		else
			input = new org.red5.io.amf.Input(in);

		String action = deserializer.deserialize(input, String.class);

		if (!(notify instanceof Invoke) && rtmp != null
				&& rtmp.getMode() == RTMP.MODE_SERVER && header != null
				&& header.getStreamId() != 0 && !isStreamCommand(action)) {
			// Don't decode "NetStream.send" requests
			in.position(start);
			notify.setData(in.asReadOnlyBuffer());
			return notify;
		}

		if (log.isDebugEnabled()) {
			log.debug("Action " + action);
		}

		if (header == null || header.getStreamId() == 0) {
			int invokeId = deserializer.deserialize(input, Number.class).intValue();
			notify.setInvokeId(invokeId);
		}

		Object[] params = new Object[] {};

		if (in.hasRemaining()) {
			setupClassLoader();
			List<Object> paramList = new ArrayList<Object>();

			final Object obj = deserializer.deserialize(input, Object.class);

			if (obj instanceof Map) {
				// Before the actual parameters we sometimes (connect) get a map
				// of parameters, this is usually null, but if set should be
				// passed to the connection object.
				final Map connParams = (Map) obj;
				notify.setConnectionParams(connParams);
			} else if (obj != null) {
				paramList.add(obj);
			}

			while (in.hasRemaining()) {
				paramList.add(deserializer.deserialize(input, Object.class));
			}
			params = paramList.toArray();
			if (log.isDebugEnabled()) {
				log.debug("Num params: " + paramList.size());
				for (int i = 0; i < params.length; i++) {
					log.debug(" > " + i + ": " + params[i]);
				}
			}
		}

		final int dotIndex = action.lastIndexOf('.');
		String serviceName = (dotIndex == -1) ? null : action.substring(0,
				dotIndex);
		String serviceMethod = (dotIndex == -1) ? action : action.substring(
				dotIndex + 1, action.length());

		if (notify instanceof Invoke) {
			PendingCall call = new PendingCall(serviceName, serviceMethod,
					params);
			((Invoke) notify).setCall(call);
		} else {
			Call call = new Call(serviceName, serviceMethod, params);
			notify.setCall(call);
		}

		return notify;
	}

    /**
     * Decodes ping event.
     * 
     * @param in            Byte buffer
     * 
     * @return              Ping event
     */
	public Ping decodePing(ByteBuffer in) {
		final Ping ping = new Ping();
		ping.setDebug(in.getHexDump());
		ping.setValue1(in.getShort());
		ping.setValue2(in.getInt());
		if (in.hasRemaining()) {
			ping.setValue3(in.getInt());
		}
		if (in.hasRemaining()) {
			ping.setValue4(in.getInt());
		}
		return ping;
	}

	/** {@inheritDoc} */
	public BytesRead decodeBytesRead(ByteBuffer in) {
		return new BytesRead(in.getInt());
	}

	/** {@inheritDoc} */
	public AudioData decodeAudioData(ByteBuffer in) {
		return new AudioData(in.asReadOnlyBuffer());
	}

	/** {@inheritDoc} */
	public VideoData decodeVideoData(ByteBuffer in) {
		return new VideoData(in.asReadOnlyBuffer());
	}

	/**
	 * Decode stream metadata.
	 * 
	 * @param in the in
	 * 
	 * @return the notify
	 */
	public Notify decodeStreamMetadata(ByteBuffer in) {
		return new Notify(in.asReadOnlyBuffer());
	}

    /**
     * Decodes FlexMessage event.
     * 
     * @param in               Byte buffer
     * @param rtmp 		   RTMP protocol state
     * 
     * @return                 FlexMessage event
     */
    public FlexMessage decodeFlexMessage(ByteBuffer in, RTMP rtmp) {
		// TODO: Unknown byte, probably encoding as with Flex SOs?
		in.skip(1);
		Input input = new org.red5.io.amf.Input(in);
		String action = deserializer.deserialize(input, String.class);
		int invokeId = deserializer.deserialize(input, Number.class).intValue();
		FlexMessage msg = new FlexMessage();
		msg.setInvokeId(invokeId);
		Object[] params = new Object[] {};

		if (in.hasRemaining()) {
			setupClassLoader();
			ArrayList<Object> paramList = new ArrayList<Object>();

			final Object obj = deserializer.deserialize(input, Object.class);
			if (obj != null) {
				paramList.add(obj);
			}

			while (in.hasRemaining()) {
				// Check for AMF3 encoding of parameters
				byte tmp = in.get();
				in.position(in.position()-1);
				if (tmp == AMF.TYPE_AMF3_OBJECT) {
					// The next parameter is encoded using AMF3
					input = new org.red5.io.amf3.Input(in);
				} else {
					// The next parameter is encoded using AMF0
					input = new org.red5.io.amf.Input(in);
				}
				paramList.add(deserializer.deserialize(input, Object.class));
			}
			params = paramList.toArray();
			if (log.isDebugEnabled()) {
				log.debug("Num params: " + paramList.size());
				for (int i = 0; i < params.length; i++) {
					log.debug(" > " + i + ": " + params[i]);
				}
			}
		}

		final int dotIndex = action.lastIndexOf('.');
		String serviceName = (dotIndex == -1) ? null : action.substring(0,
				dotIndex);
		String serviceMethod = (dotIndex == -1) ? action : action.substring(
				dotIndex + 1, action.length());

		PendingCall call = new PendingCall(serviceName, serviceMethod, params);
		msg.setCall(call);
		return msg;
	}

	/**
	 * Decode flex stream send.
	 * 
	 * @param in the in
	 * 
	 * @return the flex stream send
	 */
	public FlexStreamSend decodeFlexStreamSend(ByteBuffer in) {
		return new FlexStreamSend(in.asReadOnlyBuffer());
	}

}
