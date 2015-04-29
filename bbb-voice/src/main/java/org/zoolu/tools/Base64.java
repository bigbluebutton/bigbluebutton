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



/** Class Base64 can be used for base64-encoding a byte array
  * and/or for base64-decoding a base64-string.
  *
  * @author Camilla Ferramola, Univeristy of Parma, Italy - 2004
  */
public class Base64
{ 
   private static final String base64codes ="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";   
   private static int[] aux = new int[4];
                    

   /** Base64 encoder */
   public static String encode(byte[] input)
   {
   	
      String stringacod = "";
      byte[] bin = new  byte[3];
      
      int iter = (input.length)/3;
      int nzero = (input.length)%3;
      int i = 0;
     
      for (i=0; i<iter; i++)
      {              
         bin[0] = input[i*3];
         bin[1] = input[i*3+1];
         bin[2] = input[i*3+2];
         
         aux[0] = ((bin[0] >>> 2)&63);
         aux[1] = ((bin[0] & 3) << 4) + ((bin[1] >>> 4)&15);
         aux[2] = ((bin[1] & 15) << 2) + ((bin[2] >>> 6)&3);
         aux[3] = (bin[2] & 63);
         
         // uso gli interi memorizzati in aux[] come indice della stringa base64codes 
         //System.out.println("aux[0]="+aux[0]+" aux[1]="+aux[1]);
         stringacod = stringacod + base64codes.charAt(aux[0])+ base64codes.charAt(aux[1])+
                      base64codes.charAt(aux[2])+base64codes.charAt(aux[3]);
      } 
   
      if( i==iter )
      {
         if ( nzero==0 )
         {
         }
         else
         if ( nzero==1 )
         {  // l'ultimo pacchetto da analizzare ha 8 bit
            // quindi ottengo due caratteri in base64 e due caratteri padding "="                       
            aux[0] = ((input[iter*3] >>> 2) & 63);
            aux[1] = (input[iter*3] & 3) << 4;
            
            stringacod = stringacod + base64codes.charAt(aux[0])+base64codes.charAt(aux[1])+"==";
         }
         else 
         if (nzero==2)
         {  // l'ultimo pacchetto da analizzare ha 16 bit quindi ottengo
            // tre caratteri in base 64 e uno di padding "="                             
            aux[0] = ((input[iter*3] >>> 2) & 63) ;
            aux[1] = ((input[iter*3] & 3) << 4) + ((input[iter*3+1] >>> 4) & 15);
            aux[2] = (input[iter*3+1 ] & 15) << 2;
            
            stringacod = stringacod + base64codes.charAt(aux[0])+ base64codes.charAt(aux[1])+
                         base64codes.charAt(aux[2])+"=";
         }
      }

      return stringacod;
        
   }

 
   /** Base64 decoder */
   public static byte[] decode (String stringacod)
   {
      // tolgo gli eventuali "=" alla fine della stringa
      int uguale = stringacod.indexOf("=");
      if ( uguale != -1) stringacod = stringacod.substring(0,uguale);
      
      int[] bin = new int[3];
      int iter = (stringacod.length())/4;
      int resto = (stringacod.length())%4;
      
      int nzero = 0;
      if (resto!=0) nzero = 1;    
      byte[] output = new byte[iter*3 + nzero*(resto-1)];    
      
      int i = 0;
      for (i=0; i<iter; i++)
      {  	
         aux[0] = base64codes.indexOf(stringacod.charAt(i*4));
         aux[1] = base64codes.indexOf(stringacod.charAt(i*4+1));
         aux[2] = base64codes.indexOf(stringacod.charAt(i*4+2));
         aux[3] = base64codes.indexOf(stringacod.charAt(i*4+3));
         	  
         bin[0] = (aux[0]<<2) + (aux[1]>>>4);
         bin[1] = (aux[1]%16 <<4) + (aux[2]>>>2);
         bin[2] = (aux[2]%4 <<6) + aux[3];
     	   	  
         output[i*3] = (byte)bin [0];
         output[i*3+1] = (byte)bin [1];
         output[i*3+2] = (byte)bin [2];
      }
      
      if (i==iter)
      {
     	   if (resto==0)
     	   {
     	   } 
     	   if (resto==2)
     	   {
     		   aux[0] = base64codes.indexOf(stringacod.charAt(i*4));
     	      aux[1] = base64codes.indexOf(stringacod.charAt(i*4+1));
     	      	   
     	      bin[0] = (aux[0]<<2) + (aux[1]>>>4);
     	     
     	      output[i*3] = (byte)bin[0];  	     	  
  	      }
  	    
    	   if (resto==3)
    	   {    		
     	      aux[0] = base64codes.indexOf(stringacod.charAt(i*4));
     	      aux[1] = base64codes.indexOf(stringacod.charAt(i*4+1));
     	      aux[2] = base64codes.indexOf(stringacod.charAt(i*4+2));
     	  
     	      bin[0] = (aux[0]<<2) + (aux[1]>>>4);
     	      bin[1] = (aux[1]%16 <<4) + (aux[2]>>>2);
     	  
     	      output[i*3] = (byte)bin [0];
     	      output[i*3+1] = (byte)bin [1];	  
    	   }
      } 
      return output;
   }


   // ******************************* MAIN *******************************

   public static void main (String[] args) 
   {
      String messaggio = args[0];
      byte[] bmess = messaggio.getBytes();
      String mess64 = encode(bmess);
      System.out.println("messaggio codificato: "+mess64);
      byte[] decodificato = decode(mess64); 
      String strdecodificato = "";
      try { 
      strdecodificato = new String (decodificato,"ISO-8859-1"); 
      }
      catch (Exception e) { e.printStackTrace();}
      System.out.println("messaggio decodificato: "+strdecodificato);      
   }
}
