package org.bigbluebutton.api.domain;

public class CaptionTrack {
	public final String kind;
	public final String lang;
	public final String source;
	public final String href;

	public CaptionTrack(String kind, String lang, String source, String href) {
		this.kind = kind;
		this.lang = lang;
		this.source = source;
		this.href = href;
	}
}
