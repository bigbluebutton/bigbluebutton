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
  import flash.external.ExternalInterface;
  import flash.xml.XMLNode;
  import flash.xml.XMLNodeType;
  
  import org.as3commons.lang.StringUtils;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.util.i18n.ResourceUtil;
  
  public class ChatUtil
  {
    private static var urlPattern : RegExp = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/gi;
    
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
    
    public static function cleanup(message:String):String{
      return XML( new XMLNode( XMLNodeType.TEXT_NODE, message ) ).toXMLString();
    }
    
    public static function parseURLs( message : String ) : String{
      //var urlPattern : RegExp = /(http|ftp|https|www)(:\/\/[^\s\-_]+)?(\.[^\s\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[^\s\-\@?^=%&\/~\+#\(\)])?/g;
      
      var resultArray : Array = [];
      var result : Object = ExternalInterface.call("checkURLRegex", message);
      while (result = urlPattern.exec(message)){
        var item : Object = new Object();
        item.foundValue = result[0];
        item.index = result.index;
        item.length = item.foundValue.length;
        
        // We push the last result into resultArray
        resultArray.push(item);
        
        // We try to find the next match
        urlPattern.lastIndex = item.index + item.length;
      }
      
      // Replacing matched patterns with HTML links
      var parsedString : String = message;
      for (var i : int = resultArray.length - 1; i >= 0; i--)
      {
        var value : String = resultArray[i].foundValue;
        var newValue : String;
        if (!StringUtils.startsWith(value, 'www')){
          newValue = '<a href="event:' + value + '"> <u>' + value + '</u></a> ';
        }
        else{
          newValue = '<a href="event:http://' + value + '"> <u>' + value + '</u></a> '; 
        }
        parsedString = StringUtils.replaceAt(parsedString, newValue, resultArray[i].index, resultArray[i].index + resultArray[i].length)
      }
      
      return parsedString;
    }
    
    public static function genCorrelationId():String {
      var now: Date = new Date();
      return UsersUtil.getMyUserID() + "-" + now.time;
    }
  }
}