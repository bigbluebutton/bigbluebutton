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


import org.zoolu.sip.provider.SipParser;
import org.zoolu.tools.Parser;
import java.util.Date;


/** SIP Header Expires.
  * <p> Note: for backward compatibility with legacy implementations
  * the date format is still supported
  * although it has been deprecated in RFC 3261.
  */
public class ExpiresHeader extends SipDateHeader
{
   //public ExpiresHeader()
   //{  super(SipHeaders.Expires);
   //}

   public ExpiresHeader(String hvalue)
   {  super(SipHeaders.Expires,hvalue);
   }

   /** Creates a new ExpiresHeader based on a Date value. */
   public ExpiresHeader(Date date)
   {  super(SipHeaders.Expires,date);
   }
   
   /** Creates a new ExpiresHeader with delta-seconds as value. */
   public ExpiresHeader(int seconds)
   {  super(SipHeaders.Expires,(String)null);
      value=String.valueOf(seconds);
   }


   public ExpiresHeader(Header hd)
   {  super(hd);
   }

   /** Gets boolean value to indicate if expiry value of ExpiresHeader is in date format. */
   public boolean isDate()
   {  if (value.indexOf("GMT")>=0) return true;
      return false;
   }
   
   /** Gets value of ExpiresHeader as delta-seconds */
   public int getDeltaSeconds()
   {  int secs=-1;
      if (isDate())
      {  Date date=(new SipParser((new Parser(value)).getStringUnquoted())).getDate();
         secs=(int)((date.getTime()-System.currentTimeMillis())/1000);
         if (secs<0) secs=0;
      }
      else secs=(new SipParser(value)).getInt();

      return secs;
   }

   /** Gets value of ExpiresHeader as absolute date */
   public Date getDate()
   {  Date date=null;
      if (isDate())
      {  date=(new SipParser((new Parser(value)).getStringUnquoted())).getDate();
      }
      else
      {  long secs=getDeltaSeconds();
         if (secs>=0) date=new Date(System.currentTimeMillis()+secs*1000);
      }
      return date;
   }

   /** Sets expires of ExpiresHeader as delta-seconds */
   //public void setDeltaSeconds(long seconds)
   //{  value=String.valueOf(seconds);
   //}
   
   /** Gets value of ExpiresHeader */  
   /*
   public static void getExpires(ExpiresHeader eh)
   {
      if (eh.isDate()) eh.getDate();
      else eh.getDeltaSeconds();
   }
   */
}

