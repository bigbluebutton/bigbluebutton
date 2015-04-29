package local.media;


import javax.media.*;
import javax.media.format.*;
import java.util.Vector;


/** JMediaReceiver is a JMF-based media receiver.
  */
public class JMediaReceiver implements ControllerListener
{
   Player player=null;

   JMediaReceiverListener ctr_listener=null;


   /** Constructs a JMediaReceiver */
   public JMediaReceiver(String media_type, int port, JMediaReceiverListener listener)
   {
      ctr_listener=listener;
      try
      {  String media_url="rtp://:"+port+"/"+media_type;
         System.out.println("Receiver URL= "+media_url);
         MediaLocator media_locator=new MediaLocator(media_url);
         player=Manager.createPlayer(media_locator);
         if (player==null) { System.out.println("Player cannot be created"); return; }
         //else
         
         player.addControllerListener(this);         
      }
      catch(Exception e) { e.printStackTrace(); }
   }
  

   /** Starts receiving the stream */
   public String start()
   {
      String err=null;
      try 
      {  System.out.println("Trying to realize the player");
         player.realize();
         while(player.getState()!=player.Realized);
         System.out.println("Player realized");
         player.start();
      }
      catch (Exception e)
      {  e.printStackTrace();
         err="Failed trying to start the player";
      }
      return err;
   }


   /** Stops the receiver */
   public String stop()
   {
      if (player!=null)
      {  player.stop();
         player.deallocate();
         player.close();
         System.out.println("Player stopped");
         player=null;
      }
      return null;
   }


   public synchronized void controllerUpdate(ControllerEvent event)
   {  if (ctr_listener!=null) ctr_listener.controllerUpdate(event);
   }
   
   public java.awt.Component getVisualComponent()
   {  return player.getVisualComponent();
   }
   
   public java.awt.Component getControlPanelComponent()
   {  return player.getControlPanelComponent();
   }
   
   /*public Player getPlayer()
   {  return player;
   }*/
   
   
  
   // ******************************* MAIN *******************************

   /** The main method. */
   public static void main(String[] args)
   {
      if (args.length>=2)
      try
      {  int port=Integer.parseInt(args[1]);
         JMediaReceiver media_receiver = new JMediaReceiver(args[0],port,null);
         media_receiver.start();
         return;
      }
      catch (Exception e) { System.out.println("Error creating the receiver"); }
      
      System.out.println("usage:\n  java JMediaReceiver audio|video <local_port>");
   }

}


