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



/** SIP Header Allert-Info */
public class AlertInfoHeader extends ParametricHeader
{
   public AlertInfoHeader(String absolute_uri)
   {  super(SipHeaders.Alert_Info,null);
      setAbsoluteURI(absolute_uri);
   }

   public AlertInfoHeader(Header hd)
   {  super(hd);
   }

   /** Gets the absoluteURI */
   public String getAbsoluteURI()
   {  int begin=value.indexOf("<");
      int end=value.indexOf(">");
      if (begin<0) begin=0; else begin++; 
      if (end<0) end=value.length(); 
      return value.substring(begin,end);
   }

   /** Sets the absoluteURI */
   public void setAbsoluteURI(String absolute_uri)
   {  absolute_uri=absolute_uri.trim();
      if (absolute_uri.indexOf("<")<0) absolute_uri="<"+absolute_uri;
      if (absolute_uri.indexOf(">")<0) absolute_uri=absolute_uri+">";
      value=absolute_uri;
   }
}
