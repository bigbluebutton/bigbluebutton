package org.bigbluebutton.sua.applet;


import java.io.*;
import javax.sound.sampled.*;

public class cSIP_CaptureAudio{

	  AudioFormat audioFormat;
	  TargetDataLine targetDataLine;

	  public void stopCapture(){
		  targetDataLine.stop();
          targetDataLine.close();
	  }
	  //This method captures audio input from a
	  // microphone and saves it in an audio file.
	  public void captureAudio(){
	    try{
	      //Get things set up for capture
	      audioFormat = getAudioFormat();
	      DataLine.Info dataLineInfo =
	                          new DataLine.Info(
	                            TargetDataLine.class,
	                            audioFormat);
	      targetDataLine = (TargetDataLine)
	               AudioSystem.getLine(dataLineInfo);

	      //Create a thread to capture the microphone
	      // data into an audio file and start the
	      // thread running.  It will run until the
	      // Stop button is clicked.  This method
	      // will return after starting the thread.
	      new CaptureThread().start();
	    }catch (Exception e) {
	      e.printStackTrace();
	      System.exit(0);
	    }//end catch
	  }//end captureAudio method

	  //This method creates and returns an
	  // AudioFormat object for a given set of format
	  // parameters.  If these parameters don't work
	  // well for you, try some of the other
	  // allowable parameter values, which are shown
	  // in comments following the declarations.
	  private AudioFormat getAudioFormat(){
	    float sampleRate = 8000.0F;
	    //8000,11025,16000,22050,44100
	    int sampleSizeInBits = 16;
	    //8,16
	    int channels = 1;
	    //1,2
	    boolean signed = true;
	    //true,false
	    boolean bigEndian = false;
	    //true,false
	    return new AudioFormat(sampleRate,
	                           sampleSizeInBits,
	                           channels,
	                           signed,
	                           bigEndian);
	  }//end getAudioFormat
	//=============================================//

	//Inner class to capture data from microphone
	// and write it to an output audio file.
	class CaptureThread extends Thread{
	  public void run(){
	    AudioFileFormat.Type fileType = null;
	    File audioFile = null;

	    //Set the file type and the file extension
	    // based on the selected radio button.
	    fileType = AudioFileFormat.Type.WAVE;
	    audioFile = new File("junk.wav");
	    boolean success ;
	    try{
	    	if ( true == audioFile.exists()){
		    	audioFile.delete() ;
		    	success = audioFile.createNewFile() ;
		    	System.out.print("Create New File " + success) ;
		    }
	    	targetDataLine.open(audioFormat);
	    	targetDataLine.start();
	    	AudioSystem.write(
	            new AudioInputStream(targetDataLine),
	            fileType,
	            audioFile);
	    }catch (Exception e){
	      e.printStackTrace();
	    }//end catch

	  }//end run
	}//end inner class CaptureThread
	//=============================================//

}
