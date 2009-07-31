package local.media;


import java.io.*;

import javax.media.*;
import javax.media.format.*;
import javax.media.protocol.*;
import javax.media.control.TrackControl;

import java.util.Vector;


/** JMediaSender is a JMF-based media sender.
  */
public class JMediaSender
{
   Processor processor=null;
   MediaLocator dest;
   DataSink sink;


   /** Constructs a JMediaSender */
   public JMediaSender(String type, String media, String dest_addr, int dest_port)
   {
      String result;
      
      // #### 1) set the media-locator
      MediaLocator media_locator;
      //try
      {  if (media==null)
         {  if (type.equals("audio")) media_locator=getAudio();
            else media_locator=getVideo();
         }  
         else media_locator=new MediaLocator(media);
      }
      //catch (Exception e) { e.printStackTrace(); }  
      System.out.println("MediaLocator: "+media_locator.toString());
      
      // #### 2) create the processor
      result=createProcessor(media_locator);
      if (result!=null)
      {  System.out.println(result);
         //System.exit(0);
         return;
      }
      //else       
      System.out.println("Processor created");
               
      // #### 3) configure the processor
      processor.configure();
      while(processor.getState()<processor.Configured)
      {  // wait..
         //synchronized (getStateLock())
         //{  try { getStateLock().wait(); } catch (InterruptedException ie) { return; }
         //}
      }
      System.out.println("Processor configured");
      
      
      // now do step (3a) or step (3b)

      // I decided to do step 3a (only) in case of direct audio or video
      if (media==null)
      //if (false)
      {
      // #### 3a) set the output ContentDescriptor
         processor.setContentDescriptor(new ContentDescriptor(ContentDescriptor.RAW_RTP));
         System.out.println("ContentDescriptor="+processor.getContentDescriptor().getContentType());
      }
      else
      {         
      // #### 3b.1) set the output ContentDescriptor
         processor.setContentDescriptor(new ContentDescriptor(ContentDescriptor.RAW));
         System.out.println("ContentDescriptor="+processor.getContentDescriptor().getContentType());
      
      // #### 3b.2) handle multiple tracks
         TrackControl[] tracks=processor.getTrackControls();
         System.out.println("Number of tracks="+tracks.length);
         boolean enabled=false;   
         for (int i=0; i<tracks.length; i++)
         {  TrackControl track_control=tracks[i];
            Format format=track_control.getFormat();
            System.out.println("track#"+i+" format:"+format.toString());
            if (!enabled)
            {  if (format.toString().indexOf("Stereo")>0 || format.toString().indexOf("Mono")>0)
               {  if (type.equals("audio")) enabled=track_control.setFormat(new AudioFormat(AudioFormat.GSM_RTP))!=null;
                  else enabled=false;
               }
               else
               {  if (type.equals("video")) enabled=track_control.setFormat(new VideoFormat(VideoFormat.H263_RTP))!=null;
                  else enabled=false;
               }
               track_control.setEnabled(enabled);
               System.out.println("track#"+i+" enabled="+enabled);
            }
            else
            {  track_control.setEnabled(false);
               System.out.println("track#"+i+" disabled");
            }
         }
      }      
      
      // #### 4) realize the processor
      processor.realize();
      while(processor.getState()<processor.Realized) ; // wait..
      System.out.println("Processor realized");
        
         
      String media_url="rtp://"+dest_addr+":"+dest_port+"/"+type+"/1";     
      dest=new MediaLocator(media_url);
   } 
 

   /** Starts sending the stream */
   public String start()
   {  
      // #### 5) create and start the DataSink
      try
      {  sink=Manager.createDataSink(processor.getDataOutput(),dest);
      }
      catch (NoDataSinkException e) { e.printStackTrace(); return "Failed creating DataSink"; }
      
      System.out.println("DataSink created");
      System.out.println("Dest= "+sink.getOutputLocator()+" , "+sink.getContentType());

      try
      {  sink.open();
         System.out.println("DataSink opened");      
         sink.start();
      }
      catch (IOException e) { e.printStackTrace(); return "Failed starting DataSink"; } 
          
      processor.start();
      System.out.println("Start sending");
      
      return null;
   }
   
   
   /** Stops the stream */
   public String stop()
   {  
      try
      {  sink.stop();
         sink.close();
      }
      catch (IOException e) { return "Failed closing DataSink"; } 

      System.out.println("Stop sending");
      
      processor.stop();
      processor.deallocate();
      processor.close();
      
      return null;
   }

   /** Creates the processor */
   private String createProcessor(MediaLocator locator)
   {  DataSource datasrc;  
      if (locator==null) return "MediaLocator is null"; 
      
      try
      {  datasrc=Manager.createDataSource(locator);
      }
      catch (Exception e) { e.printStackTrace(); return "Couldn't create DataSource"; }
 
      try
      {  processor=Manager.createProcessor(datasrc);
      }
      catch (NoProcessorException npe) { npe.printStackTrace(); return "Couldn't create processor"; }
      catch (IOException ioe) { ioe.printStackTrace(); return "IOException creating processor"; }
      
      return null;
   }   


   /** Gets the system audio (mic?) */
   private MediaLocator getAudio()
   {  return getMediaDevice(new AudioFormat(AudioFormat.LINEAR, 8000, 8, 1));
   }
  
  
   /** Gets the system video (cam?) */
   private MediaLocator getVideo()
   { 
      return getMediaDevice(null);
   }
 
  
   /** Gets MediaLocator for a system device */
   private MediaLocator getMediaDevice(Format format)
   { 
      if (format!=null) System.out.println("Selected format: "+format.toString());
      else System.out.println("Selected format: any");
      // Get the CaptureDeviceInfo for the live audio or video capture device
      Vector deviceList = CaptureDeviceManager.getDeviceList(format);
      System.out.println("List of devices: "+deviceList.size());
      if (deviceList.size()==0)
      {  System.out.println("No device found");
         return null;
      }
      for (int i=0; i<deviceList.size();i++)
      {  CaptureDeviceInfo di=(CaptureDeviceInfo)deviceList.elementAt(i);
         System.out.println("device "+i+":"+di.getName());
      }
      
      CaptureDeviceInfo di=(CaptureDeviceInfo)deviceList.elementAt(deviceList.size()-1);
      MediaLocator media_locator=di.getLocator();
      //System.out.println("MediaLocator: "+media_locator);
      return media_locator;
   }
  
  
  
  
  // ******************************* MAIN *******************************

   /** The main method. */
   public static void main(String[] args)
   {
      if (args.length<3)
      {
         System.out.println("usage:\n  java JMediaSender audio|video [<media>] <dest_addr> <dest_port>");
         System.out.println("\n    with: <media> = \"file://filename\"");
      }
      else
      {  
         String type=args[0];
         String media=null;
         String addr;
         int port;
         if (args.length>=4)
         {  media=args[1];
            addr=args[2];
            port=Integer.parseInt(args[3]);
         }
         else
         {  addr=args[1];
            port=Integer.parseInt(args[2]);
         }
         
         JMediaSender sender = new JMediaSender(type,media,addr,port);

         String result;
         result=sender.start();
         if (result!=null)
         {  System.out.println("ERROR: "+result); 
            System.exit(0);
         }
         
         System.out.println("Press 'Return' to stop");
         try { System.in.read(); } catch (IOException e) { e.printStackTrace(); }

         result=sender.stop();
         if (result!=null)
         {  System.out.println("ERROR: "+result); 
            System.exit(0);
         }
      }
   }

}