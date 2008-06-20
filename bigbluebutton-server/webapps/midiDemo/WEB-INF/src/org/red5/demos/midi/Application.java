package org.red5.demos.midi;

import java.util.ArrayList;
import java.util.List;

import javax.sound.midi.InvalidMidiDataException;
import javax.sound.midi.MidiDevice;
import javax.sound.midi.MidiMessage;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.MidiUnavailableException;
import javax.sound.midi.Receiver;
import javax.sound.midi.ShortMessage;
import javax.sound.midi.MidiDevice.Info;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.service.IServiceCapableConnection;

/**
 * Further informations about Java and MIDI:
 * http://www.jsresources.org/faq_midi.html
 * 
 */
public class Application extends ApplicationAdapter {

	protected static Logger log = LoggerFactory.getLogger(Application.class);

	/** {@inheritDoc} */
    @Override
	public boolean appStart(IScope app) {
		log.info("Midi demo app started");
		return super.appStart(app);
	}

	/** {@inheritDoc} */
    @Override
	public void appDisconnect(IConnection conn) {
		if (conn.hasAttribute("midiIn")) {
			MidiDevice dev = (MidiDevice) conn.getAttribute("midiIn");
			if (dev.isOpen()) {
				dev.close();
			}
		}
		if (conn.hasAttribute("midiOut")) {
			MidiDevice dev = (MidiDevice) conn.getAttribute("midiOut");
			if (dev.isOpen()) {
				dev.close();
			}
		}
		super.appDisconnect(conn);
	}

	public boolean connectToMidi(String inDeviceName, String outDeviceName) {
		IServiceCapableConnection conn = (IServiceCapableConnection) Red5
				.getConnectionLocal(); 
		log.info("Connecting IN midi device: {}", inDeviceName);
		try {
			MidiDevice dev = null;
			// Close any existing device
			if (conn.hasAttribute("midiIn")) {
				dev = (MidiDevice) conn.getAttribute("midiIn");
				if (dev.isOpen()) {
					dev.close();
				}
			}
			// Lookup the current device (we need the transmitter here)
			dev = getMidiDevice(inDeviceName, false);
			if (dev == null) {
				log.error("Midi IN device not found: {}", inDeviceName);
				return false;
			}
			
			// Open if needed
			if (!dev.isOpen()) {
				dev.open();
			}
			dev.getTransmitter().setReceiver(new MidiReceiver(conn));
			// Save for later
			conn.setAttribute("midiIn", dev);

			log.info("Connecting OUT midi device: {}", outDeviceName);
			// Close any existing device
			if (conn.hasAttribute("midiOut")) {
				dev = (MidiDevice) conn.getAttribute("midiOut");
				if (dev.isOpen()) {
					dev.close();
				}
			}
			// Lookup the current device (we need the transmitter here)
			dev = getMidiDevice(outDeviceName, false);
			if (dev == null) {
				log.error("Midi OUT device not found: {}", outDeviceName);
				return false;
			}
			
			// Open if needed
			if (!dev.isOpen()) {
				dev.open();
			}
			// Save for later
			conn.setAttribute("midiOut", dev);
			log.info("It worked!");
			return true;
		} catch (MidiUnavailableException e) {
			log.error("Error connecting to midi devices {}", e);
		} catch (RuntimeException e) {
			log.error("Error connecting to midi devices {}", e);
		}
		log.error("Doh!");
		return false;
	}

	public boolean sendMidiShortMessage(List<Integer> args, Long time) 
		throws InvalidMidiDataException, MidiUnavailableException {
		try {
			System.err.println("Args: " + args);
			MidiDevice dev = getCurrentMidiDevice(true);
			if(dev == null){
				log.error("Midi device is null, call connectToMidi first");
				return false;
			}

			final ShortMessage msg = new ShortMessage();
			switch(args.size()){
				case 1:
					msg.setMessage(args.get(0));
					break;
				case 3:
					msg.setMessage(args.get(0), args.get(1), args.get(2));
					break;
				case 4:
					msg.setMessage(args.get(0), args.get(1), args.get(2), args.get(3));
					break;
				default:
					log.error("Args array must have length 1, 3, or 4");
				return false;
			}

			dev.getReceiver().send(msg, time);}
		catch (Exception e) {
			e.printStackTrace(System.err);
		}
		return true;
	}
	
	public boolean sendMidiShortMessage1(Integer arg0, Long time) 
		throws InvalidMidiDataException, MidiUnavailableException {
		try {
			MidiDevice dev = getCurrentMidiDevice(true);
			if(dev == null){
				log.error("Midi device is null, call connectToMidi first");
				return false;
			}
	
			final ShortMessage msg = new ShortMessage();
			msg.setMessage(arg0);
			dev.getReceiver().send(msg, time);}
		catch (Exception e) {
			e.printStackTrace(System.err);
		}
		return true;
	}
	
	public boolean sendMidiShortMessage3(Integer arg0, Integer arg1, Integer arg2, Long time) 
		throws InvalidMidiDataException, MidiUnavailableException {
		try {
			MidiDevice dev = getCurrentMidiDevice(true);
			if(dev == null){
				log.error("Midi device is null, call connectToMidi first");
				return false;
			}
	
			final ShortMessage msg = new ShortMessage();
			msg.setMessage(arg0, arg1, arg2);
			dev.getReceiver().send(msg, time);}
		catch (Exception e) {
			e.printStackTrace(System.err);
		}
		return true;
	}
	
	public boolean sendMidiShortMessage4(Integer arg0, Integer arg1, Integer arg2, Integer arg3, Long time) 
		throws InvalidMidiDataException, MidiUnavailableException {
		try {
			MidiDevice dev = getCurrentMidiDevice(true);
			if(dev == null){
				log.error("Midi device is null, call connectToMidi first");
				return false;
			}
	
			final ShortMessage msg = new ShortMessage();
			msg.setMessage(arg0, arg1, arg2, arg3);
			//dev.getTransmitter().getReceiver().s
			dev.getReceiver().send(msg, time);}
		catch (Exception e) {
			e.printStackTrace(System.err);
		}
		return true;
	}
	
	private MidiDevice getCurrentMidiDevice(boolean receiver) {
		IServiceCapableConnection conn = (IServiceCapableConnection) Red5.getConnectionLocal();
		String name = receiver ? "midiOut" : "midiIn";
		return (MidiDevice) conn.getAttribute(name);
	}

	/**
     * Return list of Midi IN device names.
     *
     * @return list of names
     */
    public String[] getMidiInDeviceNames() {
		MidiDevice.Info[] info = MidiSystem.getMidiDeviceInfo();
		List<String> names = new ArrayList<String>();
		for (int i = 0; i < info.length; i++) {
			try {
				MidiDevice device = MidiSystem.getMidiDevice(info[i]);
				if (device.getMaxTransmitters() == 0)
					continue;
				
				names.add(info[i].getName());
			} catch (MidiUnavailableException err) {
				log.error("{}", err);
			}
			
		}
		return names.toArray(new String[]{});
	}

    /**
     * Return list of Midi OUT device names.
     * 
     * @return list of names
     */
    public String[] getMidiOutDeviceNames() {
		MidiDevice.Info[] info = MidiSystem.getMidiDeviceInfo();
		List<String> names = new ArrayList<String>();
		for (int i = 0; i < info.length; i++) {
			try {
				MidiDevice device = MidiSystem.getMidiDevice(info[i]);
				if (device.getMaxReceivers() == 0)
					continue;
				
				names.add(info[i].getName());
			} catch (MidiUnavailableException err) {
				log.error("{}", err);
			}
			
		}
		return names.toArray(new String[]{});
    }
    
	public static MidiDevice getMidiDevice(String name, boolean receiver) {

		MidiDevice.Info[] info = MidiSystem.getMidiDeviceInfo();

		for (Info element : info) {
			if (element.getName().equals(name)) {
				try {
					MidiDevice device = MidiSystem.getMidiDevice(element);
					if (receiver && device.getMaxReceivers() == 0)
						continue;
					
					/*if(!device.isOpen()){
						log.info("Opening device");
						device.open();
					}*/
					return device;
				} catch (MidiUnavailableException e) {
					log.error("{}", e);
				}
			}
		}

		return null;

	}

	public class MidiReceiver extends Object implements Receiver {

		protected IServiceCapableConnection conn;

		public MidiReceiver(IServiceCapableConnection conn) {
			this.conn = conn;
		}

		/** {@inheritDoc} */
        public void send(MidiMessage midi, long time) {

			byte[] msg = midi.getMessage();
			int len = midi.getLength();
			if (len <= 1) {
				return;
			}

			conn.invoke("midi", new Object[] { time, msg });

			/*
			 String out = "Midi >> Status: "+msg[0]+" Data: [";
			 for(int i=1; i<len; i++){
			 out += msg[i] + ((i==len-1) ? "" : ','); 
			 }
			 out += ']';
			 
			 log.debug(out);
			 */
		}

		/** {@inheritDoc} */
        public void close() {
			log.debug("Midi device closed");
		}

	}
	
}
