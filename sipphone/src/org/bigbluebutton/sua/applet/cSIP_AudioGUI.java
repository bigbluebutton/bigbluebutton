package org.bigbluebutton.sua.applet;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JPanel;


@SuppressWarnings("serial")
public class cSIP_AudioGUI extends JFrame{
	
	final JButton captureBtn = new JButton("Capture");
	final JButton playBtn = new JButton("Play");
	final JPanel btnPanel = new JPanel();
	
	private cSIP_CaptureAudio recordAudio ;
	private cSIP_PlayAudio playAudio ;
	
	private boolean isRecording = false ;
	private boolean isPlaying   = false ;
	
	public cSIP_AudioGUI(){
		captureBtn.setEnabled(true);
	    playBtn.setEnabled(false);
	    
	    captureBtn.addActionListener(
	  	      new ActionListener(){
				public void actionPerformed(
	  	                                  ActionEvent e){
	  	          
	  	          isRecording = ! isRecording ;
	  	          if ( true == isRecording ){
	  	        	  if ( null == recordAudio ){
	  	        		  recordAudio = new cSIP_CaptureAudio();
	  	        	  }
	  	        	  playBtn.setEnabled(false);
	  	        	  captureBtn.setText("Stop");
	  	        	  recordAudio.captureAudio();
	  	          }else{
	  	        	  playBtn.setEnabled(true);
	  	        	  captureBtn.setText("Capture");
	  	        	  recordAudio.stopCapture();
	  	        	  recordAudio = null ;
	  	          }
	  	          //Capture input data from the
	  	          // microphone until the Stop button is
	  	          // clicked.
	  	          
	  	        }//end actionPerformed
	  	      }//end ActionListener
	  	    );//end addActionListener()
	    
	    playBtn.addActionListener(
	  	      new ActionListener(){
	  	        public void actionPerformed(
	  	                                  ActionEvent e){
	  	          isPlaying = ! isPlaying ;
	  	          if ( true == isPlaying ){
	  	        	  if ( null == playAudio ){
	  	        		  playAudio = new cSIP_PlayAudio();
	  	        	  }
	  	        	  captureBtn.setEnabled(false) ;
	  	        	  playBtn.setText("Stop") ;
	  	        	  playAudio.playAudio();//Play the file  
	  	          }else{
	  	        	  captureBtn.setEnabled(true) ;
	  	        	  playBtn.setText("Play");
	  	        	  playAudio.stopAudio();
	  	        	  playAudio = null ;
	  	          }
	  	          
	  	          
	  	        }//end actionPerformed
	  	      }//end ActionListener
	  	    );//end addActionListener()
	    
	    btnPanel.setSize(250,70);
	    btnPanel.add(captureBtn,"West");
	    btnPanel.add(playBtn,"East");
	    
	    getContentPane().add(btnPanel);
	    
	    setTitle("BigBlueButton SIP Phone");
	    //setDefaultCloseOperation(EXIT_ON_CLOSE);
	    setSize(250,100);
	    setVisible(true);
	}
	
	
	
}
