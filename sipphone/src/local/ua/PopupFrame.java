package local.ua;



import java.awt.*;
import java.awt.event.*;
import javax.swing.*;



/** Popup frame
 */
public class PopupFrame extends Frame
{
   String title;
   Frame caller;

   Button button1 = new Button();

   //Label label1 = new Label();
   Label label1=null;

   //Panel panel1 = new Panel();
   Panel panel1=null;


   public PopupFrame(String frame_title, String text, Color bkgrd_color, Frame caller_frame)
   {  title=frame_title;
      caller=caller_frame;
      if (caller!=null) caller.setEnabled(false);

      panel1=null;
      label1=new Label(text);
      label1.setFont(new java.awt.Font("Monospaced", 0, 12));
      label1.setAlignment(1);
      label1.setBackground(bkgrd_color);

      try
      {  jbInit();
      }
      catch(Exception e)
      {  e.printStackTrace();
      }
   }

   public PopupFrame(String frame_title, Image image, Frame caller_frame)
   {  title=frame_title;
      caller=caller_frame;
      if (caller!=null) caller.setEnabled(false);

      panel1=new ImagePanel(image);
      label1=null;

      try
      {  jbInit();
      }
      catch(Exception e)
      {  e.printStackTrace();
      }
   }


   private void jbInit() throws Exception
   {  this.setTitle(title);
      this.setResizable(false);
      this.addWindowListener(new java.awt.event.WindowAdapter()
      {  public void windowClosing(WindowEvent e) { closeWindow(); }
      });
      button1.setLabel("OK");
      button1.addActionListener(new java.awt.event.ActionListener()
      { public void actionPerformed(ActionEvent e) { closeWindow(); }
      });
      this.add(button1, BorderLayout.SOUTH);

      if (label1!=null) this.add(label1, BorderLayout.CENTER);
      else
      if (panel1!=null) this.add(panel1, BorderLayout.CENTER);

      this.setSize(200,150);
      Point point=caller.getLocationOnScreen();
      Dimension callerSize=caller.getSize();
      Dimension frameSize=this.getSize();
      this.setLocation((callerSize.width - frameSize.width) / 2 + point.x, (callerSize.height - frameSize.height) / 2 + + point.y);
      this.setVisible(true);
   }

   void closeWindow()
   {  if (caller!=null) caller.setEnabled(true);
      this.dispose();
   }

   void this_keyTyped(KeyEvent e)
   {

   }
}
