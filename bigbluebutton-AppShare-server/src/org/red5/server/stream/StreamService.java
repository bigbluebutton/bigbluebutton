package org.red5.server.stream;

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

import java.io.IOException;
import java.util.Set;

import org.red5.server.BaseConnection;
import org.red5.server.api.IBasicScope;
import org.red5.server.api.IConnection;
import org.red5.server.api.IContext;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.ScopeUtils;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IClientBroadcastStream;
import org.red5.server.api.stream.IClientStream;
import org.red5.server.api.stream.IPlaylistSubscriberStream;
import org.red5.server.api.stream.ISingleItemSubscriberStream;
import org.red5.server.api.stream.IStreamCapableConnection;
import org.red5.server.api.stream.IStreamPlaybackSecurity;
import org.red5.server.api.stream.IStreamPublishSecurity;
import org.red5.server.api.stream.IStreamSecurityService;
import org.red5.server.api.stream.IStreamService;
import org.red5.server.api.stream.ISubscriberStream;
import org.red5.server.api.stream.OperationNotSupportedException;
import org.red5.server.api.stream.support.SimplePlayItem;
import org.red5.server.net.rtmp.BaseRTMPHandler;
import org.red5.server.net.rtmp.Channel;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.status.Status;
import org.red5.server.net.rtmp.status.StatusCodes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Stream service.
 */
public class StreamService implements IStreamService {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(StreamService.class);

	/** {@inheritDoc} */
    public void closeStream() {
		IConnection conn = Red5.getConnectionLocal();
		if (!(conn instanceof IStreamCapableConnection)) {
			return;
		}
		IClientStream stream = ((IStreamCapableConnection) conn)
				.getStreamById(getCurrentStreamId());
		if (stream != null) {
			if (stream instanceof IClientBroadcastStream) {
				IClientBroadcastStream bs = (IClientBroadcastStream) stream;
				IBroadcastScope bsScope = getBroadcastScope(conn.getScope(), bs
						.getPublishedName());
				if (bsScope != null && conn instanceof BaseConnection) {
					((BaseConnection) conn).unregisterBasicScope(bsScope);
				}
			}
			stream.close();
		}
		((IStreamCapableConnection) conn)
				.deleteStreamById(getCurrentStreamId());
	}

	/** {@inheritDoc} */
    public int createStream() {
		IConnection conn = Red5.getConnectionLocal();
		if (!(conn instanceof IStreamCapableConnection)) {
			return -1;
		}
		return ((IStreamCapableConnection) conn).reserveStreamId();
	}

	/** {@inheritDoc} */
    public void deleteStream(int streamId) {
		IConnection conn = Red5.getConnectionLocal();
		if (!(conn instanceof IStreamCapableConnection)) {
			return;
		}
		IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
		deleteStream(streamConn, streamId);
	}

	/** {@inheritDoc} */
    public void deleteStream(IStreamCapableConnection conn, int streamId) {
		IClientStream stream = conn.getStreamById(streamId);
		if (stream != null) {
			if (stream instanceof IClientBroadcastStream) {
				IClientBroadcastStream bs = (IClientBroadcastStream) stream;
				IBroadcastScope bsScope = getBroadcastScope(conn.getScope(), bs
						.getPublishedName());
				if (bsScope != null && conn instanceof BaseConnection) {
					((BaseConnection) conn).unregisterBasicScope(bsScope);
				}
			}
			stream.close();
		}
		conn.unreserveStreamId(streamId);
	}
    
	/** {@inheritDoc} */
    public void releaseStream(String streamName) {
    	// XXX: what to do here?
    }

	/** {@inheritDoc} */
    public void pause(boolean pausePlayback, int position) {
		pause(Boolean.valueOf(pausePlayback), position);
	}

    /**
     * Pause at given position. Required as "pausePlayback" can be "null" if no flag is passed by the
     * client
     * 
     * @param pausePlayback         Pause playback or not
     * @param position              Pause position
     */
    public void pause(Boolean pausePlayback, int position) {
		IConnection conn = Red5.getConnectionLocal();
		if (!(conn instanceof IStreamCapableConnection)) {
			return;
		}
		IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
		int streamId = getCurrentStreamId();
		IClientStream stream = streamConn.getStreamById(streamId);
		if (stream == null || !(stream instanceof ISubscriberStream)) {
			return;
		}
		ISubscriberStream subscriberStream = (ISubscriberStream) stream;
		// pausePlayback can be "null" if "pause" is called without any parameters from flash
		if (pausePlayback == null) {
			pausePlayback = !subscriberStream.isPaused();
		}
		if (pausePlayback) {
			subscriberStream.pause(position);
		} else {
			subscriberStream.resume(position);
		}
	}

    /**
     * {@inheritDoc}
     */
    public void play(String name, int start, int length, Object flushPlaylist) {
		if (flushPlaylist instanceof Boolean) {
			play(name, start, length, ((Boolean) flushPlaylist).booleanValue());
		} else {
			play(name, start, length);
		}
	}

	/** {@inheritDoc} */
    public void play(String name, int start, int length, boolean flushPlaylist) {
		IConnection conn = Red5.getConnectionLocal();
		if (!(conn instanceof IStreamCapableConnection)) {
			return;
		}
		IScope scope = conn.getScope();
		IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
		int streamId = getCurrentStreamId();
		if (name == null || "".equals(name)) {
			sendNSFailed((RTMPConnection) streamConn, "The stream name may not be empty.", name, streamId);
			return;
		}
		IStreamSecurityService security = (IStreamSecurityService) ScopeUtils.getScopeService(scope, IStreamSecurityService.class);
		if (security != null) {
			Set<IStreamPlaybackSecurity> handlers = security.getStreamPlaybackSecurity();
			for (IStreamPlaybackSecurity handler: handlers) {
				if (!handler.isPlaybackAllowed(scope, name, start, length, flushPlaylist)) {
					sendNSFailed((RTMPConnection) streamConn, "You are not allowed to play the stream.", name, streamId);
					return;
				}
			}
		}
		
		IClientStream stream = streamConn.getStreamById(streamId);
		boolean created = false;
		if (stream == null) {
			stream = streamConn.newPlaylistSubscriberStream(streamId);
			stream.start();
			created = true;
		}
		if (!(stream instanceof ISubscriberStream)) {
			return;
		}
		ISubscriberStream subscriberStream = (ISubscriberStream) stream;
		SimplePlayItem item = new SimplePlayItem();
		item.setName(name);
		item.setStart(start);
		item.setLength(length);
		if (subscriberStream instanceof IPlaylistSubscriberStream) {
			IPlaylistSubscriberStream playlistStream = (IPlaylistSubscriberStream) subscriberStream;
			if (flushPlaylist) {
				playlistStream.removeAllItems();
			}
			playlistStream.addItem(item);
		} else if (subscriberStream instanceof ISingleItemSubscriberStream) {
			ISingleItemSubscriberStream singleStream = (ISingleItemSubscriberStream) subscriberStream;
			singleStream.setPlayItem(item);
		} else {
			// not supported by this stream service
			return;
		}
		try {
			subscriberStream.play();
		} catch (IOException err) {
			if (created) {
				stream.close();
				streamConn.deleteStreamById(streamId);
			}
			sendNSFailed((RTMPConnection) streamConn, err.getMessage(), name, streamId);
		}
	}

	/** {@inheritDoc} */
    public void play(String name, int start, int length) {
		play(name, start, length, true);
	}

	/** {@inheritDoc} */
    public void play(String name, int start) {
		play(name, start, -1000, true);
	}

	/** {@inheritDoc} */
    public void play(String name) {
		play(name, -2000, -1000, true);
	}

	/** {@inheritDoc} */
    public void play(Boolean dontStop) {
		if (!dontStop) {
			IConnection conn = Red5.getConnectionLocal();
			if (!(conn instanceof IStreamCapableConnection)) {
				return;
			}
			IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
			int streamId = getCurrentStreamId();
			IClientStream stream = streamConn.getStreamById(streamId);
			if (stream != null) {
				stream.stop();
			}
		}
	}

	/** {@inheritDoc} */
    public void publish(Boolean dontStop) {
		if (!dontStop) {
			IConnection conn = Red5.getConnectionLocal();
			if (!(conn instanceof IStreamCapableConnection)) {
				return;
			}
			IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
			int streamId = getCurrentStreamId();
			IClientStream stream = streamConn.getStreamById(streamId);
			if (!(stream instanceof IBroadcastStream)) {
				return;
			}
			IBroadcastStream bs = (IBroadcastStream) stream;
			if (bs.getPublishedName() == null) {
				return;
			}
			IBroadcastScope bsScope = getBroadcastScope(conn.getScope(), bs
					.getPublishedName());
			if (bsScope != null) {
				bsScope.unsubscribe(bs.getProvider());
				if (conn instanceof BaseConnection) {
					((BaseConnection) conn).unregisterBasicScope(bsScope);
				}
			}
			bs.close();
			streamConn.deleteStreamById(streamId);
		}
	}

	/** {@inheritDoc} */
    public void publish(String name, String mode) {
		IConnection conn = Red5.getConnectionLocal();
		if (!(conn instanceof IStreamCapableConnection)) {
			return;
		}
		
		IScope scope = conn.getScope();
		IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
		int streamId = getCurrentStreamId();
		if (name == null || "".equals(name)) {
			sendNSFailed((RTMPConnection) streamConn, "The stream name may not be empty.", name, streamId);
			return;
		}

		IStreamSecurityService security = (IStreamSecurityService) ScopeUtils.getScopeService(scope, IStreamSecurityService.class);
		if (security != null) {
			Set<IStreamPublishSecurity> handlers = security.getStreamPublishSecurity();
			for (IStreamPublishSecurity handler: handlers) {
				if (!handler.isPublishAllowed(scope, name, mode)) {
					sendNSFailed((RTMPConnection) streamConn, "You are not allowed to publish the stream.", name, streamId);
					return;
				}
			}
		}
		
		IBroadcastScope bsScope = getBroadcastScope(scope, name);
		if (bsScope != null && !bsScope.getProviders().isEmpty()) {
			// Another stream with that name is already published.
			Status badName = new Status(StatusCodes.NS_PUBLISH_BADNAME);
			badName.setClientid(streamId);
			badName.setDetails(name);
			badName.setLevel("error");

			// FIXME: there should be a direct way to send the status
			Channel channel = ((RTMPConnection) streamConn).getChannel((byte) (4 + ((streamId-1) * 5)));
			channel.sendStatus(badName);
			return;
		}

		IClientStream stream = streamConn.getStreamById(streamId);
		if (stream != null && !(stream instanceof IClientBroadcastStream)) {
			return;
		}
		boolean created = false;
		if (stream == null) {
			stream = streamConn.newBroadcastStream(streamId);
			created = true;
		}

		IClientBroadcastStream bs = (IClientBroadcastStream) stream;
		try {
			bs.setPublishedName(name);
			IContext context = conn.getScope().getContext();
			IProviderService providerService = (IProviderService) context
					.getBean(IProviderService.BEAN_NAME);
			// TODO handle registration failure
			if (providerService.registerBroadcastStream(conn.getScope(),
					name, bs)) {
				bsScope = getBroadcastScope(conn.getScope(), name);
				bsScope.setAttribute(IBroadcastScope.STREAM_ATTRIBUTE, bs);
				if (conn instanceof BaseConnection) {
					((BaseConnection) conn).registerBasicScope(bsScope);
				}
			}
			if (IClientStream.MODE_RECORD.equals(mode)) {
				bs.start();
				bs.saveAs(name, false);
			} else if (IClientStream.MODE_APPEND.equals(mode)) {
				bs.start();
				bs.saveAs(name, true);
			} else if (IClientStream.MODE_LIVE.equals(mode)) {
				bs.start();
			}
			bs.startPublishing();
		} catch (IOException e) {
			Status accessDenied = new Status(StatusCodes.NS_RECORD_NOACCESS);
			accessDenied.setClientid(streamId);
			accessDenied.setDesciption("The file could not be created/written to.");
			accessDenied.setDetails(name);
			accessDenied.setLevel("error");

			// FIXME: there should be a direct way to send the status
			Channel channel = ((RTMPConnection) streamConn).getChannel((byte) (4 + ((streamId-1) * 5)));
			channel.sendStatus(accessDenied);
			bs.close();
			if (created)
				streamConn.deleteStreamById(streamId);
			return;
		} catch (Exception e) {
			logger.warn("publish caught Exception");
		}
	}

	/** {@inheritDoc} */
    public void publish(String name) {
		publish(name, IClientStream.MODE_LIVE);
	}

	/** {@inheritDoc} */
    public void seek(int position) {
		IConnection conn = Red5.getConnectionLocal();
		if (!(conn instanceof IStreamCapableConnection)) {
			return;
		}
		IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
		int streamId = getCurrentStreamId();
		IClientStream stream = streamConn.getStreamById(streamId);
		if (stream == null || !(stream instanceof ISubscriberStream)) {
			return;
		}
		ISubscriberStream subscriberStream = (ISubscriberStream) stream;
		try {
			subscriberStream.seek(position);
		} catch (OperationNotSupportedException err) {
			Status seekFailed = new Status(StatusCodes.NS_SEEK_FAILED);
			seekFailed.setClientid(streamId);
			seekFailed.setDesciption("The stream doesn't support seeking.");
			seekFailed.setLevel("error");

			// FIXME: there should be a direct way to send the status
			Channel channel = ((RTMPConnection) streamConn).getChannel((byte) (4 + ((streamId-1) * 5)));
			channel.sendStatus(seekFailed);
		}
	}

	/** {@inheritDoc} */
    public void receiveVideo(boolean receive) {
		IConnection conn = Red5.getConnectionLocal();
		if (!(conn instanceof IStreamCapableConnection)) {
			return;
		}
		IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
		int streamId = getCurrentStreamId();
		IClientStream stream = streamConn.getStreamById(streamId);
		if (stream == null || !(stream instanceof ISubscriberStream)) {
			return;
		}
		ISubscriberStream subscriberStream = (ISubscriberStream) stream;
		subscriberStream.receiveVideo(receive);
	}

	/** {@inheritDoc} */
    public void receiveAudio(boolean receive) {
		IConnection conn = Red5.getConnectionLocal();
		if (!(conn instanceof IStreamCapableConnection)) {
			return;
		}
		IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
		int streamId = getCurrentStreamId();
		IClientStream stream = streamConn.getStreamById(streamId);
		if (stream == null || !(stream instanceof ISubscriberStream)) {
			return;
		}
		ISubscriberStream subscriberStream = (ISubscriberStream) stream;
		subscriberStream.receiveAudio(receive);
	}

	/**
	 * Getter for current stream id.
	 * 
	 * @return  Current stream id
	 */
    private int getCurrentStreamId() {
		// TODO: this must come from the current connection!
		return BaseRTMPHandler.getStreamId();
	}

    /**
     * Return broadcast scope object for given scope and child scope name.
     * 
     * @param scope          Scope object
     * @param name           Child scope name
     * 
     * @return               Broadcast scope
     */
    public IBroadcastScope getBroadcastScope(IScope scope, String name) {
		IBasicScope basicScope = scope.getBasicScope(IBroadcastScope.TYPE,
				name);
		if (!(basicScope instanceof IBroadcastScope)) {
			return null;
		} else {
			return (IBroadcastScope) basicScope;
		}
	}
    
    /**
     * Send a <code>NetStream.Failed</code> message to the client.
     * 
     * @param conn the conn
     * @param description the description
     * @param name the name
     * @param streamId the stream id
     */
    private void sendNSFailed(RTMPConnection conn, String description, String name, int streamId) {
		Status failed = new Status(StatusCodes.NS_FAILED);
		failed.setClientid(streamId);
		failed.setDesciption(description);
		failed.setDetails(name);
		failed.setLevel("error");

		// FIXME: there should be a direct way to send the status
		Channel channel = conn.getChannel((byte) (4 + ((streamId-1) * 5)));
		channel.sendStatus(failed);
    }
    
}
