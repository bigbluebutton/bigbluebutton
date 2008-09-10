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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.apache.mina.common.ByteBuffer;
import org.red5.io.amf.Output;
import org.red5.io.object.Serializer;
import org.red5.server.api.IBandwidthConfigure;
import org.red5.server.api.IContext;
import org.red5.server.api.IScope;
import org.red5.server.api.scheduling.IScheduledJob;
import org.red5.server.api.scheduling.ISchedulingService;
import org.red5.server.api.statistics.IPlaylistSubscriberStreamStatistics;
import org.red5.server.api.stream.IClientBroadcastStream;
import org.red5.server.api.stream.IPlayItem;
import org.red5.server.api.stream.IPlaylistController;
import org.red5.server.api.stream.IPlaylistSubscriberStream;
import org.red5.server.api.stream.IStreamAwareScopeHandler;
import org.red5.server.api.stream.IVideoStreamCodec;
import org.red5.server.api.stream.OperationNotSupportedException;
import org.red5.server.messaging.AbstractMessage;
import org.red5.server.messaging.IFilter;
import org.red5.server.messaging.IMessage;
import org.red5.server.messaging.IMessageComponent;
import org.red5.server.messaging.IMessageInput;
import org.red5.server.messaging.IMessageOutput;
import org.red5.server.messaging.IPassive;
import org.red5.server.messaging.IPipe;
import org.red5.server.messaging.IPipeConnectionListener;
import org.red5.server.messaging.IProvider;
import org.red5.server.messaging.IPushableConsumer;
import org.red5.server.messaging.OOBControlMessage;
import org.red5.server.messaging.PipeConnectionEvent;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.event.Notify;
import org.red5.server.net.rtmp.event.Ping;
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.net.rtmp.event.VideoData.FrameType;
import org.red5.server.net.rtmp.message.Header;
import org.red5.server.net.rtmp.status.Status;
import org.red5.server.net.rtmp.status.StatusCodes;
import org.red5.server.stream.ITokenBucket.ITokenBucketCallback;
import org.red5.server.stream.message.RTMPMessage;
import org.red5.server.stream.message.ResetMessage;
import org.red5.server.stream.message.StatusMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Stream of playlist subsciber.
 */
public class PlaylistSubscriberStream extends AbstractClientStream implements
		IPlaylistSubscriberStream, IPlaylistSubscriberStreamStatistics {

    /** The Constant log. */
    private static final Logger log = LoggerFactory.getLogger(PlaylistSubscriberStream.class);

    /**
     * Possible states enumeration.
     */
    private enum State {
		
		/** The UNINIT. */
		UNINIT, 
 /** The STOPPED. */
 STOPPED, 
 /** The PLAYING. */
 PLAYING, 
 /** The PAUSED. */
 PAUSED, 
 /** The CLOSED. */
 CLOSED
	}

    /** Playlist controller. */
	private IPlaylistController controller;
    
    /** Default playlist controller. */
	private IPlaylistController defaultController;
    
    /** Playlist items. */
	private final List<IPlayItem> items;
    
    /** Current item index. */
	private int currentItemIndex;
    
    /** Plays items back. */
	private PlayEngine engine;
    
    /** Service that controls bandwidth. */
	private IBWControlService bwController;
	
	/** Operating context for bandwidth controller. */
	private IBWControlContext bwContext;
    
    /** Rewind mode state. */
	private boolean isRewind;
    
    /** Random mode state. */
	private boolean isRandom;
    
    /** Repeat mode state. */
	private boolean isRepeat;
    
    /** Recieve video?. */
	private boolean receiveVideo = true;
    
    /** Recieve audio?. */
	private boolean receiveAudio = true;
	
	/** Executor that will be used to schedule stream playback to keep the client buffer filled. */
	private static ScheduledThreadPoolExecutor executor;
	
	/** Interval in ms to check for buffer underruns in VOD streams. */
	private int bufferCheckInterval = 0;
	
	/** Number of pending messages at which a <code>NetStream.Play.InsufficientBW</code> message is generated for VOD streams. */
	private int underrunTrigger = 10;

	/** Timestamp this stream was created. */
	private long creationTime;
	
	/** Number of bytes sent. */
	private long bytesSent = 0;
	
	/**
	 * Constructs a new PlaylistSubscriberStream.
	 */
    public PlaylistSubscriberStream() {
		defaultController = new SimplePlaylistController();
		items = new ArrayList<IPlayItem>();
		engine = new PlayEngine();
		currentItemIndex = 0;
		creationTime = System.currentTimeMillis();
	}

    /**
     * Set the executor to use.
     * 
     * @param executor the executor
     */
    public void setExecutor(ScheduledThreadPoolExecutor executor) {
    	PlaylistSubscriberStream.executor = executor;
    }

    /**
     * Return the executor to use.
     * 
     * @return the executor
     */
    public ScheduledThreadPoolExecutor getExecutor() {
		if (executor == null) {
			synchronized (PlaylistSubscriberStream.this) {
				if (executor == null) {
					// Default executor
					executor = new ScheduledThreadPoolExecutor(16);
				}
			}
		}
		return executor;
    }
    
    /**
     * Set interval to check for buffer underruns. Set to <code>0</code> to
     * disable.
     * 
     * @param bufferCheckInterval interval in ms
     */
    public void setBufferCheckInterval(int bufferCheckInterval) {
    	this.bufferCheckInterval = bufferCheckInterval;
    }
    
    /**
     * Set maximum number of pending messages at which a
     * <code>NetStream.Play.InsufficientBW</code> message will be
     * generated for VOD streams
     * 
     * @param underrunTrigger the maximum number of pending messages
     */
    public void setUnderrunTrigger(int underrunTrigger) {
    	this.underrunTrigger = underrunTrigger;
    }
    
	/** {@inheritDoc} */
    public void start() {
        // Create bw control service from Spring bean factory
    	// and register myself
    	// XXX Bandwidth control service should not be bound to
    	// a specific scope because it's designed to control
    	// the bandwidth system-wide.
        bwController = (IBWControlService) getScope().getContext()
				.getBean(IBWControlService.KEY);
        bwContext = bwController.registerBWControllable(this);
        
        // Start playback engine
        engine.start();
        // Notify subscribers on start
        notifySubscriberStart();
	}

	/** {@inheritDoc} */
    public void play() throws IOException {
		synchronized (items) {
            // Return if playlist is empty
            if (items.size() == 0) {
				return;
			}
            // Move to next if current item is set to -1
            if (currentItemIndex == -1) {
				moveToNext();
			}
            // Get playlist item
            IPlayItem item = items.get(currentItemIndex);
            // Check how many is yet to play...
            int count = items.size();
            // If there's some more items on list then play current item
            while (count-- > 0) {
				try {
					engine.play(item);
					break;
				} catch (StreamNotFoundException e) {
					// go for next item
					moveToNext();
					if (currentItemIndex == -1) {
						// we reaches the end.
						break;
					}
					item = items.get(currentItemIndex);
				} catch (IllegalStateException e) {
					// an stream is already playing
					break;
				}
			}
		}
	}

	/** {@inheritDoc} */
    public void pause(int position) {
		try {
			engine.pause(position);
		} catch (IllegalStateException e) {
			log.debug("pause caught an IllegalStateException");
		}
	}

	/** {@inheritDoc} */
    public void resume(int position) {
		try {
			engine.resume(position);
		} catch (IllegalStateException e) {
			log.debug("resume caught an IllegalStateException");
		}
	}

	/** {@inheritDoc} */
    public void stop() {
		try {
			engine.stop();
		} catch (IllegalStateException e) {
			log.debug("stop caught an IllegalStateException");
		}
	}

	/** {@inheritDoc} */
    public void seek(int position) throws OperationNotSupportedException {
		try {
			engine.seek(position);
		} catch (IllegalStateException e) {
			log.debug("seek caught an IllegalStateException");
		}
	}

	/** {@inheritDoc} */
    public void close() {
		engine.close();
		// unregister myself from bandwidth controller
		bwController.unregisterBWControllable(bwContext);
		notifySubscriberClose();
	}

	/** {@inheritDoc} */
    public boolean isPaused() {
		return (engine.state == State.PAUSED);
	}

	/** {@inheritDoc} */
    public void addItem(IPlayItem item) {
		synchronized (items) {
			items.add(item);
		}
	}

	/** {@inheritDoc} */
    public void addItem(IPlayItem item, int index) {
		synchronized (items) {
			items.add(index, item);
		}
	}

	/** {@inheritDoc} */
    public void removeItem(int index) {
		synchronized (items) {
			if (index < 0 || index >= items.size()) {
				return;
			}
			int originSize = items.size();
			items.remove(index);
			if (currentItemIndex == index) {
				// set the next item.
				if (index == originSize - 1) {
					currentItemIndex = index - 1;
				}
			}
		}
	}

	/** {@inheritDoc} */
    public void removeAllItems() {
		synchronized (items) {
			// we try to stop the engine first
			stop();
			items.clear();
		}
	}

	/** {@inheritDoc} */
    public void previousItem() {
		synchronized (items) {
			stop();
			moveToPrevious();
			if (currentItemIndex == -1) {
				return;
			}
			IPlayItem item = items.get(currentItemIndex);
			int count = items.size();
			while (count-- > 0) {
				try {
					engine.play(item);
					break;
				} catch (IOException err) {
					log.error("Error while starting to play item, moving to next.", err);
					// go for next item
					moveToPrevious();
					if (currentItemIndex == -1) {
						// we reaches the end.
						break;
					}
					item = items.get(currentItemIndex);
				} catch (StreamNotFoundException e) {
					// go for next item
					moveToPrevious();
					if (currentItemIndex == -1) {
						// we reaches the end.
						break;
					}
					item = items.get(currentItemIndex);
				} catch (IllegalStateException e) {
					// an stream is already playing
					break;
				}
			}
		}
	}

	/** {@inheritDoc} */
    public boolean hasMoreItems() {
    	synchronized (items) {
    		int nextItem = currentItemIndex + 1;
    		if (nextItem >= items.size() && !isRepeat) {
    			return false;
    		} else {
    			return true;
    		}
    	}
    }
    
	/** {@inheritDoc} */
    public void nextItem() {
		synchronized (items) {
			moveToNext();
			if (currentItemIndex == -1) {
				return;
			}
			IPlayItem item = items.get(currentItemIndex);
			int count = items.size();
			while (count-- > 0) {
				try {
					engine.play(item, false);
					break;
				} catch (IOException err) {
					log.error("Error while starting to play item, moving to next.", err);
					// go for next item
					moveToNext();
					if (currentItemIndex == -1) {
						// we reaches the end.
						break;
					}
					item = items.get(currentItemIndex);
				} catch (StreamNotFoundException e) {
					// go for next item
					moveToNext();
					if (currentItemIndex == -1) {
						// we reaches the end.
						break;
					}
					item = items.get(currentItemIndex);
				} catch (IllegalStateException e) {
					// an stream is already playing
					break;
				}
			}
		}
	}

	/** {@inheritDoc} */
    public void setItem(int index) {
		synchronized (items) {
			if (index < 0 || index >= items.size()) {
				return;
			}
			stop();
			currentItemIndex = index;
			IPlayItem item = items.get(currentItemIndex);
			try {
				engine.play(item);
			} catch (IOException e) {
				log.error("setItem caught a IOException", e);
			} catch (StreamNotFoundException e) {
				// let the engine retain the STOPPED state
				// and wait for control from outside
				log.debug("setItem caught a StreamNotFoundException");
			} catch (IllegalStateException e) {
               log.error( "Illegal state exception on playlist item setup", e );
			}
		}
	}

	/** {@inheritDoc} */
    public boolean isRandom() {
		return isRandom;
	}

	/** {@inheritDoc} */
    public void setRandom(boolean random) {
		isRandom = random;
	}

	/** {@inheritDoc} */
    public boolean isRewind() {
		return isRewind;
	}

	/** {@inheritDoc} */
    public void setRewind(boolean rewind) {
		isRewind = rewind;
	}

	/** {@inheritDoc} */
    public boolean isRepeat() {
		return isRepeat;
	}

	/** {@inheritDoc} */
    public void setRepeat(boolean repeat) {
		isRepeat = repeat;
	}

    /**
     * Seek to current position to restart playback with audio and/or video.
     */
    private void seekToCurrentPlayback() {
    	if (engine.isPullMode) {
			try {
				// TODO: figure out if this is the correct position to seek to
				final long delta = System.currentTimeMillis() - engine.playbackStart;
				engine.seek((int) delta);
			} catch (OperationNotSupportedException err) {
				// Ignore error, should not happen for pullMode engines
			}
		}
    }
    
	/** {@inheritDoc} */
    public void receiveVideo(boolean receive) {
    	final boolean seek = (!receiveVideo && receive);
		receiveVideo = receive;
		if (seek) {
			// Video has just been re-enabled
			seekToCurrentPlayback();
		}
	}

	/** {@inheritDoc} */
    public void receiveAudio(boolean receive) {
    	if (receiveAudio && !receive) {
    		// We need to send a black audio packet to reset the player
    		engine.sendBlankAudio = true;
    	}
    	final boolean seek = (!receiveAudio && receive);
		receiveAudio = receive;
		if (seek) {
			// Audio has just been re-enabled
			seekToCurrentPlayback();
		}
	}

	/** {@inheritDoc} */
    public void setPlaylistController(IPlaylistController controller) {
		this.controller = controller;
	}

	/** {@inheritDoc} */
    public int getItemSize() {
		return items.size();
	}

	/** {@inheritDoc} */
    public int getCurrentItemIndex() {
		return currentItemIndex;
	}

    /**
     * {@inheritDoc}
     */
    public IPlayItem getCurrentItem() {
        return getItem( getCurrentItemIndex() );
    }


    /** {@inheritDoc} */
    public IPlayItem getItem(int index) {
		try {
			return items.get(index);
		} catch (IndexOutOfBoundsException e) {
			return null;
		}
	}

	/** {@inheritDoc} */
    @Override
	public void setBandwidthConfigure(IBandwidthConfigure config) {
		super.setBandwidthConfigure(config);
		engine.updateBandwithConfigure();
	}

	/**
	 * Notified by RTMPHandler when a message has been sent.
	 * Glue for old code base.
	 * 
	 * @param message          Message that has been written
	 */
	public void written(Object message) {
		if (!engine.isPullMode) {
			// Not needed for live streams
			return;
		}
		
		try {
			engine.pullAndPush();
		} catch (Throwable err) {
			log.error("Error while pulling message.", err);
		}
	}

	/**
	 * Move the current item to the next in list.
	 */
	private void moveToNext() {
		if (controller != null) {
			currentItemIndex = controller.nextItem(this, currentItemIndex);
		} else {
			currentItemIndex = defaultController.nextItem(this,
					currentItemIndex);
		}
	}

	/**
	 * Move the current item to the previous in list.
	 */
	private void moveToPrevious() {
		if (controller != null) {
			currentItemIndex = controller.previousItem(this, currentItemIndex);
		} else {
			currentItemIndex = defaultController.previousItem(this,
					currentItemIndex);
		}
	}

	/**
	 * Notified by the play engine when the current item reaches the end.
	 */
	private void onItemEnd() {
		nextItem();
	}

    /**
     * Notifies subscribers on start.
     */
    private void notifySubscriberStart() {
		IStreamAwareScopeHandler handler = getStreamAwareHandler();
		if (handler != null) {
			try {
				handler.streamSubscriberStart(this);
			} catch (Throwable t) {
				log.error("error notify streamSubscriberStart", t);
			}
		}
	}

    /**
     * Notifies subscribers on stop.
     */
	private void notifySubscriberClose() {
		IStreamAwareScopeHandler handler = getStreamAwareHandler();
		if (handler != null) {
			try {
				handler.streamSubscriberClose(this);
			} catch (Throwable t) {
				log.error("error notify streamSubscriberClose", t);
			}
		}
	}

    /**
     * Notifies subscribers on item playback.
     * 
     * @param item               Item being played
     * @param isLive             Is it a live broadcasting?
     */
    private void notifyItemPlay(IPlayItem item, boolean isLive) {
		IStreamAwareScopeHandler handler = getStreamAwareHandler();
		if (handler != null) {
			try {
				handler.streamPlaylistItemPlay(this, item, isLive);
			} catch (Throwable t) {
				log.error("error notify streamPlaylistItemPlay", t);
			}
		}
	}

    /**
     * Notifies subscribers on item stop.
     * 
     * @param item               Item that just has been stopped
     */
    private void notifyItemStop(IPlayItem item) {
		IStreamAwareScopeHandler handler = getStreamAwareHandler();
		if (handler != null) {
			try {
				handler.streamPlaylistItemStop(this, item);
			} catch (Throwable t) {
				log.error("error notify streamPlaylistItemStop", t);
			}
		}
	}

    /**
     * Notifies subscribers on pause.
     * 
     * @param item                Item that just has been paused
     * @param position            Playback head position
     */
    private void notifyItemPause(IPlayItem item, int position) {
		IStreamAwareScopeHandler handler = getStreamAwareHandler();
		if (handler != null) {
			try {
				handler.streamPlaylistVODItemPause(this, item, position);
			} catch (Throwable t) {
				log.error("error notify streamPlaylistVODItemPause", t);
			}
		}
	}

    /**
     * Notifies subscribers on resume.
     * 
     * @param item                Item that just has been resumed
     * @param position            Playback head position
     */
    private void notifyItemResume(IPlayItem item, int position) {
		IStreamAwareScopeHandler handler = getStreamAwareHandler();
		if (handler != null) {
			try {
				handler.streamPlaylistVODItemResume(this, item, position);
			} catch (Throwable t) {
				log.error("error notify streamPlaylistVODItemResume", t);
			}
		}
	}

    /**
     * Notify on item seek.
     * 
     * @param item            Playlist item
     * @param position        Seek position
     */
    private void notifyItemSeek(IPlayItem item, int position) {
		IStreamAwareScopeHandler handler = getStreamAwareHandler();
		if (handler != null) {
			try {
				handler.streamPlaylistVODItemSeek(this, item, position);
			} catch (Throwable t) {
				log.error("error notify streamPlaylistVODItemSeek", t);
			}
		}
	}

    /** {@inheritDoc} */
    public IPlaylistSubscriberStreamStatistics getStatistics() {
    	return this;
    }
    
    /** {@inheritDoc} */
    public long getCreationTime() {
    	return creationTime;
    }
    
    /** {@inheritDoc} */
    public int getCurrentTimestamp() {
    	final IRTMPEvent msg = engine.lastMessage;
    	if (msg == null) {
    		return 0;
    	}
    	
    	return msg.getTimestamp();
    }
    
    /** {@inheritDoc} */
    public long getBytesSent() {
    	return bytesSent;
    }
    
    /** {@inheritDoc} */
    public double getEstimatedBufferFill() {
    	final IRTMPEvent msg = engine.lastMessage;
    	if (msg == null) {
    		// Nothing has been sent yet
    		return 0.0;
    	}
    	
		// Buffer size as requested by the client
		final long buffer = getClientBufferDuration();
		if (buffer == 0) {
			return 100.0;
		}
		
		// Duration the stream is playing
		final long delta = System.currentTimeMillis() - engine.playbackStart;
		// Expected amount of data present in client buffer
		final long buffered = msg.getTimestamp() - delta;
    	return (buffered * 100.0) / buffer;
    }
    
	/**
	 * A play engine for playing an IPlayItem.
	 */
	private class PlayEngine implements IFilter, IPushableConsumer,
			IPipeConnectionListener, ITokenBucketCallback {
        
        /** The state. */
		private State state;
        
        /** The msg in. */
		private IMessageInput msgIn;
        
        /** The msg out. */
		private IMessageOutput msgOut;
        
        /** The is pull mode. */
		private boolean isPullMode;
        
        /** The scheduling service. */
		private ISchedulingService schedulingService;
        
        /** The wait live job. */
		private String waitLiveJob;
        
        /** The is waiting. */
		private boolean isWaiting;
        
        /** The vod start ts. */
		private int vodStartTS;
        
        /** The current item. */
		private IPlayItem currentItem;
        
        /** The audio bucket. */
		private ITokenBucket audioBucket;
        
        /** The video bucket. */
		private ITokenBucket videoBucket;
        
        /** The pending message. */
		private RTMPMessage pendingMessage;
        
        /** The is waiting for token. */
		private boolean isWaitingForToken = false;
		
		/** The need check bandwidth. */
		private boolean needCheckBandwidth = true;

        /** State machine for video frame dropping in live streams. */
        private IFrameDropper videoFrameDropper = new VideoFrameDropper();
        
        /** The timestamp offset. */
        private int timestampOffset = 0;
        
        /** Last message sent to the client. */
        private IRTMPEvent lastMessage;
        
        /** Number of bytes sent. */
        private long bytesSent = 0;
        
        /** Start time of stream playback. It's not a time when the stream is being played but the time when the stream should be played if it's played from the very beginning. Eg. A stream is played at timestamp 5s on 1:00:05. The playbackStart is 1:00:00. */
        private long playbackStart;
        
        /** Scheduled future job that makes sure messages are sent to the client. */
        private volatile ScheduledFuture<?> pullAndPushFuture = null;
        
        /** Offset in ms the stream started. */
        private int streamOffset;
        
        /** Timestamp when buffer should be checked for underruns next. */
        private long nextCheckBufferUnderrun;
        
        /** Send blank audio packet next?. */
        private boolean sendBlankAudio;
        
		/**
		 * Constructs a new PlayEngine.
		 */
        public PlayEngine() {
			state = State.UNINIT;
		}

        /**
         * Start stream.
         */
        public synchronized void start() {
			if (state != State.UNINIT) {
				throw new IllegalStateException();
			}
			state = State.STOPPED;
			schedulingService = (ISchedulingService) getScope().getContext()
					.getBean(ISchedulingService.BEAN_NAME);
			IConsumerService consumerManager = (IConsumerService) getScope()
					.getContext().getBean(IConsumerService.KEY);
			msgOut = consumerManager
					.getConsumerOutput(PlaylistSubscriberStream.this);
			msgOut.subscribe(this, null);
			audioBucket = bwController
					.getAudioBucket(bwContext);
			videoBucket = bwController
					.getVideoBucket(bwContext);
		}

        /**
         * Play stream.
         * 
         * @param item                  Playlist item
         * 
         * @throws StreamNotFoundException       Stream not found
         * @throws IllegalStateException         Stream is in stopped state
         * @throws IOException Signals that an I/O exception has occurred.
         */
        public synchronized void play(IPlayItem item)
			throws StreamNotFoundException, IllegalStateException, IOException {
        	play(item, true);
        }

        /**
         * Play stream.
         * 
         * @param item                  Playlist item
         * @param withReset 			Send reset status before playing.
         * 
         * @throws StreamNotFoundException       Stream not found
         * @throws IllegalStateException         Stream is in stopped state
         * @throws IOException Signals that an I/O exception has occurred.
         */
        public synchronized void play(IPlayItem item, boolean withReset)
				throws StreamNotFoundException, IllegalStateException, IOException {
            // Can't play if state is not stopped
            if (state != State.STOPPED) {
				throw new IllegalStateException();
			}
            if (msgIn != null) {
            	msgIn.unsubscribe(this);
            	msgIn = null;
            }
			int type = (int) (item.getStart() / 1000);
			// see if it's a published stream
			IScope thisScope = getScope();
			IContext context = thisScope.getContext();
			IProviderService providerService = (IProviderService) context
					.getBean(IProviderService.BEAN_NAME);
            // Get live input
            IMessageInput liveInput = providerService.getLiveProviderInput(
					thisScope, item.getName(), false);
            // Get VOD input
            IMessageInput vodInput = providerService.getVODProviderInput(
					thisScope, item.getName());

            boolean isPublishedStream = liveInput != null;
			boolean isFileStream = vodInput != null;
			boolean sendNotifications = true;

			// decision: 0 for Live, 1 for File, 2 for Wait, 3 for N/A

			int decision = 3;

			switch (type) {
				case -2:
					if (isPublishedStream) {
						decision = 0;
					} else if (isFileStream) {
						decision = 1;
					} else {
						decision = 2;
					}
					break;

				case -1:
					if (isPublishedStream) {
						decision = 0;
					} else {
						decision = 2;
					}
					break;

				default:
					if (isFileStream) {
						decision = 1;
					}
					break;
			}
			if (decision == 2) {
				liveInput = providerService.getLiveProviderInput(thisScope,
						item.getName(), true);
			}
			currentItem = item;
			switch (decision) {
				case 0:
					msgIn = liveInput;
					// Drop all frames up to the next keyframe
					videoFrameDropper.reset(IFrameDropper.SEND_KEYFRAMES_CHECK);
					if (msgIn instanceof IBroadcastScope) {
						// Send initial keyframe
						IClientBroadcastStream stream = (IClientBroadcastStream) ((IBroadcastScope) msgIn)
								.getAttribute(IBroadcastScope.STREAM_ATTRIBUTE);
						if (stream != null && stream.getCodecInfo() != null) {
							IVideoStreamCodec videoCodec = stream
									.getCodecInfo().getVideoCodec();
							if (videoCodec != null) {
								ByteBuffer keyFrame = videoCodec.getKeyframe();
								if (keyFrame != null) {
									VideoData video = new VideoData(keyFrame);
									try {
										if (withReset) {
											sendReset();
											//sendBlankAudio(0);
											//sendBlankVideo(0);
											sendResetStatus(item);
											sendStartStatus(item);
										}

										video.setTimestamp(0);

										RTMPMessage videoMsg = new RTMPMessage();
										videoMsg.setBody(video);
										msgOut.pushMessage(videoMsg);
										sendNotifications = false;
										// Don't wait for keyframe
										videoFrameDropper.reset();
									} finally {
										video.release();
									}
								}
							}
						}
					}
					msgIn.subscribe(this, null);
					break;
				case 2:
					msgIn = liveInput;
					msgIn.subscribe(this, null);
					isWaiting = true;
					if (type == -1 && item.getLength() >= 0) {
						// Wait given timeout for stream to be published
						waitLiveJob = schedulingService.addScheduledOnceJob(
								item.getLength(), new IScheduledJob() {
									/** {@inheritDoc} */
                                    public void execute(
											ISchedulingService service) {
										waitLiveJob = null;
										isWaiting = false;
										onItemEnd();
									}
								});
					}
					break;
				case 1:
					msgIn = vodInput;
					msgIn.subscribe(this, null);
					break;
				default:
					sendStreamNotFoundStatus(currentItem);
					throw new StreamNotFoundException(item.getName());
			}
			state = State.PLAYING;
			IMessage msg = null;
			streamOffset = 0;
			if (decision == 1) {
				if (withReset) {
					releasePendingMessage();
				}
				sendVODInitCM(msgIn, item);
				vodStartTS = -1;
				// Don't use pullAndPush to detect IOExceptions prior to sending
				// NetStream.Play.Start
				if (item.getStart() > 0) {
					streamOffset = sendVODSeekCM(msgIn, (int) item.getStart());
					// We seeked to the nearest keyframe so use real timestamp now
					if (streamOffset == -1) {
						streamOffset = (int) item.getStart();
					}
				}
				msg = msgIn.pullMessage();
				if (msg instanceof RTMPMessage) {
					IRTMPEvent body = ((RTMPMessage) msg).getBody();
					if (item.getLength() == 0) {
						// Only send first video frame
						body = ((RTMPMessage) msg).getBody();
						while (body != null && !(body instanceof VideoData)) {
							msg = msgIn.pullMessage();
							if (msg == null)
								break;
							
							if (!(msg instanceof RTMPMessage))
								continue;
							
							body = ((RTMPMessage) msg).getBody();
						}
					}
					
					if (body != null) {
						// Adjust timestamp when playing lists
						body.setTimestamp(body.getTimestamp() + timestampOffset);
					}
				}
			}
			if (sendNotifications) {
				if (withReset) { 
					sendReset();
					sendResetStatus(item);
				}
				
				sendStartStatus(item);
				if (!withReset) {
					sendSwitchStatus();
				}
			}
			if (msg != null)
				sendMessage((RTMPMessage) msg);
			notifyItemPlay(currentItem, !isPullMode);
			if (withReset) {
				playbackStart = System.currentTimeMillis() - streamOffset;
				nextCheckBufferUnderrun = System.currentTimeMillis() + bufferCheckInterval;
				if (currentItem.getLength() != 0) {
					ensurePullAndPushRunning();
				}
			}
		}

        /**
         * Pause at position.
         * 
         * @param position                  Position in file
         * 
         * @throws IllegalStateException    If stream is stopped
         */
        public synchronized void pause(int position)
				throws IllegalStateException {
			if ((state != State.PLAYING && state != State.STOPPED) || currentItem == null) {
				throw new IllegalStateException();
			}
			state = State.PAUSED;
			releasePendingMessage();
			clearWaitJobs();
			sendClearPing();
			sendPauseStatus(currentItem);
			notifyItemPause(currentItem, position);
		}

        /**
         * Resume playback.
         * 
         * @param position                   Resumes playback
         * 
         * @throws IllegalStateException     If stream is stopped
         */
        public synchronized void resume(int position)
				throws IllegalStateException {
			if (state != State.PAUSED) {
				throw new IllegalStateException();
			}
			state = State.PLAYING;
			sendReset();
			sendResumeStatus(currentItem);
			if (isPullMode) {
				sendVODSeekCM(msgIn, position);
				notifyItemResume(currentItem, position);
				playbackStart = System.currentTimeMillis() - position;
				if (currentItem.getLength() >= 0 && (position - streamOffset) >= currentItem.getLength()) {
					// Resume after end of stream
					stop();
				} else {
					ensurePullAndPushRunning();
				}
			} else {
				notifyItemResume(currentItem, position);
				videoFrameDropper.reset(VideoFrameDropper.SEND_KEYFRAMES_CHECK);
			}
		}

        /**
         * Seek position in file.
         * 
         * @param position                  Position
         * 
         * @throws IllegalStateException    If stream is in stopped state
         * @throws OperationNotSupportedException the operation not supported exception
         */
        public synchronized void seek(int position)
				throws IllegalStateException, OperationNotSupportedException {
			if (state != State.PLAYING && state != State.PAUSED && state != State.STOPPED) {
				throw new IllegalStateException();
			}
			if (!isPullMode) {
				throw new OperationNotSupportedException();
			}
			
			releasePendingMessage();
			clearWaitJobs();
			bwController.resetBuckets(bwContext);
			isWaitingForToken = false;
			sendClearPing();
			sendReset();
			sendSeekStatus(currentItem, position);
			sendStartStatus(currentItem);
			int seekPos = sendVODSeekCM(msgIn, position);
			// We seeked to the nearest keyframe so use real timestamp now
			if (seekPos == -1) {
				seekPos = position;
			}
			playbackStart = System.currentTimeMillis() - seekPos;
			notifyItemSeek(currentItem, seekPos);
			boolean messageSent = false;
			boolean startPullPushThread = false;
			if ((state == State.PAUSED || state == State.STOPPED) && sendCheckVideoCM(msgIn)) {
				// we send a single snapshot on pause.
				// XXX we need to take BWC into account, for
				// now send forcefully.
				IMessage msg;
				try {
					msg = msgIn.pullMessage();
				} catch (Throwable err) {
					log.error("Error while pulling message.", err);
					msg = null;
				}
				while (msg != null) {
					if (msg instanceof RTMPMessage) {
						RTMPMessage rtmpMessage = (RTMPMessage) msg;
						IRTMPEvent body = rtmpMessage.getBody();
						if (body instanceof VideoData
								&& ((VideoData) body).getFrameType() == FrameType.KEYFRAME) {
							body.setTimestamp(seekPos);
							doPushMessage(rtmpMessage);
							rtmpMessage.getBody().release();
							messageSent = true;
							lastMessage = body;
							break;
						}
					}
					
					try {
						msg = msgIn.pullMessage();
					} catch (Throwable err) {
						log.error("Error while pulling message.", err);
						msg = null;
					}
				}
			} else {
				startPullPushThread = true;
			}
			
			if (!messageSent) {
				// Send blank audio packet to notify client about new position
				AudioData audio = new AudioData();
				audio.setTimestamp(seekPos);
				audio.setHeader(new Header());
				audio.getHeader().setTimer(seekPos);
				audio.getHeader().setTimerRelative(false);
				RTMPMessage audioMessage = new RTMPMessage();
				audioMessage.setBody(audio);
				lastMessage = audio;
				doPushMessage(audioMessage);
			}
			
			if (startPullPushThread) {
				ensurePullAndPushRunning();
			}
			
			if (state != State.STOPPED && currentItem.getLength() >= 0 && (position - streamOffset) >= currentItem.getLength()) {
				// Seeked after end of stream
				stop();
				return;
			}
		}

        /**
         * Stop playback.
         * 
         * @throws IllegalStateException    If stream is in stopped state
         */
        public synchronized void stop() throws IllegalStateException {
        	if (state != State.PLAYING && state != State.PAUSED) {
				throw new IllegalStateException();
			}
			state = State.STOPPED;
			if (msgIn != null && !isPullMode) {
				msgIn.unsubscribe(this);
				msgIn = null;
			}
			notifyItemStop(currentItem);
			clearWaitJobs();
			if (!hasMoreItems()) {
				releasePendingMessage();
				bwController.resetBuckets(bwContext);
				isWaitingForToken = false;
				if (getItemSize() > 0) {
					sendCompleteStatus();
				}
				bytesSent = 0;
				sendClearPing();
				sendStopStatus(currentItem);
			} else {
				if (lastMessage != null) {
					// Remember last timestamp so we can generate correct
					// headers in playlists.
					timestampOffset = lastMessage.getTimestamp();
				}
				nextItem();
			}
		}

        /**
         * Close stream.
         */
        public synchronized void close() {
			if (msgIn != null) {
				msgIn.unsubscribe(this);
				msgIn = null;
			}
			state = State.CLOSED;
			clearWaitJobs();
			releasePendingMessage();
			lastMessage = null;
			sendClearPing();
		}

        /**
         * Check if it's okay to send the client more data. This takes the configured
         * bandwidth as well as the requested client buffer into account.
         * 
         * @param message the message
         * 
         * @return true, if okay to send message
         */
        private boolean okayToSendMessage(IRTMPEvent message) {
			if (!(message instanceof IStreamData)) {
				throw new RuntimeException(
						"expected IStreamData but got " + message.getClass() + " (type " + message.getDataType() + ")");
			}
			final long now = System.currentTimeMillis();
			// check client buffer length when we've already sent some messages
			if (lastMessage != null) {
				// Duration the stream is playing
				final long delta = now - playbackStart;
				// Buffer size as requested by the client
				final long buffer = getClientBufferDuration();

				// Expected amount of data present in client buffer
				final long buffered = lastMessage.getTimestamp() - delta;

				if (log.isDebugEnabled()) {
					log.debug("okayToSendMessage: " + lastMessage.getTimestamp() + " " + delta + " " + buffered + " " + buffer);
				}

				if (buffer > 0 && buffered > buffer) {
					// Client is likely to have enough data in the buffer
					return false;
				}
			}
			
			long pending = pendingMessages();
			if (bufferCheckInterval > 0 && now >= nextCheckBufferUnderrun) {
				if (pending > underrunTrigger) {
					// Client is playing behind speed, notify him
					sendInsufficientBandwidthStatus(currentItem);
				}
				nextCheckBufferUnderrun = now + bufferCheckInterval;
			}
			
			if (pending > underrunTrigger) {
				// Too many messages already queued on the connection
				return false;
			}
			
			if (((IStreamData) message).getData() == null) {
				// TODO: when can this happen?
				return true;
			}
			
			final int size = ((IStreamData) message).getData().limit();
			if (message instanceof VideoData) {
				if (needCheckBandwidth && !videoBucket.acquireTokenNonblocking(size, this)) {
					isWaitingForToken = true;
					return false;
				}
			} else if (message instanceof AudioData) {
				if (needCheckBandwidth && !audioBucket.acquireTokenNonblocking(size, this)) {
					isWaitingForToken = true;
					return false;
				}
			}
			
			return true;
        }

        /**
         * Make sure the pull and push processing is running.
         */
        private void ensurePullAndPushRunning() {
        	if (!isPullMode) {
        		// We don't need this for live streams
        		return;
        	}
        	
			if (pullAndPushFuture == null) {
				synchronized (this) {
					if (pullAndPushFuture == null) {
						// client buffer is at least 100ms
						pullAndPushFuture = getExecutor().scheduleWithFixedDelay(new PullAndPushRunnable(), 0, 10, TimeUnit.MILLISECONDS);
					}
				}
			}
        }
        
        /**
         * Recieve then send if message is data (not audio or video).
         * 
         * @throws IOException Signals that an I/O exception has occurred.
         */
        private synchronized void pullAndPush() throws IOException {
			if (state == State.PLAYING && isPullMode && !isWaitingForToken) {
				if (pendingMessage != null) {
					IRTMPEvent body = pendingMessage.getBody();
					if (!okayToSendMessage(body)) {
						return;
					}
					
					sendMessage(pendingMessage);
					releasePendingMessage();
				} else {
					while (true) {
						IMessage msg = msgIn.pullMessage();
						if (msg == null) {
							// No more packets to send
							stop();
							break;
						} else {
							if (msg instanceof RTMPMessage) {
								RTMPMessage rtmpMessage = (RTMPMessage) msg;
								IRTMPEvent body = rtmpMessage.getBody();
								if (!receiveAudio && body instanceof AudioData) {
									// The user doesn't want to get audio packets
									((IStreamData) body).getData().release();
									if (sendBlankAudio) {
										// Send reset audio packet
										sendBlankAudio = false;
										body = new AudioData();
										// We need a zero timestamp
										if (lastMessage != null) {
											body.setTimestamp(lastMessage.getTimestamp()-timestampOffset);
										} else {
											body.setTimestamp(-timestampOffset);
										}
										rtmpMessage.setBody(body);
									} else {
										continue;
									}
								} else if (!receiveVideo && body instanceof VideoData) {
									// The user doesn't want to get video packets
									((IStreamData) body).getData().release();
									continue;
								}
								
								// Adjust timestamp when playing lists
								body.setTimestamp(body.getTimestamp() + timestampOffset);
								if (okayToSendMessage(body)) {
									//System.err.println("ts: " + rtmpMessage.getBody().getTimestamp());
									sendMessage(rtmpMessage);
									((IStreamData) body).getData().release();
								} else {
									pendingMessage = rtmpMessage;
								}
								ensurePullAndPushRunning();
								break;
							}
						}
					}
				}
			}
		}

        /**
         * Clear all scheduled waiting jobs.
         */
		private void clearWaitJobs() {
			if (pullAndPushFuture != null) {
				pullAndPushFuture.cancel(false);
				pullAndPushFuture = null;
			}
			if (waitLiveJob != null) {
				schedulingService.removeScheduledJob(waitLiveJob);
				waitLiveJob = null;
			}
		}

		/**
		 * Send message to output stream and handle exceptions.
		 * 
		 * @param message The message to send.
		 */
		private void doPushMessage(AbstractMessage message) {
			try {
				msgOut.pushMessage(message);
				if (message instanceof RTMPMessage) {
					IRTMPEvent body = ((RTMPMessage) message).getBody();
					if (body instanceof IStreamData && ((IStreamData) body).getData() != null) {
						bytesSent += ((IStreamData) body).getData().limit();
					}
				}
				
			} catch (IOException err) {
				log.error("Error while pushing message.", err);
			}
		}
		
        /**
         * Send RTMP message.
         * 
         * @param message        RTMP message
         */
		private void sendMessage(RTMPMessage message) {
			if (vodStartTS == -1) {
				vodStartTS = message.getBody().getTimestamp();
			} else {
				if (currentItem.getLength() >= 0) {
					int duration = message.getBody().getTimestamp() - vodStartTS;
					if (duration - streamOffset >= currentItem.getLength()) {
						// Sent enough data to client
						stop();
						return;
					}
				}
			}
			lastMessage = message.getBody();
			if (lastMessage instanceof IStreamData) {
				bytesSent += ((IStreamData) lastMessage).getData().limit();
			}
			doPushMessage(message);
		}

        /**
         * Send clear ping, that is, just to check if connection is alive.
         */
		private void sendClearPing() {
			Ping ping1 = new Ping();
			ping1.setValue1((short) Ping.STREAM_PLAYBUFFER_CLEAR);
			ping1.setValue2(getStreamId());

			RTMPMessage ping1Msg = new RTMPMessage();
			ping1Msg.setBody(ping1);
			doPushMessage(ping1Msg);
		}

        /**
         * Send reset message.
         */
		private void sendReset() {
			if (isPullMode) {
				Ping ping1 = new Ping();
				ping1.setValue1((short) Ping.STREAM_RESET);
				ping1.setValue2(getStreamId());

				RTMPMessage ping1Msg = new RTMPMessage();
				ping1Msg.setBody(ping1);
				doPushMessage(ping1Msg);
			}

			Ping ping2 = new Ping();
			ping2.setValue1((short) Ping.STREAM_CLEAR);
			ping2.setValue2(getStreamId());

			RTMPMessage ping2Msg = new RTMPMessage();
			ping2Msg.setBody(ping2);
			doPushMessage(ping2Msg);

			ResetMessage reset = new ResetMessage();
			doPushMessage(reset);
		}

        /**
         * Send reset status for item.
         * 
         * @param item            Playlist item
         */
		private void sendResetStatus(IPlayItem item) {
			Status reset = new Status(StatusCodes.NS_PLAY_RESET);
			reset.setClientid(getStreamId());
			reset.setDetails(item.getName());
			reset
					.setDesciption("Playing and resetting " + item.getName()
							+ '.');

			StatusMessage resetMsg = new StatusMessage();
			resetMsg.setBody(reset);
			doPushMessage(resetMsg);
		}

        /**
         * Send playback start status notification.
         * 
         * @param item            Playlist item
         */
		private void sendStartStatus(IPlayItem item) {
			Status start = new Status(StatusCodes.NS_PLAY_START);
			start.setClientid(getStreamId());
			start.setDetails(item.getName());
			start.setDesciption("Started playing " + item.getName() + '.');

			StatusMessage startMsg = new StatusMessage();
			startMsg.setBody(start);
			doPushMessage(startMsg);
		}

        /**
         * Send playback stoppage status notification.
         * 
         * @param item            Playlist item
         */
		private void sendStopStatus(IPlayItem item) {
			Status stop = new Status(StatusCodes.NS_PLAY_STOP);
			stop.setClientid(getStreamId());
			stop.setDesciption("Stopped playing " + item.getName() + ".");
			stop.setDetails(item.getName());

			StatusMessage stopMsg = new StatusMessage();
			stopMsg.setBody(stop);
			doPushMessage(stopMsg);
		}

		/**
		 * Send on play status.
		 * 
		 * @param code the code
		 * @param duration the duration
		 * @param bytes the bytes
		 */
		private void sendOnPlayStatus(String code, int duration, long bytes) {
			ByteBuffer buf = ByteBuffer.allocate(1024);
			buf.setAutoExpand(true);
			Output out = new Output(buf);
			out.writeString("onPlayStatus");
			Map<Object, Object> props = new HashMap<Object, Object>();
			props.put("code", code);
			props.put("level", "status");
			props.put("duration", duration);
			props.put("bytes", bytes);
			out.writeMap(props, new Serializer());
			buf.flip();

			IRTMPEvent event = new Notify(buf);
			if (lastMessage != null) {
				int timestamp = lastMessage.getTimestamp();
				event.setTimestamp(timestamp);
			} else {
				event.setTimestamp(0);
			}
			RTMPMessage msg = new RTMPMessage();
			msg.setBody(event);
			doPushMessage(msg);
		}
		
        /**
         * Send playlist switch status notification.
         */
		private void sendSwitchStatus() {
			// TODO: find correct duration to sent
			int duration = 1;
			sendOnPlayStatus(StatusCodes.NS_PLAY_SWITCH, duration, bytesSent);
		}

		/**
		 * Send playlist complete status notification.
		 */
		private void sendCompleteStatus() {
			// TODO: find correct duration to sent
			int duration = 1;
			sendOnPlayStatus(StatusCodes.NS_PLAY_COMPLETE, duration, bytesSent);
		}

        /**
         * Send seek status notification.
         * 
         * @param item            Playlist item
         * @param position        Seek position
         */
		private void sendSeekStatus(IPlayItem item, int position) {
			Status seek = new Status(StatusCodes.NS_SEEK_NOTIFY);
			seek.setClientid(getStreamId());
			seek.setDetails(item.getName());
			seek.setDesciption("Seeking " + position + " (stream ID: "
					+ getStreamId() + ").");

			StatusMessage seekMsg = new StatusMessage();
			seekMsg.setBody(seek);
			doPushMessage(seekMsg);
		}

        /**
         * Send pause status notification.
         * 
         * @param item            Playlist item
         */
		private void sendPauseStatus(IPlayItem item) {
			Status pause = new Status(StatusCodes.NS_PAUSE_NOTIFY);
			pause.setClientid(getStreamId());
			pause.setDetails(item.getName());

			StatusMessage pauseMsg = new StatusMessage();
			pauseMsg.setBody(pause);
			doPushMessage(pauseMsg);
		}

        /**
         * Send resume status notification.
         * 
         * @param item            Playlist item
         */
		private void sendResumeStatus(IPlayItem item) {
			Status resume = new Status(StatusCodes.NS_UNPAUSE_NOTIFY);
			resume.setClientid(getStreamId());
			resume.setDetails(item.getName());

			StatusMessage resumeMsg = new StatusMessage();
			resumeMsg.setBody(resume);
			doPushMessage(resumeMsg);
		}

        /**
         * Send published status notification.
         * 
         * @param item            Playlist item
         */
		private void sendPublishedStatus(IPlayItem item) {
			Status published = new Status(StatusCodes.NS_PLAY_PUBLISHNOTIFY);
			published.setClientid(getStreamId());
			published.setDetails(item.getName());

			StatusMessage unpublishedMsg = new StatusMessage();
			unpublishedMsg.setBody(published);
			doPushMessage(unpublishedMsg);
		}

        /**
         * Send unpublished status notification.
         * 
         * @param item            Playlist item
         */
		private void sendUnpublishedStatus(IPlayItem item) {
			Status unpublished = new Status(StatusCodes.NS_PLAY_UNPUBLISHNOTIFY);
			unpublished.setClientid(getStreamId());
			unpublished.setDetails(item.getName());

			StatusMessage unpublishedMsg = new StatusMessage();
			unpublishedMsg.setBody(unpublished);
			doPushMessage(unpublishedMsg);
		}

        /**
         * Stream not found status notification.
         * 
         * @param item            Playlist item
         */
		private void sendStreamNotFoundStatus(IPlayItem item) {
			Status notFound = new Status(StatusCodes.NS_PLAY_STREAMNOTFOUND);
			notFound.setClientid(getStreamId());
			notFound.setLevel(Status.ERROR);
			notFound.setDetails(item.getName());

			StatusMessage notFoundMsg = new StatusMessage();
			notFoundMsg.setBody(notFound);
			doPushMessage(notFoundMsg);
		}

        /**
         * Insufficient bandwidth notification.
         * 
         * @param item            Playlist item
         */
		private void sendInsufficientBandwidthStatus(IPlayItem item) {
			Status insufficientBW = new Status(StatusCodes.NS_PLAY_INSUFFICIENT_BW);
			insufficientBW.setClientid(getStreamId());
			insufficientBW.setLevel(Status.WARNING);
			insufficientBW.setDetails(item.getName());
			insufficientBW.setDesciption("Data is playing behind the normal speed.");

			StatusMessage insufficientBWMsg = new StatusMessage();
			insufficientBWMsg.setBody(insufficientBW);
			doPushMessage(insufficientBWMsg);
		}

        /**
         * Send VOD init control message.
         * 
         * @param msgIn           Message input
         * @param item            Playlist item
         */
		private void sendVODInitCM(IMessageInput msgIn, IPlayItem item) {
			OOBControlMessage oobCtrlMsg = new OOBControlMessage();
			oobCtrlMsg.setTarget(IPassive.KEY);
			oobCtrlMsg.setServiceName("init");
			Map<Object, Object> paramMap = new HashMap<Object, Object>();
			paramMap.put("startTS", (int) item.getStart());
			oobCtrlMsg.setServiceParamMap(paramMap);
			msgIn.sendOOBControlMessage(this, oobCtrlMsg);
		}

        /**
         * Send VOD seek control message.
         * 
         * @param msgIn            Message input
         * @param position         Playlist item
         * 
         * @return                 Out-of-band control message call result or -1 on failure
         */
		private int sendVODSeekCM(IMessageInput msgIn, int position) {
			OOBControlMessage oobCtrlMsg = new OOBControlMessage();
			oobCtrlMsg.setTarget(ISeekableProvider.KEY);
			oobCtrlMsg.setServiceName("seek");
			Map<Object, Object> paramMap = new HashMap<Object, Object>();
			paramMap.put("position", position);
			oobCtrlMsg.setServiceParamMap(paramMap);
			msgIn.sendOOBControlMessage(this, oobCtrlMsg);
			if (oobCtrlMsg.getResult() instanceof Integer) {
				return (Integer) oobCtrlMsg.getResult();
			} else {
				return -1;
			}
		}

		/**
		 * Send VOD check video control message.
		 * 
		 * @param msgIn the msg in
		 * 
		 * @return true, if send check video cm
		 */
		private boolean sendCheckVideoCM(IMessageInput msgIn) {
			OOBControlMessage oobCtrlMsg = new OOBControlMessage();
			oobCtrlMsg.setTarget(IStreamTypeAwareProvider.KEY);
			oobCtrlMsg.setServiceName("hasVideo");
			msgIn.sendOOBControlMessage(this, oobCtrlMsg);
			if (oobCtrlMsg.getResult() instanceof Boolean) {
				return (Boolean) oobCtrlMsg.getResult();
			} else {
				return false;
			}
		}

		/** {@inheritDoc} */
        public void onOOBControlMessage(IMessageComponent source, IPipe pipe,
				OOBControlMessage oobCtrlMsg) {
			if ("ConnectionConsumer".equals(oobCtrlMsg.getTarget())) {
				if (source instanceof IProvider) {
					msgOut
							.sendOOBControlMessage((IProvider) source,
									oobCtrlMsg);
				}
			}
		}

		/** {@inheritDoc} */
        public void onPipeConnectionEvent(PipeConnectionEvent event) {
			switch (event.getType()) {
				case PipeConnectionEvent.PROVIDER_CONNECT_PUSH:
					if (event.getProvider() != this) {
						if (isWaiting) {
							schedulingService.removeScheduledJob(waitLiveJob);
							waitLiveJob = null;
							isWaiting = false;
						}
						sendPublishedStatus(currentItem);
					}
					break;
				case PipeConnectionEvent.PROVIDER_DISCONNECT:
					if (isPullMode) {
						sendStopStatus(currentItem);
					} else {
						sendUnpublishedStatus(currentItem);
					}
					break;
				case PipeConnectionEvent.CONSUMER_CONNECT_PULL:
					if (event.getConsumer() == this) {
						isPullMode = true;
					}
					break;
				case PipeConnectionEvent.CONSUMER_CONNECT_PUSH:
					if (event.getConsumer() == this) {
						isPullMode = false;
					}
					break;
				default:
					break;
			}
		}

		/** {@inheritDoc} */
        public synchronized void pushMessage(IPipe pipe, IMessage message) throws IOException {
			if (message instanceof ResetMessage) {
				sendReset();
				return;
			}
			if (message instanceof RTMPMessage) {
				RTMPMessage rtmpMessage = (RTMPMessage) message;
				IRTMPEvent body = rtmpMessage.getBody();
				if (!(body instanceof IStreamData)) {
					throw new RuntimeException("expected IStreamData but got "
							+ body.getClass() + " (type " + body.getDataType() + ")");
				}

				int size = ((IStreamData) body).getData().limit();
				if (body instanceof VideoData) {
					IVideoStreamCodec videoCodec = null;
					if (msgIn instanceof IBroadcastScope) {
						IClientBroadcastStream stream = (IClientBroadcastStream) ((IBroadcastScope) msgIn)
								.getAttribute(IBroadcastScope.STREAM_ATTRIBUTE);
						if (stream != null && stream.getCodecInfo() != null) {
							videoCodec = stream.getCodecInfo().getVideoCodec();
						}
					}

					if (videoCodec == null || videoCodec.canDropFrames()) {
						if (state == State.PAUSED) {
							// The subscriber paused the video
							videoFrameDropper.dropPacket(rtmpMessage);
							return;
						}
						
						// Only check for frame dropping if the codec supports it
						long pendingVideos = pendingVideoMessages();
						if (!videoFrameDropper.canSendPacket(rtmpMessage,
								pendingVideos)) {
							// Drop frame as it depends on other frames that were dropped before.
							return;
						}

						boolean drop = !videoBucket.acquireToken(size, 0);
						if (!receiveVideo || drop) {
							// The client disabled video or the app doesn't have enough bandwidth
							// allowed for this stream.
							videoFrameDropper.dropPacket(rtmpMessage);
							return;
						}

						Long[] writeDelta = getWriteDelta();
						if (pendingVideos > 1 /*|| writeDelta[0] > writeDelta[1]*/) {
							// We drop because the client has insufficient bandwidth.
							long now = System.currentTimeMillis();
							if (bufferCheckInterval > 0 && now >= nextCheckBufferUnderrun) {
								// Notify client about frame dropping (keyframe)
								sendInsufficientBandwidthStatus(currentItem);
								nextCheckBufferUnderrun = now + bufferCheckInterval;
							}
							videoFrameDropper.dropPacket(rtmpMessage);
							return;
						}
						
						videoFrameDropper.sendPacket(rtmpMessage);
					}
				} else if (body instanceof AudioData) {
					if (!receiveAudio && sendBlankAudio) {
						// Send blank audio packet to reset player
						sendBlankAudio = false;
						body = new AudioData();
						if (lastMessage != null) {
							body.setTimestamp(lastMessage.getTimestamp());
						} else {
							body.setTimestamp(0);
						}
						rtmpMessage.setBody(body);
					} else if (state == State.PAUSED || !receiveAudio || !audioBucket.acquireToken(size, 0)) {
						return;
					}
				}
				if (body instanceof IStreamData && ((IStreamData) body).getData() != null) {
					bytesSent += ((IStreamData) body).getData().limit();
				}
				lastMessage = body;
			}
			msgOut.pushMessage(message);
		}

		/** {@inheritDoc} */
        public synchronized void available(ITokenBucket bucket,
				long tokenCount) {
			isWaitingForToken = false;
			needCheckBandwidth = false;
			try {
				pullAndPush();
			} catch (Throwable err) {
				log.error("Error while pulling message.", err);
			}
			needCheckBandwidth = true;
		}

		/** {@inheritDoc} */
        public void reset(ITokenBucket bucket, long tokenCount) {
			isWaitingForToken = false;
		}

        /**
         * Update bandwidth configuration.
         */
		public void updateBandwithConfigure() {
			bwController.updateBWConfigure(bwContext);
		}

        /**
         * Get number of pending video messages.
         * 
         * @return          Number of pending video messages
         */
		private long pendingVideoMessages() {
			OOBControlMessage pendingRequest = new OOBControlMessage();
			pendingRequest.setTarget("ConnectionConsumer");
			pendingRequest.setServiceName("pendingVideoCount");
			msgOut.sendOOBControlMessage(this, pendingRequest);
			if (pendingRequest.getResult() != null) {
				return (Long) pendingRequest.getResult();
			} else {
				return 0;
			}
		}
		
        /**
         * Get number of pending messages to be sent.
         * 
         * @return          Number of pending messages
         */
		private long pendingMessages() {
			return getConnection().getPendingMessages();
		}

        /**
         * Get informations about bytes send and number of bytes the client reports
         * to have received.
         * 
         * @return          Written bytes and number of bytes the client received
         */
		private Long[] getWriteDelta() {
			OOBControlMessage pendingRequest = new OOBControlMessage();
			pendingRequest.setTarget("ConnectionConsumer");
			pendingRequest.setServiceName("writeDelta");
			msgOut.sendOOBControlMessage(this, pendingRequest);
			if (pendingRequest.getResult() != null) {
				return (Long[]) pendingRequest.getResult();
			} else {
				return new Long[]{Long.valueOf(0), Long.valueOf(0)};
			}
		}

        /**
         * Releases pending message body, nullifies pending message object.
         */
		private synchronized void releasePendingMessage() {
			if (pendingMessage != null) {
				IRTMPEvent body = pendingMessage.getBody(); 
				if (body instanceof IStreamData && ((IStreamData) body).getData() != null) { 
					((IStreamData) body).getData().release(); 
				} 
				pendingMessage.setBody(null);
				pendingMessage = null;
			}
		}
		
		/**
		 * Periodically triggered by executor to send messages to the client.
		 */
		private class PullAndPushRunnable implements Runnable {
			
			/**
			 * Trigger sending of messages.
			 */
			public void run() {
				try {
					pullAndPush();
				} catch (IOException err) {
					// We couldn't get more data, stop stream.
					log.error("Error while getting message.", err);
					PlayEngine.this.stop();
				}
			}
			
		}
		
	}

    /**
     * Throw when stream can't be found.
     */
	private class StreamNotFoundException extends Exception {
		
		/** The Constant serialVersionUID. */
		private static final long serialVersionUID = 812106823615971891L;

		/**
		 * Instantiates a new stream not found exception.
		 * 
		 * @param name the name
		 */
		public StreamNotFoundException(String name) {
			super("Stream " + name + " not found.");
		}

	}
	
}
