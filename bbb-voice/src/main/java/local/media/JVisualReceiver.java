package local.media;


import javax.media.*;
import javax.media.format.*;

import java.awt.*;
import javax.swing.*;
import java.awt.event.*;
import java.util.Vector;
import javax.swing.border.Border;



/** JVisualReceiver is a JMF-based graphical media receiver.
  */
public class JVisualReceiver extends Frame implements JMediaReceiverListener
{

   JMediaReceiver receiver;

   // GUI attributes
   Panel panel = new Panel();
   Image icon=Toolkit.getDefaultToolkit().getImage("media/media/icon.gif");
   Image image=Toolkit.getDefaultToolkit().getImage("media/media/logo.gif");

   Component visualComp=null, controlComp=null;

   /** Constructs a VisualReceiver */
   public JVisualReceiver(String media_type, int port)
   {
      receiver=new JMediaReceiver(media_type,port,this);
      try
      { jbInit();
      }
      catch(Exception e) { e.printStackTrace(); }
   }


   public String start()
   {
      return receiver.start();
   }


   public String stop()
   {
      return receiver.stop();
   }


   private void jbInit() throws Exception
   {
      this.setTitle("Zoolu Player");
      this.setIconImage(icon);
      this.addWindowListener(new java.awt.event.WindowAdapter()
      {  public void windowClosing(WindowEvent e) { this_windowClosing(); }
      });
      visualComp=new ImagePanel(image);
      panel.setLayout(new BorderLayout());
      panel.add(visualComp,BorderLayout.CENTER);
      this.add(panel);

      this.setSize(new Dimension(150, 150));
      Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
      Dimension frameSize = this.getSize();
      if (frameSize.height > screenSize.height)
      frameSize.height = screenSize.height;
      if (frameSize.width > screenSize.width)
      frameSize.width = screenSize.width;
      this.setLocation((screenSize.width - frameSize.width) / 2, (screenSize.height - frameSize.height) / 2);
      this.setVisible(true);
   }

   public synchronized void controllerUpdate(ControllerEvent event)
   {  //System.out.println("DEBUG: controllerUpdate()");
      if (event instanceof RealizeCompleteEvent || event instanceof FormatChangeEvent)
      {  if (event instanceof RealizeCompleteEvent) System.out.println("RealizeComplete event");
         if (event instanceof FormatChangeEvent) System.out.println("FormatChange event");

         if ((visualComp = receiver.getVisualComponent()) != null) panel.add("Center", visualComp);
         if ((controlComp = receiver.getControlPanelComponent()) != null) panel.add("South", controlComp);
         this.setVisible(true);
         return;
      }
      else
      {  //System.out.println("Event: "+event.toString()+": Do nothing");
      }
   }

   // ******************************* MAIN *******************************

   public static void main(String[] args)
   {
      if (args.length>=2)
      try
      {  int port=Integer.parseInt(args[1]);
         JVisualReceiver tv = new JVisualReceiver(args[0],port);
         tv.start();
         return;
      }
      catch (Exception e) { System.out.println("Error creating the receiver"); }

      System.out.println("usage:\n  java JVisualReceiver audio|video <local_port>");
   }

   void this_windowClosing()
   {  if (receiver!=null) receiver.stop();
      System.exit(0);
   }

}


  // ********************************************************************
  // ************************* class ImagePanel *************************
  // ********************************************************************

class ImagePanel extends JPanel
{  Image image;

   public ImagePanel(Image image) { this.image = image; }

   public void paintComponent(Graphics g)
   {  super.paintComponent(g); //paint background
      int x=this.getWidth();
      int y=this.getHeight();
      g.drawImage(image,0,0,x,y,this); //draw the image scaled
   }
}

