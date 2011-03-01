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


/** SIP Header Content-Type */
public class ContentTypeHeader extends ParametricHeader
{
   //public ContentTypeHeader()
   //{  super(SipHeaders.Content_Type);
   //}

   public ContentTypeHeader(String hvalue)
   {  super(SipHeaders.Content_Type,hvalue);
   }

   public ContentTypeHeader(Header hd)
   {  super(hd);
   }

   /** Gets content-length of ContentLengthHeader */
   public String getContentType()
   {  String str;
      int end=(new SipParser(value)).indexOf(';');
      if (end<0) str=value; else str=value.substring(0,end); 
      return (new SipParser(str)).getString();
   }

   /** Sets content-length of ContentLengthHeader */
   public void setContentType(String cType)
   {  value=cType;
   }

}
