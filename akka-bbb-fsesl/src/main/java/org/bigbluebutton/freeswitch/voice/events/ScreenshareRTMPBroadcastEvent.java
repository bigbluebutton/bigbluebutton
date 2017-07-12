/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.freeswitch.voice.events;

public class ScreenshareRTMPBroadcastEvent extends VoiceConferenceEvent {

	private String timestamp;
	private boolean broadcast;
	private String streamUrl;
	private Integer vw;
	private Integer vh;

	private final String SCREENSHARE_SUFFIX = "-SCREENSHARE";


	public ScreenshareRTMPBroadcastEvent(String room, boolean broadcast) {
		super(room);
		this.broadcast = broadcast;
	}

	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	public void setBroadcastingStreamUrl(String streamUrl) {
		this.streamUrl = streamUrl;
	}

	public void setVideoWidth(Integer vw) {this.vw = vw;}

	public void setVideoHeight(Integer vh) {this.vh = vh;}

	public Integer getVideoHeight() {return vh;}

	public Integer getVideoWidth() {return vw;}

	public String getTimestamp() {
		return timestamp;
	}

	public String getBroadcastingStreamUrl()
	{
		if (streamUrl.endsWith(SCREENSHARE_SUFFIX)) {
			streamUrl = streamUrl.replace(SCREENSHARE_SUFFIX, "");
		}
		return streamUrl;
	}

	public boolean getBroadcast() {
		return broadcast;
	}
}
