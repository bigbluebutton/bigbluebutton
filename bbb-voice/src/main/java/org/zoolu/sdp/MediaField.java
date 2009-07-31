/*
 * Copyright (C) 2005 Luca Veltri - University of Parma - Italy
 * 
 * This file is part of MjSip (http://www.mjsip.org)
 * 
 * MjSip is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * MjSip is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with MjSip; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 * Author(s):
 * Luca Veltri (luca.veltri@unipr.it)
 */

package org.zoolu.sdp;


import org.zoolu.tools.Parser;
import java.util.Vector;


/** SDP media field.
  * <p>
  * <BLOCKQUOTE><PRE>
  *      media-field = "m=" media SP port ["/" integer] SP proto 1*(SP fmt) CRLF
  * </PRE></BLOCKQUOTE>
  */
public class MediaField extends SdpField
{  
   /** Creates a new MediaField. */
   public MediaField(String media_field)
   {  super('m',media_field);
   }

   /** Creates a new MediaField. */
   public MediaField(String media, int port, int num, String transport, String formats)
   {  super('m',null);
      value=media+" "+port;
      if (num>0) value+="/"+num;
      value+=" "+transport+" "+formats;
   }

   /** Creates a new MediaField.
     * @param formatlist a Vector of media formats (properly a Vector of Strings) */
   public MediaField(String media, int port, int num, String transport, Vector formatlist)
   {  super('m',null);
      value=media+" "+port;
      if (num>0) value+="/"+num;
      value+=" "+transport;
      for (int i=0; i<formatlist.size(); i++) value+=" "+formatlist.elementAt(i);
   }

   /** Creates a new SdpField. */
   public MediaField(SdpField sf)
   {  super(sf);
   }
         
   /** Gets the media type. */
   public String getMedia()
   {  return new Parser(value).getString();
   }  

   /** Gets the media port. */
   public int getPort()
   {  String port=(new Parser(value)).skipString().getString();
      int i=port.indexOf('/');
      if (i<0) return Integer.parseInt(port); else return Integer.parseInt(port.substring(0,i));
   }  

   /** Gets the transport protocol. */
   public String getTransport()
   {  return (new Parser(value)).skipString().skipString().getString();
   }  

   /** Gets the media formats. */
   public String getFormats()
   {  return (new Parser(value)).skipString().skipString().skipString().skipWSP().getRemainingString();
   }  

   /** Gets the media formats as a Vector of String. */
   public Vector getFormatList()
   {  Vector formatlist=new Vector();
      Parser par=new Parser(value);
      par.skipString().skipString().skipString();
      while (par.hasMore())
      {  String fmt=par.getString();
         if (fmt!=null && fmt.length()>0) formatlist.addElement(fmt);
      }
      return formatlist;
   }  

}
