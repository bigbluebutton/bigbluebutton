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

import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.net.rtmp.event.VideoData.FrameType;
import org.red5.server.stream.message.RTMPMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * State machine for video frame dropping in live streams.
 * <p>
 * We start sending all frame types. Disposable interframes can be dropped any
 * time without affecting the current state. If a regular interframe is dropped,
 * all future frames up to the next keyframes are dropped as well. Dropped
 * keyframes result in only keyframes being sent. If two consecutive keyframes
 * have been successfully sent, regular interframes will be sent in the next
 * iteration as well. If these frames all went through, disposable interframes
 * are sent again.
 * 
 * <p>
 * So from highest to lowest bandwidth and back, the states go as follows:
 * <ul>
 * <li>all frames</li>
 * <li>keyframes and interframes</li>
 * <li>keyframes</li>
 * <li>keyframes and interframes</li>
 * <li>all frames</li>
 * </ul>
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class VideoFrameDropper implements IFrameDropper {

	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(VideoFrameDropper.class
			.getName());

	/** Current state. */
	private int state;

	/**
	 * Constructs a new VideoFrameDropper.
	 */
    public VideoFrameDropper() {
		reset();
	}

	/** {@inheritDoc} */
    public void reset() {
		reset(SEND_ALL);
	}

	/** {@inheritDoc} */
    public void reset(int state) {
		this.state = state;
	}

	/** {@inheritDoc} */
    public boolean canSendPacket(RTMPMessage message, long pending) {
		IRTMPEvent packet = message.getBody();
		if (!(packet instanceof VideoData)) {
			// We currently only drop video packets.
			return true;
		}

		VideoData video = (VideoData) packet;
		FrameType type = video.getFrameType();
		boolean result = false;
		switch (state) {
			case SEND_ALL:
				// All packets will be sent.
				result = true;
				break;
			case SEND_INTERFRAMES:
				// Only keyframes and interframes will be sent.
				if (type == FrameType.KEYFRAME) {
					if (pending == 0) {
						// Send all frames from now on.
						state = SEND_ALL;
					}
					result = true;
				} else if (type == FrameType.INTERFRAME) {
					result = true;
				}
				break;
			case SEND_KEYFRAMES:
				// Only keyframes will be sent.
				result = (type == FrameType.KEYFRAME);
				if (result && pending == 0) {
					// Maybe switch back to SEND_INTERFRAMES after the next keyframe
					state = SEND_KEYFRAMES_CHECK;
				}
				break;
			case SEND_KEYFRAMES_CHECK:
				// Only keyframes will be sent.
				result = (type == FrameType.KEYFRAME);
				if (result && pending == 0) {
					// Continue with sending interframes as well
					state = SEND_INTERFRAMES;
				}
				break;
			default:
		}

		return result;
	}

	/** {@inheritDoc} */
    public void dropPacket(RTMPMessage message) {
		IRTMPEvent packet = message.getBody();
		if (!(packet instanceof VideoData)) {
			// Only check video packets.
			return;
		}

		VideoData video = (VideoData) packet;
		FrameType type = video.getFrameType();

		switch (state) {
			case SEND_ALL:
				if (type == FrameType.DISPOSABLE_INTERFRAME) {
					// Remain in state, packet is safe to drop.
					return;
				} else if (type == FrameType.INTERFRAME) {
					// Drop all frames until the next keyframe.
					state = SEND_KEYFRAMES;
					return;
				} else if (type == FrameType.KEYFRAME) {
					// Drop all frames until the next keyframe.
					state = SEND_KEYFRAMES;
					return;
				}
				break;
			case SEND_INTERFRAMES:
				if (type == FrameType.INTERFRAME) {
					// Drop all frames until the next keyframe.
					state = SEND_KEYFRAMES_CHECK;
					return;
				} else if (type == FrameType.KEYFRAME) {
					// Drop all frames until the next keyframe.
					state = SEND_KEYFRAMES;
					return;
				}
				break;
			case SEND_KEYFRAMES:
				// Remain in state.
				break;
			case SEND_KEYFRAMES_CHECK:
				if (type == FrameType.KEYFRAME) {
					// Switch back to sending keyframes, but don't move to
					// SEND_INTERFRAMES afterwards.
					state = SEND_KEYFRAMES;
					return;
				}
				break;
			default:
		}
	}

	/** {@inheritDoc} */
    public void sendPacket(RTMPMessage message) {

	}

}
