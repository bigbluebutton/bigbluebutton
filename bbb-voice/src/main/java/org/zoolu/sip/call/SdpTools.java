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

package org.zoolu.sip.call;


import org.zoolu.sdp.*;
import java.util.Enumeration;
import java.util.Vector;


/** Class SdpTools collects some static methods for managing SDP materials.
  */
public class SdpTools
{
   /** Costructs a new SessionDescriptor from a given SessionDescriptor
     * with olny media types and attribute values specified by a MediaDescriptor Vector.
     * <p> If no attribute is specified for a particular media, all present attributes are kept.
     * <br>If no attribute is present for a selected media, the media is kept (regardless any sepcified attributes).
     * @param sdp the given SessionDescriptor
     * @param m_descs Vector of MediaDescriptor with the selecting media types and attributes
     * @return this SessionDescriptor */
   public static SessionDescriptor sdpMediaProduct(SessionDescriptor sdp, Vector m_descs)
   {  Vector new_media=new Vector();
      if (m_descs!=null)
      {  for (Enumeration e=m_descs.elements(); e.hasMoreElements(); )
         {  MediaDescriptor spec_md=(MediaDescriptor)e.nextElement();
            //System.out.print("DEBUG: SDP: sdp_select: "+spec_md.toString());
            MediaDescriptor prev_md=sdp.getMediaDescriptor(spec_md.getMedia().getMedia());
            //System.out.print("DEBUG: SDP: sdp_origin: "+prev_md.toString());
            if (prev_md!=null)
            {  Vector spec_attributes=spec_md.getAttributes();
               Vector prev_attributes=prev_md.getAttributes();
               if (spec_attributes.size()==0 || prev_attributes.size()==0)
               {  new_media.addElement(prev_md);
               }
               else
               {  Vector new_attributes=new Vector();
                  for (Enumeration i=spec_attributes.elements(); i.hasMoreElements(); )
                  {  AttributeField spec_attr=(AttributeField)i.nextElement();
                     String spec_name=spec_attr.getAttributeName();
                     String spec_value=spec_attr.getAttributeValue();
                     for (Enumeration k=prev_attributes.elements(); k.hasMoreElements(); )
                     {  AttributeField prev_attr=(AttributeField)k.nextElement();
                        String prev_name=prev_attr.getAttributeName();
                        String prev_value=prev_attr.getAttributeValue();
                        if (prev_name.equals(spec_name) && prev_value.equalsIgnoreCase(spec_value))
                        {  new_attributes.addElement(prev_attr);
                           break;
                        }
                     }
                  }
                  if (new_attributes.size()>0) new_media.addElement(new MediaDescriptor(prev_md.getMedia(),prev_md.getConnection(),new_attributes));
               }
            }
         }
      }
      SessionDescriptor new_sdp=new SessionDescriptor(sdp);
      new_sdp.removeMediaDescriptors();
      new_sdp.addMediaDescriptors(new_media);
      return new_sdp;
   }
   
   /** Costructs a new SessionDescriptor from a given SessionDescriptor
     * with olny the first specified media attribute.
   /** Keeps only the fisrt attribute of the specified type for each media.
     * <p> If no attribute is present for a media, the media is dropped.
     * @param sdp the given SessionDescriptor
     * @param a_name the attribute name
     * @return this SessionDescriptor */
   public static SessionDescriptor sdpAttirbuteSelection(SessionDescriptor sdp, String a_name)
   {  Vector new_media=new Vector();
      for (Enumeration e=sdp.getMediaDescriptors().elements(); e.hasMoreElements(); )
      {  MediaDescriptor md=(MediaDescriptor)e.nextElement();
         AttributeField attr=md.getAttribute(a_name);
         if (attr!=null)
         { new_media.addElement(new MediaDescriptor(md.getMedia(),md.getConnection(),attr));
         }
      }
      SessionDescriptor new_sdp=new SessionDescriptor(sdp);
      new_sdp.removeMediaDescriptors();
      new_sdp.addMediaDescriptors(new_media);
      return new_sdp;
   }

}
