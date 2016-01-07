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

public class DeskShareRTMPBroadcastEvent extends VoiceConferenceEvent {

	private String timestamp;
	private boolean record;
	//{channels=2,samplerate=48000,vw=1920,vh=1080,fps=15.00}rtmp://192.168.0.109/live/abc/dev-test
	private String streamUrl;
	private Integer channels;
	private Integer sampleRate;
	private Integer vw;
	private Integer vh;
	private double fps;

	public DeskShareRTMPBroadcastEvent(String room, boolean record) {
		super(room);
		this.record = record;
	}

	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	public void setRecordingStreamUrl(String streamUrl) {
		this.streamUrl = streamUrl;
	}

//	public void setRecord(Boolean record) {
//		this.record = record;
//	}

	public void setChannels(Integer channels) {
		this.channels = channels;
	}

	public void setSampleRate(Integer sampleRate) {
		this.sampleRate = sampleRate;
	}

	public void setVideoWidth(Integer vw) {
		this.vw = vw;
	}

	public void setVideoHeight(Integer vh) {
		this.vh = vh;
	}

	public void setFramesPerSecond(Double fps) {
		this.fps = fps;
	}

	public String getTimestamp() {
		return timestamp;
	}

	public String getRecordingStreamUrl() {
		return streamUrl;
	}

	public boolean getRecord() {
		return record;
	}

	public Integer getChannels() {
		return channels;
	}

	public Integer getSampleRate() {
		return sampleRate;
	}

	public Integer getVideoHeight() {
		return vh;
	}

	public Integer getVideoWidth() {
		return vw;
	}

	public Double getFramesPerSecond() {
		return fps;
	}
}
