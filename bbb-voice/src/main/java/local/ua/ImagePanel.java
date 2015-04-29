package local.ua;



import java.awt.Panel;
import java.awt.Image;
import java.awt.Graphics;
import java.awt.Color;



/** A Panel with a backgroung image
 */
public class ImagePanel extends Panel
{
   Image image=null;

   public ImagePanel(Image image)
   {  this.image=image;
      try
      { jbInit();
      }
      catch(Exception e)
      {  e.printStackTrace();
      }
   }

   private void jbInit() throws Exception
   {  this.setBackground(Color.black);
   }

   public void paint(Graphics g)
   {  //System.out.print("*");
      if (image!=null)
      {  int width=this.getSize().width;
         int height=this.getSize().height;
         double ratio=(double)width/height;

         if (image!=null && image.getWidth(null)>0)
         {  // resized image
            Image aux=image.getScaledInstance(width,height,Image.SCALE_FAST);
            // wait for image loading..
            int attempts=4;
            while( (attempts--)>0 && aux.getWidth(null)<0) try { Thread.sleep(80); } catch (Exception e) {}

            /*
            double x=width/2;
            double y=height/2;
            int dx=aux.getWidth(null)/2;
            int dy=aux.getHeight(null)/2;
            g.drawImage(aux,(int)(x-dx),(int)(y-dy),null);
            */
            g.drawImage(aux,0,0,null);
         }
      }
      else
      {  g.setColor(Color.red);
         g.fillRect(0,0,this.getSize().width,this.getSize().height);
      }
   }
}
