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
import org.zoolu.sip.provider.SipParser;
import org.zoolu.tools.Parser;
import org.zoolu.tools.DateFormat;
import java.util.Date;
//import java.text.DateFormat;
//import java.text.SimpleDateFormat;


/** SIP Header Contact.
  * The Contact header field provides a SIP or SIPS URI that can be used
  * to contact that specific instance of the UA for subsequent requests.
  * The Contact header field MUST be present and contain exactly one SIP
  * URI in any request that can result in the establishment of a
  * dialog (i.e. INVITEs).
  * <p> Note: for backward compatibility with legacy implementations
  * the date format in 'expires' parameter is still supported
  * although it has been deprecated in RFC 3261.
  */
public class ContactHeader extends EndPointHeader
{
   /** Creates a ContactHeader with '*' as contact value */
   public ContactHeader()
   {  super(new Header(SipHeaders.Contact,null));
      value="*";
   }

   public ContactHeader(NameAddress nameaddr)
   {  super(SipHeaders.Contact,nameaddr);
   }

   public ContactHeader(SipURL url)
   {  super(SipHeaders.Contact,url);
   }

   public ContactHeader(Header hd)
   {  super(hd);
   }
   
   //public void setStar()
   //{  value="*";
   //}

   public ContactHeader setExpires(Date expire)
   {  setParameter("expires","\""+DateFormat.formatEEEddMMM(expire)+"\"");
      return this;
   }

   public ContactHeader setExpires(int secs)
   {  setParameter("expires",Integer.toString(secs));
      return this;
   }

   public boolean isStar()
   {  if (value.indexOf('*')>=0) return true;
      else return false;
   }
   
   public boolean hasExpires()
   {  return hasParameter("expires");
   }

   public boolean isExpired()
   {  if (getExpires()==0) return true;
      else return false;
   }

   public int getExpires()
   {  int secs=-1;
      String exp_param=getParameter("expires");
      if (exp_param!=null)
      {  if (exp_param.indexOf("GMT")>=0)
         {  Date date=(new SipParser((new Parser(exp_param)).getStringUnquoted())).getDate();
            secs=(int)((date.getTime()-System.currentTimeMillis())/1000);
            if (secs<0) secs=0;
         }
         else secs=(new SipParser(exp_param)).getInt();
      }
      return secs;
   }

   public Date getExpiresDate()
   {  Date date=null;
      String exp_param=getParameter("expires");
      if (exp_param!=null) 
      {  if (exp_param.indexOf("GMT")>=0)
         {  date=(new SipParser((new Parser(exp_param)).getStringUnquoted())).getDate();
         }
         else
         {  long secs=(new SipParser(exp_param)).getInt();
            if (secs>=0) date=new Date(System.currentTimeMillis()+secs*1000);
         }
      }
      return date;
   }
   
   public ContactHeader removeExpires()
   {  removeParameter("expires");
      return this;
   }
/*   
   public static String toString(Vector clist)
   {  String str="Contact: "; 
      for (int i=0; i<clist.size(); i++)
      {  ContactHeader ch=(ContactHeader)(clist.elementAt(i));
         str+=ch;
         if (i<(clist.size()-1)) str+=", ";
      }
      return str+"\r\n";   
   }   
*/
}
