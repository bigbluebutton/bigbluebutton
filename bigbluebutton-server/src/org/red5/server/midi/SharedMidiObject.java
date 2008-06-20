package org.red5.server.midi;

import java.util.ArrayList;
import java.util.List;

import javax.sound.midi.MidiDevice;
import javax.sound.midi.MidiMessage;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.MidiUnavailableException;
import javax.sound.midi.Receiver;
import javax.sound.midi.MidiDevice.Info;

import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * The Class SharedMidiObject.
 */
public class SharedMidiObject {

	/** The Constant log. */
	private static final Logger log = LoggerFactory.getLogger(SharedMidiObject.class);

	/** The device name. */
	protected String deviceName;

	/** The so. */
	protected ISharedObject so;

	/** The dev. */
	protected MidiDevice dev;

	/**
	 * Instantiates a new shared midi object.
	 * 
	 * @param deviceName the device name
	 * @param so the so
	 */
	public SharedMidiObject(String deviceName, ISharedObject so) {
		this.deviceName = deviceName;
		this.so = so;
	}

	/**
	 * Connect.
	 * 
	 * @return true, if successful
	 */
	public boolean connect() {
		try {
			dev = getMidiDevice(deviceName);
			if (dev == null) {
				log.error("Midi device not found: " + deviceName);
				return false;
			}
			if (!dev.isOpen()) {
				dev.open();
			}
			dev.getTransmitter().setReceiver(new MidiReceiver());
			return true;
		} catch (MidiUnavailableException e) {
			log.error("Error connecting to midi device", e);
		}
		return false;
	}

	/**
	 * Close.
	 */
	public void close() {
		if (dev != null && dev.isOpen()) {
			dev.close();
		}
	}

	/**
	 * Gets the midi device.
	 * 
	 * @param name the name
	 * 
	 * @return the midi device
	 */
	public static MidiDevice getMidiDevice(String name) {

		MidiDevice.Info[] info = MidiSystem.getMidiDeviceInfo();

		for (Info element : info) {
			if (element.getName().equals(name)) {
				try {
					return MidiSystem.getMidiDevice(element);
				} catch (MidiUnavailableException e) {
					log.error("{}", e);
				}
			}
		}

		return null;

	}

	/**
	 * The Class MidiReceiver.
	 */
	public class MidiReceiver extends Object implements Receiver {

		/** {@inheritDoc} */
        public void send(MidiMessage midi, long time) {

			byte[] msg = midi.getMessage();
			int len = midi.getLength();
			if (len <= 1) {
				return;
			}

			List<Object> list = new ArrayList<Object>(3);
			list.add(time);
			list.add(len);
			list.add(msg);
			so.beginUpdate();
			so.sendMessage("midi", list);
			so.endUpdate();

			String out = "Midi >> Status: " + msg[0] + " Data: [";
			for (int i = 1; i < len; i++) {
				out += msg[i] + ((i == len - 1) ? "" : ",");
			}
			out += ']';

			log.debug(out);
		}

		/** {@inheritDoc} */
        public void close() {
			log.debug("Midi device closed");
		}

	}

}
