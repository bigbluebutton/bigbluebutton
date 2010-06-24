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


import java.util.*;


/** Class Parser allows the parsing of String objects.
 *  <BR> An object Parser is costructed from a String object and provides various methods for parsing the String in a stream oriented manner.
 *  The class Parser also collects different <b>static</b> methods for parsing non-pre-associated strings.<BR>
 *  Parser uses the following definitions:<PRE>
 *   <BR><i>string</i> = any string of chars included between ' ' and '~'
 *   <BR><i>word</i> = any string of chars without separators
 *   <BR><i>separators</i> = a vector of chars; e.g. ( ) < > @ , ; : \ " / | [ ] ? = { } HT SP
 *   <BR><i>alpha</i> = a-z, A-Z
 *   <BR><i>digit</i> = 0-9
 *   <BR><i>integer</i> = any <i>digit word</i> parsed by {@link java.lang.Integer Integer.parseInt(String)}
 *   </PRE>
 */
public class Parser
{
   
   /** The string that is being parsed. */
   protected String str;
   /** The the current pointer to the next char within the string. */
   protected int index;
   
   /** Creates the Parser from the String <i>s</i> and point to the beginning of the string.*/
   public Parser(String s)
   {  
	   if (s == null) throw (new RuntimeException("Tried to costruct a new Parser with a null String"));
	   str = s;
	   index = 0;
   }
   
   /** Creates the Parser from the String <i>s</i> and point to the position <i>i</i>. */
   public Parser(String s, int i)
   {  
	   if (s == null) throw (new RuntimeException("Tried to costruct a new Parser with a null String"));
	   str = s;
	   index = i;
   }
   
   /** Creates the Parser from the StringBuffer <i>sb</i> and point to the beginning of the string.*/
   public Parser(StringBuffer sb)
   {  
	   if (sb == null) throw (new RuntimeException("Tried to costruct a new Parser with a null StringBuffer"));
	   str = sb.toString();
      index = 0;
   }
   /** Creates the Parser from the StringBuffer <i>sb</i> and point to the position <i>i</i>. */
   public Parser(StringBuffer sb, int i)
   {  
	   	if (sb == null) throw (new RuntimeException("Tried to costruct a new Parser with a null StringBuffer"));
	   	str = sb.toString();
	   	index = i;
   }
   
   /** Gets the current index position. */
   public int getPos() { 
	   return index; 
   }

   /** Gets the entire string */
   public String getWholeString() { 
	   return str; 
   }

   /** Gets the rest of the (unparsed) string. */
   public String getRemainingString() { return str.substring(index); }
   
   /** Returns a new the Parser of <i>len</i> chars statirng from the current position. */
   public Parser subParser(int len) {  return new Parser(str.substring(index,index+len));  }   

   /** Length of unparsed string. */
   public int length() { return (str.length()-index); }

   /** Whether there are more chars to parse. */
   public boolean hasMore() { return length()>0; }
   
   /** Gets the next char and go over */
   public char getChar() { return str.charAt(index++); }   

   /** Gets the char at distance <i>n</i> WITHOUT going over */
   public char charAt(int n) { return str.charAt(index+n); }   

   /** Gets the next char WITHOUT going over */
   public char nextChar() { return charAt(0); }   

   /** Goes to position <i>i</i> */
   public Parser setPos(int i) { index= i; return this; }
   
   /** Goes to the next occurence of <i>char c</i> */
   public Parser goTo(char c) { index=str.indexOf(c,index); if (index<0) index=str.length(); return this; }

   /** Goes to the next occurence of any char of array <i>cc</i> */
   public Parser goTo(char[] cc) { index=indexOf(cc); if (index<0) index=str.length(); return this; }

   /** Goes to the next occurence of <i>String s</i> */
   public Parser goTo(String s) { index=str.indexOf(s,index); if (index<0) index=str.length(); return this; }

   /** Goes to the next occurence of any string of array <i>ss</i> */
   public Parser goTo(String[] ss) { index=indexOf(ss); if (index<0) index=str.length(); return this; }

   /** Goes to the next occurence of <i>String s</i> */
   public Parser goToIgnoreCase(String s) { index=indexOfIgnoreCase(s); if (index<0) index=str.length(); return this; }

   /** Goes to the next occurence of any string of array <i>ss</i> */
   public Parser goToIgnoreCase(String[] ss) { index=indexOfIgnoreCase(ss); if (index<0) index=str.length(); return this; }

   /** Goes to the begin of the new line */
   public Parser goToNextLine()
   {  while (index<str.length() && !isCRLF(str.charAt(index))) index++;
      // skip the end of the line (i.e. '\r' OR '\n' OR '\r\n')
      if (index<str.length()) { if (str.startsWith("\r\n",index)) index+=2; else index++; }   
      return this;
   }
   
   /** Characters space (SP) and tab (HT). */
   public static char[] WSP={' ','\t'};
   /** The same as WSP (for legacy) */
   public static char[] SPACE=WSP;
   /** Characters CR and LF.*/
   public static char[] CRLF={'\r','\n'};
   /** Characters white-space, tab, CR, and LF. */
   public static char[] WSPCRLF={' ','\t','\r','\n'};
   
   /** True if char <i>ch</i> is any char of array <i>ca</i> */
   public static boolean isAnyOf(char[] ca, char ch)
   {  boolean found=false;
      for (int i=0; i<ca.length; i++) if (ca[i]==ch) { found=true; break; }
      return found;
   }

   /** Up alpha */
   public static boolean isUpAlpha(char c) { return (c>='A' && c<='Z'); }
   /** Low alpha */
   public static boolean isLowAlpha(char c) { return (c>='a' && c<='z'); }
   /** Alpha */
   public static boolean isAlpha(char c) { return (isUpAlpha(c) || isLowAlpha(c)); }
   /** Alphanum */
   public static boolean isAlphanum(char c){ return (isAlpha(c) || isDigit(c)); }
   /** Digit */
   public static boolean isDigit(char c) { return (c>='0' && c<='9'); }
   /** Valid ASCII char */
   public static boolean isChar(char c) { return (c>' ' && c<='~'); }
   /** CR */   
   public static boolean isCR(char c) { return (c=='\r'); }
   /** LF */
   public static boolean isLF(char c) { return (c=='\n'); }
   /** CR or LF */
   public static boolean isCRLF(char c) { return isAnyOf(CRLF,c); }
   /** HT */
   public static boolean isHT(char c) { return (c=='\t'); }
   /** SP */
   public static boolean isSP(char c) { return (c==' '); }
   /** SP or tab */
   public static boolean isWSP(char c){ return isAnyOf(WSP,c); }
   /** SP, tab, CR, or LF */
   public static boolean isWSPCRLF(char c){ return isAnyOf(WSPCRLF,c); }


   /** Compares two chars ignoring case */
   public static int compareIgnoreCase(char c1, char c2)
   {  if (isUpAlpha(c1)) c1+=32;
      if (isUpAlpha(c2)) c2+=32;
      return c1-c2;
   }

/*
   private boolean isUpAlpha(int i) { return isUpAlpha(str.charAt(i)); }
   private boolean isLowAlpha(int i) { return isLowAlpha(str.charAt(i)); }
   private boolean isAlpha(int i) { return isAlpha(str.charAt(i)); }
   private boolean isDigit(int i) { return isDigit(str.charAt(i)); }
   private boolean isChar(int i) { return isChar(str.charAt(i)); }
   private boolean isCR(int i) { return isCR(str.charAt(i)); }
   private boolean isLF(int i) { return isLF(str.charAt(i)); }
   private boolean isHT(int i) { return isHT(str.charAt(i)); }
   private boolean isSP(int i) { return isSP(str.charAt(i)); }
   private boolean isCRLF(int i) { return (isCR(str.charAt(i)) && isLF(str.charAt(i+1))); }
   private boolean isSeparator(int i) { return isSeparator(str.charAt(i)); }
*/

   // ************************ Indexes ************************

   /** Gets the index of the first occurence of char <i>c</i> */
   public int indexOf(char c)
   {  return str.indexOf(c,index);
   }
   /** Gets the index of the first occurence of any char of array <i>cc</i> within string <i>str</i> starting form <i>begin</i>; return -1 if no occurence is found*/
   public int indexOf(char[] cc)
   {  boolean found=false;
      int begin=index;
      while (begin<str.length() && !found)
      {  for (int i=0; i<cc.length; i++)
            if (str.charAt(begin)==cc[i]) { found=true; break; }
         begin++;
      }
      return (found)? (begin-1) : -1;
   }
   /** Gets the index of the first occurence of String <i>s</i> */
   public int indexOf(String s)
   {  return str.indexOf(s,index);
   }
   /** Gets the index of the first occurence of any string of array <i>ss</i> within string <i>str</i>; return -1 if no occurence is found. */
   public int indexOf(String[] ss)
   {  boolean found=false;
      int begin=index;
      while (begin<str.length() && !found)
      {  for (int i=0; i<ss.length; i++)
            if (str.startsWith(ss[i],begin)) { found=true; break; }
         begin++;
      }
      return (found)? (begin-1) : -1;
   }
   /** Gets the index of the first occurence of String <i>s</i> ignoring case. */
   public int indexOfIgnoreCase(String s)
   {  Parser par=new Parser(str,index);
      while (par.hasMore())
      {  if (par.startsWithIgnoreCase(s)) return par.getPos();
         else par.skipChar();
      } 
      return -1;
   }
   /** Gets the index of the first occurence of any string of array <i>ss</i> ignoring case. */
   public int indexOfIgnoreCase(String[] ss)
   {  Parser par=new Parser(str,index);
      while (par.hasMore())
      {  if (par.startsWithIgnoreCase(ss)) return par.getPos();
         else par.skipChar();
      } 
      return -1;
   }

   /** Gets the begin of next line */
   public int indexOfNextLine()
   {  Parser par=new Parser(str,index);
      par.goToNextLine();
      int i=par.getPos();
      return (i<str.length())? i : -1;
   }
 
   
   // ********************* Starts with *********************
   
   /** Whether next chars equal to a specific String <i>s</i>. */
   public boolean startsWith(String s)
   {  return str.startsWith(s,index);
   }
   /** Whether next chars equal to any string of array <i>ss</i>. */
   public boolean startsWith(String[] ss)
   {  for (int i=0; i<ss.length; i++)
         if (str.startsWith(ss[i],index)) return true;
      return false;
   }
   /** Whether next chars equal to a specific String <i>s</i> ignoring case. */
   public boolean startsWithIgnoreCase(String s)
   {  for (int k=0; k<s.length() && (index+k)<str.length(); k++)
      {  if (compareIgnoreCase(s.charAt(k),str.charAt(index+k))!=0) return false;
      }
      return true;
   }
   /** Whether next chars equal to any string of array <i>ss</i> ignoring case. */
   public boolean startsWithIgnoreCase(String[] ss)
   {  for (int i=0; i<ss.length; i++)
      {  boolean equal=true;
         for (int k=0; k<ss[i].length() && (index+k)<str.length(); k++)
         {  if (!(equal=(compareIgnoreCase(ss[i].charAt(k),str.charAt(index+k))==0))) break;
         }
         if (equal) return true;
      }
      return false;
   }


   // ************************ Skips ************************
   
   /** Skips one char */
   public Parser skipChar()
   {  if(index<str.length()) index++;
      return this;
   }
   /** Skips N chars */
   public Parser skipN(int n)
   {  index+=n;
      if(index>str.length()) index=str.length();
      return this;
   }
   /** Skips all spaces */
   public Parser skipWSP()
   {  while (index<str.length() && isSP(str.charAt(index))) index++;
      return this;
   }
   /** The same as skipWSP() (for legacy) */
   /*public Parser skipSP()
   {  return skipWSP();
   }*/
   /** Skips return lines */
   public Parser skipCRLF()
   {  while (index<str.length() && isCRLF(str.charAt(index))) index++;
      return this;
   }
   /** Skips white spaces or return lines */
   public Parser skipWSPCRLF()
   {  while (index<str.length() && isWSPCRLF(str.charAt(index))) index++;
      return this;
   }
   /** Skips any selected chars */
   public Parser skipChars(char[] cc)
   {  while (index<str.length() && isAnyOf(cc,nextChar())) index++;
      return this;
   }
   /** Skips a continuous string of char and go to the next "blank" char */
   public Parser skipString()
   {  getString();
      return this;
   }

   // ************************ Gets ************************

   /** Gets a continuous string of char and go to the next char */
   public String getString()
   {  int begin=index;
      while (begin<str.length() && !isChar(str.charAt(begin))) begin++;
      int end=begin;
      while (end<str.length() && isChar(str.charAt(end))) end++;
      index=end;
      return str.substring(begin,end);
   }
   /** Gets a string of length <i>len</i> and move over. */
   public String getString(int len)
   {  int start=index;
      index=start+len;
      return str.substring(start,index);
   }
   /** Gets a string of chars separated by any of chars of <i>separators</i> */
   public String getWord(char[] separators)
   {  int begin=index;
      while (begin<str.length() && isAnyOf(separators,str.charAt(begin))) begin++;
      int end=begin;
      while (end<str.length() && !isAnyOf(separators,str.charAt(end))) end++;
      index=end;
      return str.substring(begin,end);
   }
   /** Gets an integer and point to the next char */
   public int getInt()
   {  return Integer.parseInt(this.getString());
   }
   /** Gets a double and point to the next char */
   public double getDouble()
   {  return Double.parseDouble(this.getString());
   }
   /** Gets all chars until the end of the line (or the end of the parser)
     * and go to the next line. */
   public String getLine()
   {  int end=index;
      while (end<str.length() && !isCRLF(str.charAt(end))) end++;
      String line=str.substring(index,end);
      index=end;
      // skip the end of the line (i.e. '\r' OR '\n' OR '\r\n')
      if (index<str.length())
      {  if (str.startsWith("\r\n",index)) index+=2;
         else index++;
      }   
      return line;
   }
   
   //********************** Vectors/arrays **********************

   /** Gets all string of chars separated by any char belonging to <i>separators</i> */
   public Vector getWordVector(char[] separators)
   {  Vector list=new Vector();
      do { list.addElement(getWord(separators)); } while (hasMore());
      return list;
   }
   /** Gets all string of chars separated by any char belonging to <i>separators</i> */
   public String[] getWordArray(char[] separators)
   {  Vector list=getWordVector(separators);
      String[] array=new String[list.size()];
      for (int i=0; i<list.size(); i++) array[i]=(String)list.elementAt(i);
      return array;
   }
   /** Gets all strings */
   public Vector getStringVector()
   {  Vector list=new Vector();
      do { list.addElement(getString()); } while (hasMore());
      return list;
   }
   /** Gets all string */
   public String[] getStringArray()
   {  Vector list=getStringVector();
      String[] array=new String[list.size()];
      for (int i=0; i<list.size(); i++) array[i]=(String)list.elementAt(i);
      return array;
   }

   //********************** Quoted Strings **********************

   /** Gets a string of chars separated by any of chars in <i>separators</i>
     * , skipping any separator inside possible quoted texts. */
   public String getWordSkippingQuoted(char[] separators)
   {  int begin=index;
      while (begin<str.length() && isAnyOf(separators,str.charAt(begin))) begin++;
      boolean inside_quoted_string=false;
      int end=begin;
      while (end<str.length() && (!isAnyOf(separators,str.charAt(end)) || inside_quoted_string))
      {  if (str.charAt(end)=='"') inside_quoted_string=!inside_quoted_string;
         end++;
      }
      index=end;
      return str.substring(begin,end);
   }   
   /** Gets the first quatable string, that is a normal string, or text in quotes.
     * <br>In the latter case, quotes are dropped. */
   public String getStringUnquoted()
   {  // jump possible "non-chars"
      while (index<str.length() && !isChar(str.charAt(index))) index++;
      if (index==str.length()) return str.substring(index,index);
      // check whether is a quoted string
      int next_qmark;
      if (str.charAt(index)=='"' && (next_qmark=str.indexOf("\"",index+1))>0) 
      {  // is quoted text
         String qtext=str.substring(index+1,next_qmark);
         index=next_qmark+1;
         return qtext;
      }
      else
      {  // is not a quoted text
         return getString();
      }
   }   
   /** Points to the next occurence of <i>char c</i> not in quotes. */
   public Parser goToSkippingQuoted(char c)
   {  boolean inside_quotes=false;
      try
      {  while (index<str.length() && (!(nextChar()==c) || inside_quotes))
         {  if (nextChar()=='"') inside_quotes=!inside_quotes;
            index++;
         }
      }
      catch (RuntimeException e)
      {  System.out.println("len= "+str.length());
         System.out.println("index= "+index);
         throw e;
      }
      return this;
   }


   //************************* toString *************************

   /** convert the rest of the unparsed chars into a string */
   public String toString()
   {  return getRemainingString();
   }
}
