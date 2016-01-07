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

public class DeskShareRecordingEvent extends VoiceConferenceEvent {

	private String filename;
	private boolean record;
	private String timestamp;

	private Integer channels;
	private double fps;
	private Integer sampleRate;
	private Integer vh;
	private Integer vw;

	public DeskShareRecordingEvent(String room, boolean record) {
		super(room);
		this.record = record;
	}

	public Integer getChannels() {
		return channels;
	}

	public Double getFramesPerSecond() {
		return fps;
	}

	public boolean getRecord() {
		return record;
	}

	public String getRecordingFilename() {
		return filename;
	}

	public Integer getSampleRate() {
		return sampleRate;
	}

	public String getTimestamp() {
		return timestamp;
	}

	public Integer getVideoHeight() {
		return vh;
	}

	public Integer getVideoWidth() {
		return vw;
	}

	public void setChannels(Integer channels) {
		this.channels = channels;
	}

	public void setFramesPerSecond(Double fps) {
		this.fps = fps;
	}

	public void setRecordingFilename(String filename) {
		this.filename = filename;
	}

	public void setSampleRate(Integer sampleRate) {
		this.sampleRate = sampleRate;
	}

	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	public void setVideoHeight(Integer vh) {
		this.vh = vh;
	}

	public void setVideoWidth(Integer vw) {
		this.vw = vw;
	}
}
