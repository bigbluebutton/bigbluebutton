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




/** SdpField rapresents a SDP line field.
  * It is formed by a 'type' (char) and a 'value' (String).
  * <p>A SDP line field is of the form &lt;type&gt; = &lt;value&gt;
 */
public class SdpField
{  char type;
   String value;
   
   /** Creates a new SdpField.
     * @param s_type the field type
     * @param s_value the field value */
   public SdpField(char s_type, String s_value)
   {  type=s_type;
      value=s_value;
   }

   /** Creates a new SdpField.
     * @param sf the SdpField clone */
   public SdpField(SdpField sf)
   {  type=sf.type;
      value=sf.value;
   }

   /** Creates a new SdpField based on a SDP line of the form <type>=<value>.
     * The SDP value terminats with the end of the String or with the first CR or LF char.
     * @param str the &lt;type&gt; = &lt;value&gt; line */
   public SdpField(String str)
   {  SdpParser par=new SdpParser(str);
      SdpField sf=par.parseSdpField();
      type=sf.type;
      value=sf.value;
   }
  
   /** Creates and returns a copy of the SdpField.
     * @return a SdpField clone */
   public Object clone()
   {  return new SdpField(this);
   }

   /** Whether the SdpField is equal to Object <i>obj</i>
     * @return true if equal */
   public boolean equals(Object obj)
   {  try
      {  SdpField sf=(SdpField)obj;
         if (type!=sf.type) return false;
         if (value!=sf.value) return false;
         return true;
      }
      catch (Exception e) {  return false;  }
   } 
      
   /** Gets the type of field
     * @return the field type */
   public char getType()
   {  return type;
   }
   
   /** Gets the value
     * @return the field value */
   public String getValue()
   {  return value;
   }
   
   /** Gets string representation of the SdpField
     * @return the string representation */
   public String toString()
   {  return type+"="+value+"\r\n";
   }

}
