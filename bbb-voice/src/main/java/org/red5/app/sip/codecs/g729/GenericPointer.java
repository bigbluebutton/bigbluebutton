package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;

public class GenericPointer<T> {
	public T value = null;
	public GenericPointer(T v) {
		value = v;
	}
	public GenericPointer() {
	}
	public void setValue(T a) {
		value = a;
	}
}
