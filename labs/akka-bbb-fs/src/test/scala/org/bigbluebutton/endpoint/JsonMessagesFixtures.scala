package org.bigbluebutton.endpoint

/**
 * This file contains messages received and sent from/to pubsub by bbb-apps.
 */
trait JsonMessagesFixtures {

/**
 *  Message received from pubsub to create a meeting. 
 *  
 *  meeting_descriptor: different default values for features of the meeting.
 */  
  val CreateMeetingRequestJson     = 
"""
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
	        "meeting_descriptor": {
	            "name": "English 101",
	            "external_id": "english_101",
	            "record": true,
	            "welcome_message": "Welcome to English 101",
	            "logout_url": "http://www.bigbluebutton.org",
	            "avatar_url": "http://www.gravatar.com/bigbluebutton",
	            "max_users": 20,
	            "duration": {
	                "length_in_minutes": 120,
	                "allow_extend": false,
	                "max_minutes": 240
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

/**
 * Message response to the create meeting request.
 * 
 * session: the session id for this newly created meeting.
 * result: the result of the request and relevant message.
 * meeting_descriptor: the meeting_descriptor passed on the create request.
 * 
 */
    
  val CreateMeetingResponseJson    = 
"""
{
    "header": {
        "destination": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "create_meeting_response",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-1234",
        "result": {
            "success": true,
            "message": "Success"
        },
        "meeting_descriptor": {
            "name": "English 101",
            "external_id": "english_101",
            "record": true,
            "welcome_message": "Welcome to English 101",
            "logout_url": "http://www.bigbluebutton.org",
            "avatar_url": "http://www.gravatar.com/bigbluebutton",
            "max_users": 20,
            "duration": {
                "length_in_minutes": 120,
                "allow_extend": false,
                "max_minutes": 240
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

/**
 * Broadcast message to pubsub about the newly created meeting. 
 * Interested parties who keep track of running meeting listen for this
 * event and initialize their own data in preparation for users joining
 * the meeting. 
 *
 */    
  val MeetingCreatedEventJson      = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "meeting_created_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-1234",
        "meeting_descriptor": {
            "name": "English 101", 
            "external_id": "english_101",
            "record": true,
            "welcome_message": "Welcome to English 101",
            "logout_url": "http://www.bigbluebutton.org",
            "avatar_url": "http://www.gravatar.com/bigbluebutton",
            "max_users": 20,
            "duration": {
                "length_in_minutes": 120,
                "allow_extend": false,
                "max_minutes": 240
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

/**
 *  Message received from the pubsub to end the meeting.
 *  
 *  force: true/false - kick everyone out and end the meeting
 *  warn_users: true/false - notify users and wait for a few seconds
 *                           before kicking everyone out. 
 */    
  val EndMeetingRequestJson        = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "reply": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "end_meeting_request",
        "timestamp": "2013-12-23T08: 50Z",
        "source": "bbb-web"
    },
    "payload": {
        "meeting": {
            "name": "English101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "force": true,
        "warn_users": true
    }
}    
    """

/**
 * Response to the end meeting request.    
 */    
  val EndMeetingResponseJson       = """
{
    "header": {
        "destination": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "end_meeting_response",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "result": {
            "success": true,
            "message": "Ending the meeting. Please wait several seconds to complete the request."
        }
    }
}    
    """

/**
 * Notify users that the meeting is about to end. This message gets sent when
 * an end meeting request is received and as a notice that a meeting is about
 * to reach its duration.
 * 
 * time_left, time_unit: time left before the users will be kicked out.
 * allow_extend: allow moderators to extend the meeting up to max duration.
 * 
 */    
  val EndMeetingWarningEventJson          = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "end_meeting_warning_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "time_left": 30,
        "time_unit": "seconds",
        "allow_extend": false
    }
}    
    """

/**
 * Broadcast message that the meeting has ended and that all users have been
 * kicked out. Interested parties should clean up their data.
 * 
 */    
  val MeetingEndedEventJson        = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "meeting_ended_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345"
    }
}    
    """

/**
 * Received from the pubsub that a user is about to join the meeting.     
 */    
  val RegisterUserRequestJson      = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "reply": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "register_user_request",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-web"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "user_descriptor": {
            "external_id": "user1",
            "name": "Guga",
            "role": "MODERATOR",
            "pin": 12345,
            "welcome_message": "Welcome to English 101",
            "logout_url": "http://www.example.com",
            "avatar_url": "http://www.example.com/avatar.png",
            "metadata": {
	           "student_id": "54321",
	           "program": "engineering"
	        }
        }
    }
}    
    """

/**
 * Response to the register user request.
 * 
 * user_token: auth token the user needs to pass when joining the meeting.
 * 
 */    
  val RegisterUserResponseJson     = """
{
    "header": {
        "destination": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "register_user_response",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "user_token": "guga-token",
        "result": {
            "success": true,
            "message": "Success"
        },
        "user_descriptor": {
            "external_id": "user1",
            "name": "Guga",
            "role": "MODERATOR",
            "pin": 12345,
            "welcome_message": "Welcome to English 101",
            "logout_url": "http://www.example.com",
            "avatar_url": "http://www.example.com/avatar.png",
            "metadata": {
	           "student_id": "54321",
	           "program": "engineering"
	        }
        }
    }
}    
    """

/**
 * Broadcast to pubsub that a user is about to join the meeting.
 */    
  val UserRegisteredEventJson      = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "user_registered_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-1234",
        "user_descriptor": {
            "external_id": "user1",
            "name": "Guga",
            "role": "MODERATOR",
            "pin": 12345,
            "welcome_message": "Welcome to English 101",
            "logout_url": "http://www.example.com",
            "avatar_url": "http://www.example.com/avatar.png",
            "metadata": {
	           "student_id": "54321",
	           "program": "engineering"
	        }
        }
    }
}    
    """

/**
 * Received when a user joins the meeting.
 * 
 * token: auth token returned on the register user response.
 */    
  val UserJoinRequestJson          = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "reply": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "user_join_request",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "token": "user1-token-1"
    }
}    
    """

/**
 * Response to the user join request when the token is valid.
 * 
 * The information about the user is returned with the user id.
 */    
  val UserJoinResponseJson         = """
{
    "header": {
        "destination": {
            "to": "apps_channel",
            "correlation_id": "abc-corelid"
        },
        "name": "user_join_response",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "id": "english_101",
            "name": "English 101"
        },
        "session": "english_101-1234",
        "result": {
            "success": true,
            "message": "Success"
        },
        "user": {
            "id": "juan-user1",
            "external_id": "juan-ext-user1",
            "name": "Juan Tamad",
            "role": "MODERATOR",
            "pin": 12345,
            "welcome_message": "Welcome Juan",
            "logout_url": "http://www.umaliska.don",
            "avatar_url": "http://www.mukhamo.com/unggoy",
            "metadata": {
	           "student_id": "54321",
	           "program": "engineering"
	        }
        }
    }
}    
    """

/**
 * Broadcast message to interested parties that a user has joined the meeting.
 * 
 */    
  val UserJoinedEventJson          = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "user_joined_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "user": {
            "id": "juanid",
            "external_id": "userjuan",
            "name": "Juan Tamad",
            "role": "MODERATOR",
            "pin": 12345,
            "welcome_message": "Welcome Juan",
            "logout_url": "http://www.umaliska.don",
            "avatar_url": "http://www.mukhamo.com/unggoy",
            "is_presenter": true,
            "status": {
                "hand_raised": false,
                "muted": false,
                "locked": false,
                "talking": false
            },
            "caller_id": {
                "name": "Juan Tamad",
                "number": "011-63-917-555-1234"
            },
            "media_streams": [
                {
                    "media_type": "audio",
                    "uri": "http://cdn.bigbluebutton.org/stream/a1234",
                    "metadata": {
                        "foo": "bar"
                    }
                },
                {
                    "media_type": "video",
                    "uri": "http://cdn.bigbluebutton.org/stream/v1234",
                    "metadata": {
                        "foo": "bar"
                    }
                },
                {
                    "media_type": "screen",
                    "uri": "http://cdn.bigbluebutton.org/stream/s1234",
                    "metadata": {
                        "foo": "bar"
                    }
                }
            ],
            "metadata": {
                "student_id": "54321",
                "program": "engineering"
            }
        }
    }
}   
    """

/**
 * Received message that a user has left the meeting.
 */    
  val UserLeaveEventJson           = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "user_leave_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "user": {
            "id": "juanid",
            "name": "Juan Tamad"
        }
    }
}    
    """

/**
 * Broadcast message that a user has left the meeting.
 */    
  val UserLeftEventJson            = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "user_left_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "user": {
            "id": "juanid",
            "name": "Juan Tamad"
        }
    }
}    
    """

/**
 * Received messages to get all the users in a meeting.
 */    
  val GetUsersRequestJson          = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "reply": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "get_users_request",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-web"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "requester": {
            "id": "juanid",
            "name": "Juan Tamad"
        }
    }
}    
    """

/**
 * Response to the get users request.
 */    
  val GetUsersResponseJson         = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "get_users_response",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "users": [
            {
                "id": "juanid",
                "external_id": "userjuan",
                "name": "Juan Tamad",
                "role": "MODERATOR",
                "pin": 12345,
                "welcome_message": "Welcome Juan",
                "logout_url": "http://www.umaliska.don",
                "avatar_url": "http://www.mukhamo.com/unggoy",
                "is_presenter": true,
                "status": {
                    "hand_raised": false,
                    "muted": false,
                    "locked": false,
                    "talking": false
                },
                "caller_id": {
                    "name": "Juan Tamad",
                    "number": "011-63-917-555-1234"
                },
                "media_streams": [
                    {
                        "media_type": "audio",
                        "uri": "http://cdn.bigbluebutton.org/stream/a1234",
                        "metadata": {
                            "foo": "bar"
                        }
                    },
                    {
                        "media_type": "video",
                        "uri": "http://cdn.bigbluebutton.org/stream/v1234",
                        "metadata": {
                            "foo": "bar"
                        }
                    },
                    {
                        "media_type": "screen",
                        "uri": "http://cdn.bigbluebutton.org/stream/s1234",
                        "metadata": {
                            "foo": "bar"
                        }
                    }
                ],
                "metadata": {
                    "student_id": "54321",
                    "program": "engineering"
                }
            }
        ]
    }
}   
    """

/**
 * Received message that a user has raised hand.
 */    
  val RaiseUserHandRequestJson     = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "raise_user_hand_request",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "requester": {
            "id": "juanid",
            "name": "Juan Tamad"
        },
        "raise": true
    }
}    
    """

/**
 * Broadcast message that a user has raise her/his hand.
 */    
  val UserRaisedHandEventJson      = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "user_raised_hand_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "requester": {
            "id": "juanid",
            "name": "Juan Tamad"
        },
        "raised": true
    }
}    
    """

/**
 * Received message to assign a user as a presenter.
 */    
  val AssignPresenterRequestJson   = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "assign_presenter_request",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "presenter": {
            "id": "user1",
            "name": "Guga"
        },
        "assigned_by": {
            "id": "user2",
            "name": "Juan"
        }
    }
}    
    """

/**
 * Broadcast message that a new presenter has been assigned.
 */    
  val PresenterAssignedEventJson   = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "presenter_assigned_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "presenter": {
            "id": "user1",
            "name": "Guga"
        },
        "assigned_by": {
            "id": "user2",
            "name": "Juan"
        }
    }
}    
    """

/**
 * Received message to mute a user.
 */    
  val MuteUserRequestJson          = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "mute_user_request",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "user": {
            "id": "user1",
            "name": "Guga"
        },
        "requester": {
            "id": "user2",
            "name": "Juan"
        },
        "mute": true
    }
}    
    """

/**
 * Broadcast message that a request to mute a user has been received.
 */
  val MuteUserRequestEventJson     = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "mute_user_request_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "user": {
            "id": "user1",
            "name": "Guga"
        },
        "requester": {
            "id": "user2",
            "name": "Juan"
        },
        "mute": true
    }
}    
    """

/**
 * Broadcast message to the voice conference provider (FreeSWITCH) to mute
 * a user.
 */    
  val MuteVoiceUserRequestJson   = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "mute_voice_user_request",
        "timestamp": "2013-12-23T08:50Z",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "mute": true,
        "user_metadata": {
            "id": "user1",
            "name": "Guga"
        },
        "voice_metadata": {
            "FreeSWITCH-IPv4": "192.168.0.166",
            "Conference-Name": "72382",
            "Conference-Unique-ID": "480d3f7c-224f-11e0-ae04-fbe97e271da0",
            "conference_member_id": "1"
        }
    }
}    
    """

/**
 * Message from FreeSWITCH that the user has been muted.
 */    
    val VoiceUserMutedEventJson   = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "voice_user_muted_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "fs-esl"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "muted": true,
        "user_metadata": {
            "id": "user1",
            "name": "Guga"
        },
        "voice_metadata": {
            "FreeSWITCH-IPv4": "192.168.0.166",
            "Conference-Name": "72382",
            "Conference-Unique-ID": "480d3f7c-224f-11e0-ae04-fbe97e271da0",
            "conference_member_id": "1"
        }
    }
}   
    """

/**
 * Broadcast messages to interested parties that the user is now muted.
 */      
  val UserMutedEventJson           = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "user_muted_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "fs-esl"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "muted": true,
        "user": {
            "id": "user1",
            "name": "Guga"
        }
    }
}       
    """

val UserPublishStreamRequestJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "reply": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "user_publish_stream_request",
        "timestamp": "2013-12-23T08:50Z",
        "source": "fs-esl"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "media": {
            "media_type": "video",
            "metadata": {
               "foo": "bar"
            }
        },
        "user": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """

val PublishStreamRequestJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "reply": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "publish_stream_request",
        "timestamp": "2013-12-23T08:50Z",
        "source": "fs-esl"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "media": {
            "media_type": "video",
            "metadata": {
               "foo": "bar"
            }
        },
        "user": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """  

val PublishStreamResponseJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "publish_stream_response",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "media": {
            "media_type": "video",
            "uri": "http://cdn.bigbluebutton.org/stream/v1234",
            "metadata": {
               "foo": "bar"
            }
        },
        "user": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """   
  
val UserPublishStreamResponseJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel",
            "correlation_id": "abc"
        },
        "name": "user_publish_stream_response",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "media": {
            "media_type": "video",
            "uri": "http://cdn.bigbluebutton.org/stream/v1234",
            "metadata": {
               "foo": "bar"
            }
        },
        "user": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """
  
val PublishedStreamEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "published_stream_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "media-server"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "media": {
            "media_type": "video",
            "uri": "http://cdn.bigbluebutton.org/stream/v1234",
            "metadata": {
               "foo": "bar"
            }
        },
        "user": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """  
  
val UserPublishedStreamEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "user_published_stream_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "media": {
            "media_type": "video",
            "uri": "http://cdn.bigbluebutton.org/stream/v1234",
            "metadata": {
               "foo": "bar"
            }
        },
        "user": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """   
  
val UnpublishedStreamEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "unpublished_stream_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "media-server"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "media": {
            "media_type": "video",
            "uri": "http://cdn.bigbluebutton.org/stream/v1234",
            "metadata": {
               "foo": "bar"
            }
        },
        "user": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """  
  
val UserUnpublishedStreamEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "user_unpublished_stream_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "id": "english_101"
        },
        "session": "english_101-12345",
        "media": {
            "media_type": "video",
            "uri": "http://cdn.bigbluebutton.org/stream/v1234",
            "metadata": {
               "foo": "bar"
            }
        },
        "user": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """  
  
val PublicChatMessageEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "public_chat_message_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "chat_message": {
            "correlation_id": "user1-msg1",
            "timestamp": "2013-12-23T08:50Z",
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
                "font_type": "Arial"
            }
        }
    }
}    
  """

val BroadcastPublicChatMessageEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "broadcast_public_chat_message_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "chat_message": {
            "id": "msg1234",
            "server_timestamp": "2013-12-23T08:50Z",
            "correlation_id": "user1-msg1",
            "user_timestamp": "2013-12-23T08:50Z",
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
                "font_type": "Arial"
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
  
val PrivateChatMessageEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "private_chat_message_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "chat_message": {
            "correlation_id": "user1-msg1",
            "timestamp": "2013-12-23T08:50Z",
            "from": {
                "id": "user1",
                "name": "Richard"
            },
            "to": {
                "id": "user2",
                "name": "Guga"
            },
            "message": {
                "text": "Hello world!",
                "lang": "en_US"
            },
            "font": {
                "color": 16711680,
                "size": 14,
                "font_type": "Arial"
            }
        }
    }
}    
  """

val BroadcastPrivateChatMessageEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "broadcast_private_chat_message_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "chat_message": {
            "id": "msg1234",
            "server_timestamp": "2013-12-23T08:50Z",
            "correlation_id": "user1-msg1",
            "user_timestamp": "2013-12-23T08:50Z",
            "from": {
                "id": "user1",
                "name": "Richard"
            },
            "to": {
                "id": "user2",
                "name": "Guga"
            },
            "message": {
                "text": "Hello world!",
                "lang": "en_US"
            },
            "font": {
                "color": 16711680,
                "size": 14,
                "font_type": "Arial"
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

val WhiteboardDrawLineEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_draw_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "shape_type": "line",
        "data": {
            "coordinate": {
                "first_x": 0.016025641025641028,
                "first_y": 0.982905982905983,
                "last_x": 1.33,
                "last_y": 2.45
            },
            "line": {
                "line_type": "solid",
                "color": 0,
                "weight": 18
            }
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}   
  """

val WhiteboardUpdateLineEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_update_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "shape_type": "line",
        "data": {
            "coordinate": {
                "first_x": 0.016025641025641028,
                "first_y": 0.982905982905983,
                "last_x": 2.33,
                "last_y": 3.45
            },
            "line": {
                "line_type": "solid",
                "color": 0,
                "weight": 18
            }
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}   
  """

val WhiteboardDrawScribbleEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_draw_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "shape_type": "scribble",
        "data": {
            "points": [
                {
                    "x": 0.016025641025641028,
                    "y": 0.982905982905983
                },
                {
                    "x": 2.33,
                    "y": 3.45
                }
            ],
            "line": {
                "line_type": "solid",
                "color": 0,
                "weight": 18
            }
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}  
  """

  val WhiteboardDrawRectangleEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_draw_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "shape_type": "rectangle",
        "data": {
            "coordinate": {
                "first_x": 0.016025641025641028,
                "first_y": 0.982905982905983,
                "last_x": 1.33,
                "last_y": 2.45
            },
            "line": {
                "line_type": "solid",
                "color": 0,
                "weight": 18
            },
            "background": {
                "visible": true,
                "color": 16777215,
                "alpha": 0
            },
            "square": false
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """ 
    
  val WhiteboardUpdateRectangleEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_update_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "shape_type": "rectangle",
        "data": {
            "coordinate": {
                "first_x": 0.016025641025641028,
                "first_y": 0.982905982905983,
                "last_x": 2.33,
                "last_y": 3.45
            },
            "line": {
                "line_type": "solid",
                "color": 0,
                "weight": 18
            },
            "background": {
                "visible": true,
                "color": 16777215,
                "alpha": 0
            },
            "square": false
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """

  val WhiteboardDrawEllipseEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_draw_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "shape_type": "ellipse",
        "data": {
            "coordinate": {
                "first_x": 0.016025641025641028,
                "first_y": 0.982905982905983,
                "last_x": 1.33,
                "last_y": 2.45
            },
            "line": {
                "line_type": "solid",
                "color": 0,
                "weight": 18
            },
            "background": {
                "visible": true,
                "color": 16777215,
                "alpha": 0
            },
            "circle": false
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """ 
    
  val WhiteboardUpdateEllipseleEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_update_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "shape_type": "ellipse",
        "data": {
            "coordinate": {
                "first_x": 0.016025641025641028,
                "first_y": 0.982905982905983,
                "last_x": 2.33,
                "last_y": 3.45
            },
            "line": {
                "line_type": "solid",
                "color": 0,
                "weight": 18
            },
            "background": {
                "visible": true,
                "color": 16777215,
                "alpha": 0
            },
            "circle": false
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """

  val WhiteboardDrawTriangleEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_draw_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "shape_type": "triangle",
        "data": {
            "coordinate": {
                "first_x": 0.016025641025641028,
                "first_y": 0.982905982905983,
                "last_x": 1.33,
                "last_y": 2.45
            },
            "line": {
                "line_type": "solid",
                "color": 0,
                "weight": 18
            },
            "background": {
                "visible": true,
                "color": 16777215,
                "alpha": 0
            }
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """ 
    
  val WhiteboardUpdateTriangleleEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_update_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "shape_type": "triangle",
        "data": {
            "coordinate": {
                "first_x": 0.016025641025641028,
                "first_y": 0.982905982905983,
                "last_x": 2.33,
                "last_y": 3.45
            },
            "line": {
                "line_type": "solid",
                "color": 0,
                "weight": 18
            },
            "background": {
                "visible": true,
                "color": 16777215,
                "alpha": 0
            }
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """
    
  val WhiteboardDrawTextEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_draw_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
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
    
  val WhiteboardUpdateTextEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_draw_update_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
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
    
  val BroadcastWhiteboardDrawTextEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "broadcast_whiteboard_draw_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "timestamp": "2013-12-23T08:50Z",
        "zorder": 100,
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
    
  val BroadcastWhiteboardUpdateTextEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "broadcast_whiteboard_draw_update_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "presentation_id/page_num",
        "shape_id": "q779ogycfmxk-13-1383262166102",
        "timestamp": "2013-12-23T08:50Z",
        "zorder": 100,
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

    
    
val WhiteboardCursorEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "whiteboard_cursor_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "user1-shape-1",
        "cursor": {
            "x": 0.54,
            "y": 0.98
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}  
  """
  
val BroadcastWhiteboardCursorEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "broadcast_whiteboard_cursor_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "whiteboard_id": "user1-shape-1",
        "cursor": {
            "x": 0.54,
            "y": 0.98
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}  
  """  
  
val SharePresentationEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "share_presentation_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "presentation": {
            "id": "pres-123",
            "name": "Flight School"
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}
  """
  
val BroadcastSharePresentationEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "broadcast_share_presentation_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "presentation": {
            "id": "pres-123",
            "name": "Flight School"
        },
        "page": {
            "id": "pres-123/1",
            "uri": "http://www.example.com/presentations/pres-123/1.swf",
            "position": {
                "x_offset": 0,
                "y_offset": 0,
                "width_ratio": 100,
                "height_ratio": 100
            }
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}  
  
  """
  
val ResizeAndMovePagePageEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "resize_and_move_page_presentation_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "presentation": {
            "id": "pres-123",
            "name": "Flight School"
        },
        "page": {
            "id": "pres-123/1",
            "uri": "http://www.example.com/presentations/pres-123/1.swf",
            "position": {
                "x_offset": 0,
                "y_offset": 0,
                "width_ratio": 100,
                "height_ratio": 100
            }
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}  
  
  """  
  
val BroadcastResizeAndMovePagePageEventJson = """
{
    "header": {
        "destination": {
            "to": "apps_channel"
        },
        "name": "broadcast_resize_and_move_page_presentation_event",
        "timestamp": "2013-12-23T08:50Z",
        "source": "bbb-apps"
    },
    "payload": {
        "presentation": {
            "id": "pres-123",
            "name": "Flight School"
        },
        "page": {
            "id": "pres-123/1",
            "uri": "http://www.example.com/presentations/pres-123/1.swf",
            "position": {
                "x_offset": 0,
                "y_offset": 0,
                "width_ratio": 100,
                "height_ratio": 100
            }
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }
    }
}  
  
  """  
}