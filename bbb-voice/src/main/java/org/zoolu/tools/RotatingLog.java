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


import java.io.*;
import java.util.Date;
import java.util.Calendar;
//import java.util.GregorianCalendar;


/** Class RotatingLog extends Log with log file rotation. 
  */
public class RotatingLog extends Log
{

   /** Month */
   //public static final int MONTH=GregorianCalendar.MONTH;
   public static final int MONTH=Calendar.MONTH;
   /** Day */
   //public static final int DAY=GregorianCalendar.DAY_OF_MONTH;
   public static final int DAY=Calendar.DAY_OF_MONTH;
   /** Hour */
   //public static final int HOUR=GregorianCalendar.HOUR;
   public static final int HOUR=Calendar.HOUR;
   /** Minute */
   //public static final int MINUTE=GregorianCalendar.MINUTE;
   public static final int MINUTE=Calendar.MINUTE;


   /** Number of log file rotations (value 0 means no rotation) */
   int num_rotations;

   /** Rotates log files */
   String file_name;
   
   /** Time scale (MONTH, DAY, HOUR, or MINUTE) */
   int time_scale;

   /** Time value that log files are rotated (time = time_scale * time_value) */
   int time_value;

   /** Date of the next rotation */
   long next_rotation;


   /****************************** Constructors ******************************/

   /** Creates a new RotatingLog file <i>filename</i>
     * . RotatingLog size is limited to <i>logsize</i> [bytes] */
   public RotatingLog(String filename, String logname, int loglevel, long logsize, int n_rotations, int t_scale, int t_value)
   {  super(filename,logname,loglevel,logsize);
      rInit(filename,n_rotations,t_scale,t_value);
   }

   /** Rotates logs */
   public RotatingLog rotate()
   {  if (num_rotations>0)
      {  for (int i=num_rotations-2; i>0; i--)
         {  // rename back files
            rename(file_name+i,file_name+(i+1));
         }
         // save and close current log file
         if (out_stream!=null) out_stream.close();
         // rename current log file
         if (num_rotations>1) rename(file_name,file_name+1);
         // reset the log
         try { out_stream=new PrintStream(new FileOutputStream(file_name)); } catch (IOException e) { e.printStackTrace(); }
         init(out_stream,log_tag,verbose_level,max_size);
      }
      return this; 
   }  
   
   /** Prints the <i>log</i> if <i>level</i> isn't greater than the Log <i>verbose_level</i> */
   public Log print(String message, int level)
   {  //long now=GregorianCalendar.getInstance().getTime().getTime();
      long now=Calendar.getInstance().getTime().getTime();
      if (now>next_rotation)
      {  rotate();
         updateNextRotationTime();
      }
      return super.print(message,level);
   }

   
   /*************************** Private methods ***************************/


   /** Inits rotation */
   private void rInit(String f_name, int n_rotations, int t_scale, int t_value)
   {  file_name=f_name;
      num_rotations=n_rotations;
      time_scale=t_scale;
      time_value=t_value;
      updateNextRotationTime();
   }

   /** Renames a file */
   private static void rename(String src_file, String dst_file)
   {  File src=new File(src_file);
      if (src.exists()) 
      {  File dst=new File(dst_file);
         if (dst.exists()) dst.delete();
         src.renameTo(dst);
      }
   }

   /** Updates the next rotation date */
   private void updateNextRotationTime()
   {  //Calendar cal=GregorianCalendar.getInstance();
      Calendar cal=Calendar.getInstance();
      cal.add(time_scale,time_value);     
      next_rotation=cal.getTime().getTime(); 
   }
       
}
