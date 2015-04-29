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


import java.util.Vector;
//PersonalJava
//import java.util.HashSet;
//import java.util.Iterator;


/** Class SessionDescriptor handles SIP message bodys formatted according to
  * the Session Description Protocol (SDP).
  * <p> A session description consists of a session-level description
  * (details that apply to the whole session and all media streams) and
  * zero or more media-level descriptions (details that apply onto
  * to a single media stream).
  * <p> The session-level part starts with a
  * `v=' line and continues to the first media-level section.  The media
  * description starts with an `m=' line and continues to the next media
  * description or end of the whole session description.  In general,
  * session-level values are the default for all media unless overridden
  * by an equivalent media-level value.
  * <p> In the current implementation, the session-level description consists
  * of the v, o, s, c, and t SDP fields (lines).
  */
public class SessionDescriptor
{
   /** Version filed. */
   SdpField v;
   /** Origin filed. */
   OriginField o;
   /** Session-name filed. */
   SessionNameField s;
   /** Connection filed. */
   ConnectionField c;
   /** Time filed. */
   TimeField t;
   
   /** Vector of session attributes (as Vector of SdpFields). */
   Vector<AttributeField> av;

   /** Vector of MediaDescriptors. */
   Vector<MediaDescriptor> media;
      
   /*private void init(String owner, String session, String connection, String time)
   {  v=new SdpField('v',"0");
      o=new SdpField('o',owner);
      s=new SdpField('s',session);
      c=new SdpField('c',connection);
      t=new SdpField('t',time);
      media=new HashSet();
   }*/

   /** Inits the SessionDescriptor. */
   private void init(OriginField origin, SessionNameField session, ConnectionField connection, TimeField time)
   {  v=new SdpField('v',"0");
      o=origin;
      s=session;
      c=connection;
      t=time;
      av=new Vector<AttributeField>();
      media=new Vector<MediaDescriptor>();
   }

   /** Creates a new SessionDescriptor.
     * @param sd the SessionDescriptor clone */
   public SessionDescriptor(SessionDescriptor sd)
   {  init(new OriginField(sd.o),new SessionNameField(sd.s),new ConnectionField(sd.c),new TimeField(sd.t));
      for (int i=0; i<sd.media.size(); i++) media.addElement(new MediaDescriptor((MediaDescriptor)sd.media.elementAt(i)));
   }

   /** Creates a new SessionDescriptor specifing o, s, c, and t fields.
     * @param origin the OriginField
     * @param session the SessionNameField
     * @param connection the ConnectionField
     * @param time the TimeField */
   public SessionDescriptor(OriginField origin, SessionNameField session, ConnectionField connection, TimeField time)
   {  init(origin,session,connection,time);
   }

   /** Creates a new SessionDescriptor specifing o, s, c, and t fields.
     * @param origin the origin value
     * @param session the session value
     * @param connection the connection value
     * @param time the time value */
   public SessionDescriptor(String origin, String session, String connection, String time)
   {  init(new OriginField(origin),new SessionNameField(session),new ConnectionField(connection),new TimeField(time));
   }

   /** Creates a new SessionDescriptor.
     * <p> with:
     * <br>o=<i>owner</i>
     * <br>s=Session SIP/SDP
     * <br>c=IP4 <i>address</i>
     * <br>t=0 0
     * <p> if <i>address</i>==null, '127.0.0.1' is used
     * <br>if <i>owner</i>==null, 'user@'<i>address</i> is used
     * @param owner the owner
     * @param address the IPv4 address */
   public SessionDescriptor(String owner, String address)
   {  if (address==null) address="127.0.0.1";
      if (owner==null) owner="user@"+address;
      init(new OriginField(owner,"0","0",address),new SessionNameField("Session SIP/SDP"),new ConnectionField("IP4",address),new TimeField());
   }
   
   /** Creates a default SessionDescriptor.
     * <p> o=user@127.0.0.1
     *     s=Session SIP/SDP
     *     c=127.0.0.1
     *     t=0 0 */
   public SessionDescriptor()
   {  String address="127.0.0.1";
      String owner="user@"+address;
      init(new OriginField(owner,"0","0",address),new SessionNameField("Session SIP/SDP"),new ConnectionField("IP4",address),new TimeField());
   }

   /** Creates a new SessionDescriptor from String <i>sdp</i>
     * @param sdp the entire SDP */
   public SessionDescriptor(String sdp)
   {  SdpParser par=new SdpParser(sdp);
      // parse mandatory fields
      v=par.parseSdpField('v');
      if (v==null) v=new SdpField('v',"0");
      o=par.parseOriginField();
      if (o==null) o=new OriginField("unknown");
      s=par.parseSessionNameField();
      if (s==null) s=new SessionNameField();
      c=par.parseConnectionField();
      if (c==null) c=new ConnectionField("IP4","0.0.0.0");
      t=par.parseTimeField();
      if (t==null) t=new TimeField();
      while (par.hasMore() && (!par.startsWith("a=") && !par.startsWith("m=")))
      {  // skip unknown lines..
         par.goToNextLine();
      } 
      // parse session attributes
      av=new Vector<AttributeField>();
      while (par.hasMore() && par.startsWith("a="))
      {  AttributeField attribute=par.parseAttributeField();
         av.addElement(attribute);
      }    
      // parse media descriptors
      media=new Vector<MediaDescriptor>();
      MediaDescriptor md;
      while ((md=par.parseMediaDescriptor())!=null)
      {  addMediaDescriptor(md);
      }
   } 
   
   /** Sets the origin 'o' field.
     * @param origin the OriginField
     * @return this SessionDescriptor */
   public SessionDescriptor setOrigin(OriginField origin)
   {  o=origin;
      return this;
   }

   /** Gets the origin 'o' field */
   public OriginField getOrigin()
   {  //System.out.println("DEBUG: inside SessionDescriptor.getOwner(): sdp=\n"+toString());
      return o;
   }
 
   /** Sets the session-name 's' field. 
     * @param session the SessionNameField
     * @return this SessionDescriptor */
   public SessionDescriptor setSessionName(SessionNameField session)
   {  s=session;
      return this;
   }

   /** Gets the session-name 's' field */
   public SessionNameField getSessionName()
   {  return s;
   }

   /** Sets the connection-information 'c' field.
     * @param connection the ConnectionField
     * @return this SessionDescriptor */
   public SessionDescriptor setConnection(ConnectionField connection)
   {  c=connection;
      return this;
   }

   /** Gets the connection-information 'c' field */
   public ConnectionField getConnection()
   {  return c;
   }

   /** Sets the time 't' field.
     * @param time the TimeField
     * @return this SessionDescriptor */
   public SessionDescriptor setTime(TimeField time)
   {  t=time;
      return this;
   }

   /** Gets the time 't' field */
   public TimeField getTime()
   {  return t;
   }
  
   /** Adds a new attribute for a particular media
     * @param media the MediaField
     * @param attribute an AttributeField 
     * @return this SessionDescriptor */
   public SessionDescriptor addMedia(MediaField media, AttributeField attribute)
   {  //printlog("DEBUG: media: "+media,5);
      //printlog("DEBUG: attribute: "+attribute,5);
      addMediaDescriptor(new MediaDescriptor(media,null,attribute));
      return this;
   }
   
   /** Adds a new media.
     * @param media the MediaField
     * @param attributes Vector of AttributeField
     * @return this SessionDescriptor */
   public SessionDescriptor addMedia(MediaField media, Vector attributes)
   {  //printlog("DEBUG: media: "+media,5);
      //printlog("DEBUG: attribute: "+attributes,5);
      addMediaDescriptor(new MediaDescriptor(media,null,attributes));
      return this;
   }

   /** Adds a new MediaDescriptor
     * @param media_desc a MediaDescriptor
     * @return this SessionDescriptor */
   public SessionDescriptor addMediaDescriptor(MediaDescriptor media_desc)
   {  //printlog("DEBUG: media desc: "+media_desc,5);
      media.addElement(media_desc);
      return this;
   }

   /** Adds a Vector of MediaDescriptors
     * @param media_descs Vector if MediaDescriptor 
     * @return this SessionDescriptor */
   public SessionDescriptor addMediaDescriptors(Vector<MediaDescriptor> media_descs)
   {  //media.addAll(media_descs); // not supported by J2ME..
      for (int i=0; i<media_descs.size(); i++) media.addElement(media_descs.elementAt(i));
      return this;
   }

   /** Gets all MediaDescriptors */
   public Vector getMediaDescriptors()
   {  return media;
   }

   /** Removes all MediaDescriptors */
   public SessionDescriptor removeMediaDescriptor(String media_type)
   {  for (int i=media.size()-1; i>=0; i--)
         if (((MediaDescriptor)media.elementAt(i)).getMedia().getMedia().equals(media_type)) media.removeElementAt(i);
      return this;
   }

   /** Removes all MediaDescriptors */
   public SessionDescriptor removeMediaDescriptors()
   {  //media.clear(); // not supported by J2ME..
      media.setSize(0);
      return this;
   }
   
   /** Gets the first MediaDescriptor of a particular media.
     * @param media_type the media type
     * @return the MediaDescriptor */
   public MediaDescriptor getMediaDescriptor(String media_type)
   {  for (int i=0; i<media.size(); i++)
      {  MediaDescriptor md=(MediaDescriptor)media.elementAt(i);
         if (md.getMedia().getMedia().equals(media_type)) return md; 
      }
      return null;
   }


   /** Adds a Vector of session attributes.
     * @param attribute_fields Vector of AttributeFields
     * @return this SessionDescriptor */
   public SessionDescriptor addAttributes(Vector attribute_fields)
   {  for (int i=0; i<attribute_fields.size(); i++) addAttribute((AttributeField)attribute_fields.elementAt(i));
      return this;
   }

   /** Adds a new attribute
     * @param attribute the new AttributeField
     * @return this MediaDescriptor */
   public SessionDescriptor addAttribute(AttributeField attribute)
   {  av.addElement(new AttributeField(attribute));
      return this;
   } 

   /** Removes all session attributes. */
   public SessionDescriptor removeAttributes()
   {  av.setSize(0);
      return this;
   }

   /** Gets a Vector of attribute values.
     * @return a Vector of AttributeField */
   public Vector<AttributeField> getAttributes()
   {  Vector<AttributeField> _v=new Vector<AttributeField>(av.size());
      for (int i=0; i<av.size(); i++)
         _v.addElement(av.elementAt(i));
      return _v;
   } 

   /** Whether it has a particular attribute
     * @param a_name the attribute name
     * @return true if found, otherwise returns null */
   public boolean hasAttribute(String attribute_name)
   {  for (int i=0; i<av.size(); i++)
      {  if (((AttributeField)av.elementAt(i)).getAttributeName().equals(attribute_name)) return true;
      }
      return false;
   } 
   
   /** Gets the first AttributeField of a particular attribute name.
     * @param attribute_name the attribute name
     * @return the AttributeField, or null if not found */
   public AttributeField getAttribute(String attribute_name)
   {  for (int i=0; i<media.size(); i++)
      {  AttributeField af=(AttributeField)av.elementAt(i);
         if (af.getAttributeName().equals(attribute_name)) return af; 
      }
      return null;
   }

   /** Gets a Vector of attribute values of a particular attribute name.
     * @param a_name the attribute name
     * @return a Vector of AttributeField */
   public Vector<AttributeField> getAttributes(String attribute_name)
   {  Vector<AttributeField> _v=new Vector<AttributeField>(av.size());
      for (int i=0; i<av.size(); i++)
      {  AttributeField a=(AttributeField)av.elementAt(i);
         if (a.getAttributeName().equals(attribute_name)) _v.addElement(a);
      }
      return _v;
   } 


   /** Gets a String rapresentation */
    @Override
   public String toString()
   {  //String str=v.toString()+o.toString()+s.toString();
      StringBuffer sb=new StringBuffer();
      if (v!=null) sb.append(v.toString());
      if (o!=null) sb.append(o.toString());
      if (s!=null) sb.append(s.toString());
      if (c!=null) sb.append(c.toString());
      if (t!=null) sb.append(t.toString());
      for (int i=0; i<av.size(); i++) sb.append(((AttributeField)av.elementAt(i)).toString());
      for (int i=0; i<media.size(); i++) sb.append(((MediaDescriptor)media.elementAt(i)).toString());
      return sb.toString();
   }
   
}
