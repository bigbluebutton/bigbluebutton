package org.bigbluebutton.apps.protocol

class ClientConfigSpec {

  val clientConfig = """
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
    
    """
}