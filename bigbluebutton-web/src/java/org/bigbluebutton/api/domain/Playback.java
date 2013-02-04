package org.bigbluebutton.api.domain;

public class Playback {
	private String format;
	private String url;
	private int length;
	
	public Playback(String format, String url, int length) {
		this.format = format;
		this.url = url;
		this.length = length;
	}
	public String getFormat() {
		return format;
	}
	public void setFormat(String format) {
		this.format = format;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	public int getLength() {
		return length;
	}
	public void setLength(int length) {
		this.length = length;
	}
	
	
}
