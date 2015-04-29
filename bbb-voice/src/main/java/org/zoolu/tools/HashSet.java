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

package org.zoolu.tools;


import java.util.Vector;


/** HashSet
  */
public class HashSet
{
   Vector set;

   public HashSet()
   {  set=new Vector();
   }  

   public int size()
   {  return set.size();
   }

   public boolean isEmpty()
   {  return set.isEmpty();
   }

   public boolean add(Object o)
   {  set.addElement(o);
      return true;
   }

   public boolean remove(Object o)
   {  return set.removeElement(o);
   }

   public boolean contains(Object o)
   {  return set.contains(o);
   }
   
   public Iterator iterator()
   {  return new Iterator(set);
   }   
}

