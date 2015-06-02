package org.bigbluebutton.apps.protocol

import com.typesafe.config.ConfigFactory
import spray.json.JsString

object configws {
  val sampleClientConfig = """
{
    "config": {
        "version": "0.8",
        "locale": {
            "version": 0.8,
            "suppressWarning": false,
            "userSelectionEnabled": true
        },
        "help": {
            "url": "http://192.168.0.150/help.html",
            "showHelpButton": true
        },
        "java": {
            "url": "http://192.168.0.150/testjava.html"
        },
        "skinning": {
            "enabled": "true",
            "url": "http://192.168.0.150/client/branding/css/BBBDefault.css.swf"
        },
        "layout": {
            "showLogButton": true,
            "showVideoLayout": "false",
            "showResetLayout": "true",
            "defaultLayout": "Default",
            "showToolbar": true,
            "showFooter": true,
            "showMeetingName": true,
            "showLogoutWindow": true,
            "showLayoutTools": true,
            "confirmLogout": true
        },
        "modules": [
            {
                "name": "ChatModule",
                "url": "http://192.168.0.150/client/ChatModule.swf?v=VERSION",
                "uri": "rtmp://192.168.0.150/bigbluebutton",
                "dependsOn": "UsersModule",
                "translationOn": false,
                "translationEnabled": false,
                "privateEnabled": true,
                "position": "top-right",
                "baseTabIndex": "701"
            },
            {
                "name": "UsersModule",
                "url": "http://192.168.0.150/client/UsersModule.swf?v=VERSION",
                "uri": "rtmp://192.168.0.150/bigbluebutton",
                "allowKickUser": true,
                "enableRaiseHand": true,
                "enableSettingsButton": true,
                "baseTabIndex": "301"
            },
            {
                "name": "DeskShareModule",
                "url": "http://192.168.0.150/client/DeskShareModule.swf?v=4105",
                "uri": "rtmp://192.168.0.150/deskShare",
                "showButton": true,
                "autoStart": false,
                "autoFullScreen": false,
                "baseTabIndex": "201"
            },
            {
                "name": "PhoneModule",
                "url": "http://192.168.0.150/client/PhoneModule.swf?v=VERSION",
                "uri": "rtmp://192.168.0.150/sip",
                "autoJoin": true,
                "skipCheck": false,
                "showButton": true,
                "enabledEchoCancel": true,
                "dependsOn": "UsersModule"
            }
        ]
    }
}
    
    """                                           //> sampleClientConfig  : String = "
                                                  //| {
                                                  //|     "config": {
                                                  //|         "version": "0.8",
                                                  //|         "locale": {
                                                  //|             "version": 0.8,
                                                  //|             "suppressWarning": false,
                                                  //|             "userSelectionEnabled": true
                                                  //|         },
                                                  //|         "help": {
                                                  //|             "url": "http://192.168.0.150/help.html",
                                                  //|             "showHelpButton": true
                                                  //|         },
                                                  //|         "java": {
                                                  //|             "url": "http://192.168.0.150/testjava.html"
                                                  //|         },
                                                  //|         "skinning": {
                                                  //|             "enabled": "true",
                                                  //|             "url": "http://192.168.0.150/client/branding/css/BBBDefault.css
                                                  //| .swf"
                                                  //|         },
                                                  //|         "layout": {
                                                  //|             "showLogButton": true,
                                                  //|             "showVideoLayout": "false",
                                                  //|             "showResetLayout": "true",
                                                  //|             "defaultLayout": "Default",
                                                  //|             "showToolbar": true,
                                                  //|             "showFooter": true,
                                                  //|             "showMeetingName": true,
                                                  //|            
                                                  //| Output exceeds cutoff limit.
    
    val conf = ConfigFactory.parseString(sampleClientConfig)
                                                  //> conf  : com.typesafe.config.Config = Config(SimpleConfigObject({"config":{"
                                                  //| help":{"showHelpButton":true,"url":"http://192.168.0.150/help.html"},"skinn
                                                  //| ing":{"enabled":"true","url":"http://192.168.0.150/client/branding/css/BBBD
                                                  //| efault.css.swf"},"layout":{"showLayoutTools":true,"showToolbar":true,"showF
                                                  //| ooter":true,"showResetLayout":"true","showVideoLayout":"false","showLogButt
                                                  //| on":true,"defaultLayout":"Default","showLogoutWindow":true,"showMeetingName
                                                  //| ":true,"confirmLogout":true},"locale":{"suppressWarning":false,"userSelecti
                                                  //| onEnabled":true,"version":0.8},"java":{"url":"http://192.168.0.150/testjava
                                                  //| .html"},"modules":[{"position":"top-right","translationEnabled":false,"base
                                                  //| TabIndex":"701","name":"ChatModule","privateEnabled":true,"dependsOn":"User
                                                  //| sModule","uri":"rtmp://192.168.0.150/bigbluebutton","url":"http://192.168.0
                                                  //| .150/client/ChatModule.swf?v=VERSION","translationOn":false},{"baseTabIndex
                                                  //| ":"301","name":"UsersMo
                                                  //| Output exceeds cutoff limit.

   val jsString = JsString(sampleClientConfig)    //> jsString  : spray.json.JsString = "\n{\n    \"config\": {\n        \"versio
                                                  //| n\": \"0.8\",\n        \"locale\": {\n            \"version\": 0.8,\n      
                                                  //|       \"suppressWarning\": false,\n            \"userSelectionEnabled\": tr
                                                  //| ue\n        },\n        \"help\": {\n            \"url\": \"http://192.168.
                                                  //| 0.150/help.html\",\n            \"showHelpButton\": true\n        },\n     
                                                  //|    \"java\": {\n            \"url\": \"http://192.168.0.150/testjava.html\"
                                                  //| \n        },\n        \"skinning\": {\n            \"enabled\": \"true\",\n
                                                  //|             \"url\": \"http://192.168.0.150/client/branding/css/BBBDefault.
                                                  //| css.swf\"\n        },\n        \"layout\": {\n            \"showLogButton\"
                                                  //| : true,\n            \"showVideoLayout\": \"false\",\n            \"showRes
                                                  //| etLayout\": \"true\",\n            \"defaultLayout\": \"Default\",\n       
                                                  //|      \"showToolbar\": true,\n            \"showFooter\": true,\n           
                                                  //|  \"showMeetingName\": t
                                                  //| Output exceeds cutoff limit.
   
}