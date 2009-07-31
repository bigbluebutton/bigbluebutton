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
import org.zoolu.tools.DateFormat;
import java.util.Date;
//import java.text.DateFormat;
//import java.text.SimpleDateFormat;


/** SIP Header Date */
public abstract class SipDateHeader extends Header
{
   
   //public SipDateHeader(String hname)
   //{  super(hname);
   //}

   public SipDateHeader(String hname, String hvalue)
   {  super(hname,hvalue);
   }

   public SipDateHeader(String hname, Date date)
   {  super(hname,null);
      //DateFormat df=new SimpleDateFormat("EEE, dd MMM yyyy hh:mm:ss 'GMT'",Locale.US);
      //value=df.format(date);
      value=DateFormat.formatEEEddMMM(date);
   }

   public SipDateHeader(Header hd)
   {  super(hd);
   }

   /** Gets date value of DateHeader */
   public Date getDate()
   {  SipParser par=new SipParser(value);
      return par.getDate();
   }
   
   /** Sets date of DateHeader */
   //public void setDate(Date date)
   //{  DateFormat df=new SimpleDateFormat("EEE, dd MMM yyyy hh:mm:ss 'GMT'",Locale.US);
   //   value=df.format(date);
   //}

   /** Sets date in string format of DateHeader */
   //public void setDate(String date)
   //{  value=date;
   //}
   
}
