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

package org.zoolu.sip.header;


import org.zoolu.sip.address.*;


/** SIP Request-line, i.e. the first line of a request message
  * <BR> The initial Request-URI of the message SHOULD be set to the value of
  * the URI in the To field.
  */
public class RequestLine
{
   protected String method;
   protected SipURL url;

   /** Construct RequestLine <i>request</i> with <i>sipurl</i> as recipient */
   public RequestLine(String request, String sipUrl)
   {  method=request;
      url=new SipURL(sipUrl);
   }

   public RequestLine(String request, SipURL sipUrl)
   {  method=request;
      url=sipUrl;
   }

   /** Create a new copy of the RequestLine*/
   public Object clone()
   {  return new RequestLine(getMethod(),getAddress());
   }

   /** Indicates whether some other Object is "equal to" this RequestLine */
   public boolean equals(Object obj)
   {  //if (o.getClass().getSuperclass()!=this.getClass().getSuperclass()) return false;
      try
      {  RequestLine r=(RequestLine)obj; 
         if (r.getMethod().equals(this.getMethod()) && r.getAddress().equals(this.getAddress())) return true;
         else return false;
      }
      catch (Exception e) {  return false;  }
   }

   public String toString()
   {  return method+" "+url+" SIP/2.0\r\n";
   }

   public String getMethod()
   {  return method;
   }

   public SipURL getAddress()
   {  return url;
   }
}
