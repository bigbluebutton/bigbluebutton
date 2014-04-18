package org.bigbluebutton.core.api

object MessageNames {
  val CREATE_MEETING                       = "create_meeting_request"
  val INITIALIZE_MEETING                   = "initialize_meeting_request"
  val DESTROY_MEETING                      = "destroy_meeting_request"
  val START_MEETING                        = "start_meeting_request"
  val END_MEETING                          = "end_meeting_request"
  val VALIDATE_AUTH_TOKEN                  = "validate_auth_token_request"
  val REGISTER_USER                        = "register_user_request"
  val USER_JOINING                         = "user_joining_request"
  val USER_LEAVING                         = "user_leaving_request"
  val GET_USERS                            = "get_users_request"
  val RAISE_HAND                           = "user_raise_hand_request"
  val LOWER_HAND                           = "user_lower_hand_request"
  
}