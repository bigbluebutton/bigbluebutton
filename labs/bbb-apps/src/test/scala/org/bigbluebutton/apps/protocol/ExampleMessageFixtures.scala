package org.bigbluebutton.apps.protocol

trait ExampleMessageFixtures {
  val invalidJSON = """{ "invalid"  "Missing a colon" }"""
    
  val validJSON = """{ "valid" : "Valid JSON" }"""
  
  val invalidMessage = """ 
{
    "header": {
        "name": "PrivateChatMessageEvent",
        "timestamp": 123456
    },
    "payload1": {
        "valid": "Valid JSON"
    }
}       
    """
    
  val validMessage = """
	{
	    "header": {
	        "event": {
	            "name": "CreateMeetingRequest",
	            "timestamp": 123456,
	            "reply": {"to": "replyChannel", "correlationId" : "abc123"},
	            "source": "web-api"
	        },
	        "meeting": {
	            "name": "English 101",
	            "id": "english_101"
	        }
	    },
	    "payload": {
	        "meeting": {
	            "name": "English 101",
	            "externalId": "english_101",
	            "record": true,
	            "welcomeMessage": "Welcome to English 101",
	            "logoutUrl": "http://www.bigbluebutton.org",
	            "avatarUrl": "http://www.gravatar.com/bigbluebutton",
	            "users": {
	                "max": 20,
	                "hardLimit": false
	            },
	            "duration": {
	                "length": 120,
	                "allowExtend": false,
	                "warnBefore": 30
	            },
	            "voiceConf": {
	                "pin": 123456,
	                "number": 85115
	            },
	            "phoneNumbers": [
	                {
	                    "number": "613-520-7600",
	                    "description": "Ottawa"
	                },
	                {
	                    "number": "1-888-555-7890",
	                    "description": "NA Toll-Free"
	                }
	            ],
	            "metadata": {
	                "customerId": "acme-customer",
	                "customerName": "ACME"
	            }
	        }
	    }
	}
  """
    
  val createMeetingRequest = """
	{
	    "header": {
	        "destination": {
	            "to": "apps_channel"
	        },
	        "reply": {
	            "to": "apps_channel",
	            "correlation_id": "abc"
	        },
	        "name": "create_meeting_request",
	        "timestamp": "2013-12-23T08:50Z",
	        "source": "web-api"
	    },
	    "payload": {
	        "meeting": {
	            "name": "English 101",
	            "external_id": "english_101",
	            "record": true,
	            "welcome_message": "Welcome to English 101",
	            "logout_url": "http://www.bigbluebutton.org",
	            "avatar_url": "http://www.gravatar.com/bigbluebutton",
	            "max_users": 20,
	            "duration": {
	                "length": 120,
	                "allow_extend": false,
	                "max": 240
	            },
	            "voice_conference": {
	                "pin": 123456,
	                "number": 85115
	            },
	            "phone_numbers": [
	                {
	                    "number": "613-520-7600",
	                    "description": "Ottawa"
	                },
	                {
	                    "number": "1-888-555-7890",
	                    "description": "NA Toll-Free"
	                }
	            ],
	            "metadata": {
	                "customer_id": "acme-customer",
	                "customer_name": "ACME"
	            }
	        }
	    }
	} 
    """

  val invalidCreateMeetingRequest = """
	{
	    "header": {
	        "name": "CreateMeeting",
	        "timestamp": 123456,
	        "correlation": "123abc",
	        "source": "web-api"
	    },
	    "payload": {
	        "meeting": {
	            "name": "English 101",
	            "externalId": "english_101",
	            "record": true,
	            "welcomeMessage": "Welcome to English 101",
	            "logoutUrl": "http://www.bigbluebutton.org",
	            "avatarUrl": "http://www.gravatar.com/bigbluebutton",
	            "users": {
	                "max": 20,
	                "hardLimit": false
	            },
	            "duration": {
	                "length": 120,
	                "allowExtend": false,
	                "warnBefore": 30
	            },
	            "voiceConf": {
	                "pin": 123456,
	                "number": 85115
	            },
	            "phoneNumbers": [
	                {
	                    "number": "613-520-7600",
	                    "description": "Ottawa"
	                },
	                {
	                    "number": "1-888-555-7890",
	                    "description": "NA Toll-Free"
	                }
	            ],
	            "metadata": [
	               {"customerId": "acme-customer"},
	               {"customerName": "ACME"}
	            ]
	        }
	    }
	}  
    """
    
  val registerUserRequestMessage = """
	{
	    "header": {
	        "event": {
	            "name": "register_user",
	            "timestamp": 123456,
	            "reply": {
	                "to": "reply_channel",
	                "correlation_id": "abc123"
	            },
	            "source": "web-api"
	        },
	        "meeting": {
	            "name": "English 101",
	            "id": "english_101",
	            "session": "english_101-12345"
	        }
	    },
	    "payload": {
	        "user": {
	            "external_id": "user1",
	            "name": "Guga",
	            "role": "MODERATOR",
	            "pin": 12345,
	            "welcome_message": "Welcome to English 101",
	            "logout_url": "http://www.example.com",
	            "avatar_url": "http://www.example.com/avatar.png"
	        }
	    }
	}
  """  
  
  val exampleChatMessage = """
	{
	    "header": {
	        "event": {
	            "name": "public_chat_message",
	            "timestamp": 123456,
	            "source": "web-api"
	        },
	        "meeting": {
	            "name": "English 101",
	            "id": "english_101",
	            "session": "english_101-12345"
	        }
	    },
	    "payload": {
	        "chat": {
	            "id": "msg1",
	            "sentOn": 1383210123456,
	            "from": {
	                "id": "user1",
	                "name": "Richard"
	            },
	            "message": {
	                "text": "Hello world!",
	                "lang": "en_US"
	            },
	            "font": {
	                "color": 16711680,
	                "size": 14,
	                "type": "Arial"
	            },
	            "translations": [
	                {
	                    "lang": "es_LA",
	                    "text": "Hola Mundo!"
	                }
	            ]
	        }
	    }
	}    
  """
    
  val wbmsg = """
	{
	    "name": "whiteboard_draw",
	    "timestamp": 123456,
	    "meeting": {
	        "id": "english_101",
	        "name": "English 101",
	        "session": "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1383210136298"
	    },
	    "payload": {
	        "whiteboard_id": "user1-shape-1",
	        "shape_id": "q779ogycfmxk-13-1383262166102",
	        "shape_type": "text",
	        "data": {
	            "coordinate": {
	                "first_x": 0.016025641025641028,
	                "first_y": 0.982905982905983,
	                "last_x": 1.33,
	                "last_y": 2.45
	            },
	            "font": {
	                "style": "arial",
	                "color": 0,
	                "size": 18
	            },
	            "background": {
	                "visible": true,
	                "color": 16777215,
	                "alpha": 0
	            },
	            "text": "He"
	        },
	        "by": {
	            "id": "user1",
	            "name": "Guga"
	        }
	    }
	}
  """    
}