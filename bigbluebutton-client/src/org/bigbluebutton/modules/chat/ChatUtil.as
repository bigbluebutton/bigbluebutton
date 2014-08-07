/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.modules.chat
{
  import org.bigbluebutton.util.i18n.ResourceUtil;
  import flash.xml.XMLNode;
  import flash.xml.XMLNodeType;
  
  public class ChatUtil
  {
    public static function getUserLang():String {
      return ResourceUtil.getInstance().getCurrentLanguageCode().split("_")[0];
    }
    
    public static function getCurrentTime():String {
      var time:Date = new Date();
      return ChatUtil.getHours(time) + ":" + ChatUtil.getMinutes(time);
    }
    
    public static function getMinutes(time:Date):String {
      var minutes:String;
      if (time.minutes < 10) minutes = "0" + time.minutes;
      else minutes = "" + time.minutes;
      return minutes;
    }
    
    public static function getHours(time:Date):String {
      var hours:String;
      if (time.hours < 10) hours = "0" + time.hours;
      else hours = "" + time.hours;
      return hours
    }
    
    public static function cleanup(message:String):String {
      return XML( new XMLNode( XMLNodeType.TEXT_NODE, message ) ).toXMLString();
    }
    
    public static function parseURLs(message:String):String {
      var messageParsed:String = message;

      // Identify http, https, ftp URLS
      var pattern1:RegExp = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?/;

      // Identify domains (.com,.org) like example.com
      var pattern2:RegExp = /[\w\-\_.]*([\w]+\.)(com|org|co|gov|gob|edu|us|net|info|biz|mobi|name|travel|ca)($)*/;

      var pattern:RegExp = new RegExp( "(" + pattern1.source + "|" + pattern2.source + ")", "g");

      var result:Array = pattern.exec(message);
      var extraCharacters:Number = 0; 

      while (result != null) 
      {
          // For result[0], see: http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/RegExp.html#exec()
          var matchedURL:String = result[0];

          var matchIdx:Number = result.index + extraCharacters;
          var matchLastIdx:Number = pattern.lastIndex + extraCharacters;

          var parsedString:String = '<a href="event:' + matchedURL + '"><u>' + matchedURL + '</u></a>';
          
          var firstStrPart:String = messageParsed.substring(0, matchIdx);
          var secondStrPart:String = messageParsed.substring(matchLastIdx, messageParsed.length);

          messageParsed = firstStrPart + parsedString + secondStrPart;

          // we added these extra characters
          extraCharacters += parsedString.length - (pattern.lastIndex - result.index);

          result = pattern.exec(message); 
      }

      return messageParsed;
    }
  }
}