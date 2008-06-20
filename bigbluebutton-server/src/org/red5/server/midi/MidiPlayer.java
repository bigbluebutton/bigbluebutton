package org.red5.server.midi;

import java.io.File;
import java.io.IOException;

import javax.sound.midi.InvalidMidiDataException;
import javax.sound.midi.MidiSystem;
import javax.sound.midi.MidiUnavailableException;
import javax.sound.midi.Sequencer;

// TODO: Auto-generated Javadoc
/**
 * Plays a midi file provided on command line.
 */
public class MidiPlayer {

	/**
	 * The main method.
	 * 
	 * @param args the arguments
	 */
	public static void main(String args[]) {
		// Argument check
		if (args.length == 0) {
			helpAndExit();
		}
		String file = args[0];
		if (!file.endsWith(".mid")) {
			helpAndExit();
		}
		File midiFile = new File(file);
		if (!midiFile.exists() || midiFile.isDirectory() || !midiFile.canRead()) {
			helpAndExit();
		}
	}

	/**
	 * Instantiates a new midi player.
	 * 
	 * @param midiFile the midi file
	 */
	public MidiPlayer(File midiFile) {

		// Play once
		try {
			Sequencer sequencer = MidiSystem.getSequencer();
			sequencer.setSequence(MidiSystem.getSequence(midiFile));
			sequencer.open();
			sequencer.start();
			/*
			 while(true) {
			 if(sequencer.isRunning()) {
			 try {
			 Thread.sleep(1000); // Check every second
			 } catch(InterruptedException ignore) {
			 break;
			 }
			 } else {
			 break;
			 }
			 }
			 // Close the MidiDevice & free resources
			 sequencer.stop();
			 sequencer.close();
			 */
		} catch (MidiUnavailableException mue) {
			System.out.println("Midi device unavailable!");
		} catch (InvalidMidiDataException imde) {
			System.out.println("Invalid Midi data!");
		} catch (IOException ioe) {
			System.out.println("I/O Error!");
		}

	}

	/**
	 * Provides help message and exits the program.
	 */
	private static void helpAndExit() {
		System.out.println("Usage: java MidiPlayer midifile.mid");
		//System.exit(1);
	}
}
