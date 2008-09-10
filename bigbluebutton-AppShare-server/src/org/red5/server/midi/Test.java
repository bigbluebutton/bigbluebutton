package org.red5.server.midi;

import javax.sound.midi.MidiDevice;
import javax.sound.midi.MidiMessage;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.MidiUnavailableException;
import javax.sound.midi.Receiver;
import javax.sound.midi.MidiDevice.Info;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * The Class Test.
 */
public class Test {

	// Initialize Logging
	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(Test.class);

	/**
	 * The main method.
	 * 
	 * @param args the arguments
	 * 
	 * @throws Exception the exception
	 */
	public static void main(String[] args) throws Exception {
		@SuppressWarnings("unused") Test t = new Test();
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
	 * Constructs a new Test.
	 * 
	 * @throws Exception the exception
	 */
    public Test() throws Exception {

		String MIDI_NAME = "USB Uno MIDI  In";
		MidiDevice dev = getMidiDevice(MIDI_NAME);
		dev.open();
		MyReceiver rec = new MyReceiver();
		dev.getTransmitter().setReceiver(rec);
		Thread.sleep(20000);
		dev.close();

	}

	/**
	 * The Class MyReceiver.
	 */
	public class MyReceiver extends Object implements Receiver {

		/** {@inheritDoc} */
        public void send(MidiMessage midi, long time) {
			byte[] msg = midi.getMessage();
			int len = midi.getLength();
			if (len <= 1) {
				return;
			}
			String out = "Status: " + msg[0] + " Data: [";
			for (int i = 1; i < len; i++) {
				out += msg[i] + ((i == len - 1) ? "" : ",");
			}
			out += ']';
			log.debug(out);
		}

		/** {@inheritDoc} */
        public void close() {
			log.debug("Closing");
		}
	}

}