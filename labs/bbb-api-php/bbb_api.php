<?php
/*
Copyright 2010 Blindside Networks

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

Versions:
   1.0  --  Initial version written by DJP
                   (email: djp [a t ]  architectes DOT .org)
   1.1  --  Updated by Omar Shammas and Sebastian Schneider
                    (email : omar DOT shammas [a t ] g m ail DOT com)
                    (email : seb DOT sschneider [ a t ] g m ail DOT com)
   1.2  --  Updated by Omar Shammas
                    (email : omar DOT shammas [a t ] g m ail DOT com)
   1.3  --  Updated by Matthew Dumas
					(email : matthew DOT dumas [a]t rip[ple] [compu]t ing DOT com
*/

function bbb_wrap_simplexml_load_file($url){
	
	if (extension_loaded('curl')) {
		$ch = curl_init() or die ( curl_error() );
		$timeout = 10;
		curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false);	
		curl_setopt( $ch, CURLOPT_URL, $url );
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
		curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, $timeout);
		$data = curl_exec( $ch );
		curl_close( $ch );
		
		if($data)
			return (new SimpleXMLElement($data));
		else
			return false;
	}
	
	return (simplexml_load_file($url));	
}



/*
@param
$userName = userName AND meetingID (string) 
$welcomeString = welcome message (string)

$modPW = moderator password (string)
$vPW = viewer password (string)
$voiceBridge = voice bridge (integer)
$logout = logout url (url)
*/
// create a meeting and return the url to join as moderator


// TODO::
// create some set methods 
class BigBlueButton {
	
	var $userName = array();
	var $meetingID; // the meeting id
	
	var $welcomeString;
	// the next 2 fields are maybe not needed?!?
	var $modPW; // the moderator password 
	var $attPW; // the attendee pw
	
	var $securitySalt; // the security salt; gets encrypted with sha1
	var $URL; // the url the bigbluebutton server is installed
	var $sessionURL; // the url for the administrator to join the sessoin
	var $userURL;
	
	var $conferenceIsRunning = false;
	
	// this constructor is used to create a BigBlueButton Object
	// use this object to create servers
	// Use is either 0 arguments or all 7 arguments
	public function __construct() {
		$numargs = func_num_args();

		if( $numargs == 0 ) {
		#	echo "Constructor created";
		}
		// pass the information to the class variables
		else if( $numargs >= 6 ) {
			$this->userName = func_get_arg(0);
			$this->meetingID = func_get_arg(1);
			$this->welcomeString = func_get_arg(2);
			$this->modPW = func_get_arg(3);
			$this->attPW = func_get_arg(4);
			$this->securitySalt = func_get_arg(5);
			$this->URL = func_get_arg(6);
			

			$arg_list = func_get_args();
			#debug output for the number of arguments
			    	// for ($i = 0; $i < $numargs; $i++) {
			        	// echo "Argument $i is: " . $arg_list[$i] . "<br />\n";
			    	// }
				
			    // $this->createMeeting( $this->userName, $this->meetingID, $this->welcomeString, $this->modPW, $this->attPW, $this->securitySalt, $this->URL );
			   // echo "Object created";
				 // echo '<br />';
		}// end else if
	}
	
	//------------------------------------------------GET URLs-------------------------------------------------
	/**
	*This method returns the url to join the specified meeting.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param username -- the display name to be used when the user joins the meeting
	*@param PW -- the attendee or moderator password of the meeting
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return The url to join the meeting
	*/
	public function joinURL( $meetingID, $userName, $PW, $SALT, $URL ) {
		$url_join = $URL."api/join?";
		$params = 'meetingID='.urlencode($meetingID).'&fullName='.urlencode($userName).'&password='.urlencode($PW);
		return ($url_join.$params.'&checksum='.sha1("join".$params.$SALT) );
	}
	/**
	*This method returns the url to join the specified meeting.
	*
	*@param name -- a name fot the meeting
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param attendeePW -- the attendee of the meeting
	*@param moderatorPW -- the moderator of the meeting
	*@param welcome -- the welcome message that gets displayed on the chat window
	*@param logoutURL -- the URL that the bbb client will go to after users logouut
	*@param dialNumber=NULL -- The dial access number that participants can call in using regular phone (Optional)
	*@param voiceBridge=NULL -- The voice conference number that participants enter to join voice conference (optional) 
	*@param webVoice=NULL -- The voice conference alphanumeric that participants enter to join the video conference (optional)
	*@param logoutURL -- the URL that the bbb client will go to after users logout (optional)
	*@param maxParticipants=-1 -- Max number of participants allowed in the call (optional, negative is unlimited)
	*@param record=false -- Whether or not the conference is recorded. (optional)
	*@param duration=0 -- Duration of the meeting. BBB Automatically ends the meeting at this point. (optional)
	*@param meta=NULL -- A URL formatted set of extra parameters to define information about the meeting (optional)
					  -- 
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return The url to join the meeting
	*/
	public function createMeetingURL($name, $meetingID, $attendeePW, $moderatorPW, $welcome, $dialNumber=NULL, $voiceBridge=NULL, $webVoice=NULL, $logoutURL, $maxParticipants=-1, $record=false, $duration=0, $meta=NULL, $SALT, $URL ) {
		$url_create = $URL."api/create?";
		
		if ($voiceBridge === NULL) {
				$voiceBridge = 70000 + rand(0, 9999);
		}
		

		$params = 'name='.urlencode($name).'&meetingID='.urlencode($meetingID).'&attendeePW='.urlencode($attendeePW).'&moderatorPW='.urlencode($moderatorPW).'&voiceBridge='.$voiceBridge.'&logoutURL='.urlencode($logoutURL);

		if( trim( $welcome ) ) 
			$params .= '&welcome='.urlencode($welcome);

		if( trim( $dialNumber ) ) 
			$params .= '&dialNumber='.urlencode($dialNumber);
		if( trim( $webVoice ) ) 
			$params .= '&webVoice='.urlencode($webVoice);
		if( trim( $maxParticipants ) ) 
			$params .= '&maxParticipants='.urlencode($maxParticipants);
		if( trim( $record ) && ($record == "true" || $record == "false")) 
			$params .= '&record='.urlencode($record);
		if( trim( $duration )) 
			$params .= '&duration='.urlencode($duration);
		if( trim( $meta )) 
			$params .= '&'.$meta;
					
	
		return ( $url_create.$params.'&checksum='.sha1("create".$params.$SALT) );
	}
	
	
	/**
	*This method returns the url to check if the specified meeting is running.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return The url to check if the specified meeting is running.
	*/
	public function isMeetingRunningURL( $meetingID, $URL, $SALT ) {
		$base_url = $URL."api/isMeetingRunning?";
		$params = 'meetingID='.urlencode($meetingID);
		return ($base_url.$params.'&checksum='.sha1("isMeetingRunning".$params.$SALT) );	
	}

	/**
	*This method returns the url to getMeetingInfo of the specified meeting.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param modPW -- the moderator password of the meeting
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return The url to check if the specified meeting is running.
	*/
	public function getMeetingInfoURL( $meetingID, $modPW, $URL, $SALT ) {
		$base_url = $URL."api/getMeetingInfo?";
		$params = 'meetingID='.urlencode($meetingID).'&password='.urlencode($modPW);
		return ( $base_url.$params.'&checksum='.sha1("getMeetingInfo".$params.$SALT));	
	}
	
	/**
	*This method returns the url for listing all meetings in the bigbluebutton server.
	*
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return The url of getMeetings.
	*/
	public function getMeetingsURL($URL, $SALT) { 
		$base_url = $URL."api/getMeetings?";
		$params = 'random='.(rand() * 1000 );
		return ( $base_url.$params.'&checksum='.sha1("getMeetings".$params.$SALT));
	}

	/**
	*This method returns the url to end the specified meeting.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param modPW -- the moderator password of the meeting
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return The url to end the specified meeting.
	*/
	public function endMeetingURL( $meetingID, $modPW, $URL, $SALT ) {
		$base_url = $URL."api/end?";
		$params = 'meetingID='.urlencode($meetingID).'&password='.urlencode($modPW);
		return ( $base_url.$params.'&checksum='.sha1("end".$params.$SALT) );
	}	
	
	//-----------------------------------------------CREATE----------------------------------------------------
	/**
	*This method creates a meeting and returns the join url for moderators.
	*
	*@param username -- the name of the user for joining the meeting
	*@param name -- a name for the meeting
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param attendeePW -- the attendee of the meeting
	*@param moderatorPW -- the moderator of the meeting
	*@param welcome -- the welcome message that gets displayed on the chat window
	*@param logoutURL -- the URL that the bbb client will go to after users logouut
	*@param dialNumber=NULL -- The dial access number that participants can call in using regular phone (Optional)
	*@param voiceBridge=NULL -- The voice conference number that participants enter to join voice conference (optional) 
	*@param webVoice=NULL -- The voice conference alphanumeric that participants enter to join the video conference (optional)
	*@param logoutURL -- the URL that the bbb client will go to after users logout (optional)
	*@param maxParticipants=-1 -- Max number of participants allowed in the call (optional, negative is unlimited)
	*@param record=false -- Whether or not the conference is recorded. (optional)
	*@param duration=0 -- Duration of the meeting. BBB Automatically ends the meeting at this point. (optional)
	*@param meta=NULL -- A URL formatted set of extra parameters to define information about the meeting (optional)
	*
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return The joinURL if successful or an error message if unsuccessful
	*/
	public function createMeetingAndGetJoinURL( $username, $name, $meetingID, $attendeePW, $moderatorPW, $welcome, $dialNumber, $voiceBridge, $webVoice, $logoutURL, $maxParticipants, $record, $duration, $meta, $SALT, $URL ){
			
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::createMeetingURL($name, $meetingID, $attendeePW, $moderatorPW, $welcome, $dialNumber, $voiceBridge, $webVoice, $logoutURL, $maxParticipants, $record, $duration, $meta, $SALT, $URL ));
		
		if( $xml && $xml->returncode == 'SUCCESS' ) {
			return ( BigBlueButton::joinURL( $meetingID, $username, $moderatorPW, $SALT, $URL ) );
		}	
		else if( $xml ) {
			return ( $xml->messageKey.' : '.$xml->message );
		}
		else {
			return ('Unable to fetch URL '.$url_create.$params.'&checksum='.sha1("create".$params.$SALT) );
		}
	}
	
	/**
	*This method creates a meeting and return an array of the xml packet
	*
	*@param username -- the name of the user for joining the meeting
	*@param name -- a name fot the meeting
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param attendeePW -- the attendee of the meeting
	*@param moderatorPW -- the moderator of the meeting
	*@param welcome -- the welcome message that gets displayed on the chat window
	*@param logoutURL -- the URL that the bbb client will go to after users logouut
	*@param dialNumber=NULL -- The dial access number that participants can call in using regular phone (Optional)
	*@param voiceBridge=NULL -- The voice conference number that participants enter to join voice conference (optional) 
	*@param webVoice=NULL -- The voice conference alphanumeric that participants enter to join the video conference (optional)
	*@param logoutURL -- the URL that the bbb client will go to after users logout (optional)
	*@param maxParticipants=-1 -- Max number of participants allowed in the call (optional, negative is unlimited)
	*@param record=false -- Whether or not the conference is recorded. (optional)
	*@param duration=0 -- Duration of the meeting. BBB Automatically ends the meeting at this point. (optional)
	*@param meta=NULL -- A URL formatted set of extra parameters to define information about the meeting (optional)
	*
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return
	*	- Null if unable to reach the bigbluebutton server
	*	- If failed it returns an array containing a returncode, messageKey, message. 
	*	- If success it returns an array containing a returncode, messageKey, message, meetingID, attendeePW, moderatorPW, hasBeenForciblyEnded.
	*/
	public function createMeetingArray($username, $name, $meetingID, $attendeePW, $moderatorPW, $welcome, $dialNumber, $voiceBridge, $webVoice, $logoutURL, $maxParticipants, $record, $duration, $meta, $SALT, $URL ){// $username, $meetingID, $welcomeString, $mPW, $aPW, $SALT, $URL, $logoutURL ) {

		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::createMeetingURL($username, $name, $meetingID, $attendeePW, $moderatorPW, $welcome, $dialNumber, $voiceBridge, $webVoice, $logoutURL, $maxParticipants, $record, $duration, $meta, $SALT, $URL  ) );

		if( $xml ) {
			if($xml->meetingID) return array('returncode' => $xml->returncode, 'message' => $xml->message, 'messageKey' => $xml->messageKey, 'meetingID' => $xml->meetingID, 'attendeePW' => $xml->attendeePW, 'moderatorPW' => $xml->moderatorPW, 'hasBeenForciblyEnded' => $xml->hasBeenForciblyEnded );
			else return array('returncode' => $xml->returncode, 'message' => $xml->message, 'messageKey' => $xml->messageKey );
		}
		else {
			return null;
		}
	}	
	
	
	//-------------------------------------------getMeetingInfo---------------------------------------------------
	/**
	*This method calls the getMeetingInfo on the bigbluebutton server and returns an xml packet.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param modPW -- the moderator password of the meeting
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return An xml packet. 
	*	If failed it returns an xml packet containing a returncode, messagekey, and message. 
	*	If success it returnsan xml packet containing a returncode, 
	*/
	public function getMeetingInfo( $meetingID, $modPW, $URL, $SALT ) {
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::getMeetingInfoURL( $meetingID, $modPW, $URL, $SALT ) );
		if($xml){
			return ( str_replace('</response>', '', str_replace("<?xml version=\"1.0\"?>\n<response>", '', $xml->asXML())));
		}
		return false;
	}

	/**
	*This method calls the getMeetingInfo on the bigbluebutton server and returns an array.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param modPW -- the moderator password of the meeting
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return An Array. 
	*	- Null if unable to reach the bigbluebutton server
	*	- If failed it returns an array containing a returncode, messagekey, message. 
	*	- If success it returns an array containing a meetingID, moderatorPW, attendeePW, hasBeenForciblyEnded, running, startTime, endTime,  
		  participantCount, moderatorCount, attendees.
	*/
	public function getMeetingInfoArray( $meetingID, $modPW, $URL, $SALT ) {
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::getMeetingInfoURL( $meetingID, $modPW, $URL, $SALT ) );
				
		if( $xml && $xml->returncode == 'SUCCESS' && $xml->messageKey == null){//The meetings were returned
			return array('returncode' => $xml->returncode, 'message' => $xml->message, 'messageKey' => $xml->messageKey );
		}
		else if($xml && $xml->returncode == 'SUCCESS'){ //If there were meetings already created
			return array( 'meetingID' => $xml->meetingID, 'moderatorPW' => $xml->moderatorPW, 'attendeePW' => $xml->attendeePW, 'hasBeenForciblyEnded' => $xml->hasBeenForciblyEnded, 'running' => $xml->running, 'startTime' => $xml->startTime, 'endTime' => $xml->endTime, 'participantCount' => $xml->participantCount, 'moderatorCount' => $xml->moderatorCount, 'attendees' => $xml->attendees );
		}
		else if( ($xml && $xml->returncode == 'FAILED') || $xml) { //If the xml packet returned failure it displays the message to the user
			return array('returncode' => $xml->returncode, 'message' => $xml->message, 'messageKey' => $xml->messageKey);
		}
		else { //If the server is unreachable, then prompts the user of the necessary action
			return null;
		}

	}
	
	//-----------------------------------------------getMeetings------------------------------------------------------
	/**
	*This method calls getMeetings on the bigbluebutton server, then calls getMeetingInfo for each meeting and concatenates the result.
	*
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*
	*@return 
	*	- If failed then returns a boolean of false.
	*	- If succeeded then returns an xml of all the meetings.
	*/
	public function getMeetings( $URL, $SALT ) {
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::getMeetingsURL( $URL, $SALT ) );
		if( $xml && $xml->returncode == 'SUCCESS' ) {
			if( $xml->messageKey )
				return ( $xml->message->asXML() );	
			ob_start();
			echo '<meetings>';
			if( count( $xml->meetings ) && count( $xml->meetings->meeting ) ) {
				foreach ($xml->meetings->meeting as $meeting)
				{
					echo '<meeting>';
					echo BigBlueButton::getMeetingInfo($meeting->meetingID, $meeting->moderatorPW, $URL, $SALT);
					echo '</meeting>';
				}
			}
			echo '</meetings>';
			return (ob_get_clean());
		}
		else {
			return (false);
		}
	}

	/**
	*This method calls getMeetings on the bigbluebutton server, then calls getMeetingInfo for each meeting and concatenates the result.
	*
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*
	*@return 
	*	- Null if the server is unreachable
	*	- If FAILED then returns an array containing a returncode, messageKey, message.
	*	- If SUCCESS then returns an array of all the meetings. Each element in the array is an array containing a meetingID, 
		  moderatorPW, attendeePW, hasBeenForciblyEnded, running.
	*/
	public function getMeetingsArray( $URL, $SALT ) {
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::getMeetingsURL( $URL, $SALT ) );

		if( $xml && $xml->returncode == 'SUCCESS' && $xml->messageKey ) {//The meetings were returned
			return array('returncode' => $xml->returncode, 'message' => $xml->message, 'messageKey' => $xml->messageKey);
		}
		else if($xml && $xml->returncode == 'SUCCESS'){ //If there were meetings already created
		
			foreach ($xml->meetings->meeting as $meeting)
			{
            //$meetings[] = BigBlueButton::getMeetingInfo($meeting->meetingID, $meeting->moderatorPW, $URL, $SALT);
				$meetings[] = array( 'meetingID' => $meeting->meetingID, 'moderatorPW' => $meeting->moderatorPW, 'attendeePW' => $meeting->attendeePW, 'hasBeenForciblyEnded' => $meeting->hasBeenForciblyEnded, 'running' => $meeting->running );
			}

			return $meetings;

		}
		else if( $xml ) { //If the xml packet returned failure it displays the message to the user
			return array('returncode' => $xml->returncode, 'message' => $xml->message, 'messageKey' => $xml->messageKey);
		}
		else { //If the server is unreachable, then prompts the user of the necessary action
			return null;
		}
	}
	
	//----------------------------------------------getUsers---------------------------------------
	/**
	*This method prints the usernames of the attendees in the specified conference.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param modPW -- the moderator password of the meeting
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*@param UNAME -- is a boolean to determine how the username is formatted when printed. Default if false.
	*
	*@return A boolean of true if the attendees were printed successfully and false otherwise.
	*/
	public function getUsers( $meetingID, $modPW, $URL, $SALT, $UNAME = false ) {
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::getMeetingInfoURL( $meetingID, $modPW, $URL, $SALT ) );
		if( $xml && $xml->returncode == 'SUCCESS' ) {
			ob_start();
			if( count( $xml->attendees ) && count( $xml->attendees->attendee ) ) {
				foreach ( $xml->attendees->attendee as $attendee ) {
					if( $UNAME  == true ) {
						echo "User name: ".$attendee->fullName.'<br />';
					}
					else {
						echo $attendee->fullName.'<br />';
					}
				}
			}
			return (ob_end_flush());
		}
		else {
			return (false);
		}
	}
	
	/**
	*This method returns an array of the attendees in the specified meeting.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param modPW -- the moderator password of the meeting
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*
	*@return
	*	- Null if the server is unreachable.
	*	- If FAILED, returns an array containing a returncode, messageKey, message.
	*	- If SUCCESS, returns an array of array containing the userID, fullName, role of each attendee
	*/
	public function getUsersArray( $meetingID, $modPW, $URL, $SALT ) {
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::getMeetingInfoURL( $meetingID, $modPW, $URL, $SALT ) );

		if( $xml && $xml->returncode == 'SUCCESS' && $xml->messageKey == null ) {//The meetings were returned
			return array('returncode' => $xml->returncode, 'message' => $xml->message, 'messageKey' => $xml->messageKey);
		}
		else if($xml && $xml->returncode == 'SUCCESS'){ //If there were meetings already created
			foreach ($xml->attendees->attendee as $attendee){
					$users[] = array(  'userID' => $attendee->userID, 'fullName' => $attendee->fullName, 'role' => $attendee->role );
			}
			return $users;
		}
		else if( $xml ) { //If the xml packet returned failure it displays the message to the user
			return array('returncode' => $xml->returncode, 'message' => $xml->message, 'messageKey' => $xml->messageKey);
		}
		else { //If the server is unreachable, then prompts the user of the necessary action
			return null;
		}
	}
	
		
	//------------------------------------------------Other Methods------------------------------------
	/**
	*This method calls end meeting on the specified meeting in the bigbluebutton server.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param modPW -- the moderator password of the meeting
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return
	*	- Null if the server is unreachable
	* 	- An array containing a returncode, messageKey, message.
	*/
	public function endMeeting( $meetingID, $modPW, $URL, $SALT ) {
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::endMeetingURL( $meetingID, $modPW, $URL, $SALT ) );

		if( $xml ) { //If the xml packet returned failure it displays the message to the user
			return array('returncode' => $xml->returncode, 'message' => $xml->message, 'messageKey' => $xml->messageKey);
		}
		else { //If the server is unreachable, then prompts the user of the necessary action
			return null;
		}

	}
	
	/**
	*This method check the BigBlueButton server to see if the meeting is running (i.e. there is someone in the meeting)
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return A boolean of true if the meeting is running and false if it is not running
	*/
	public function isMeetingRunning( $meetingID, $URL, $SALT ) {
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::isMeetingRunningURL( $meetingID, $URL, $SALT ) );
		if( $xml && $xml->returncode == 'SUCCESS' ) 
			return ( ( $xml->running == 'true' ) ? true : false);
		else
			return ( false );
	}
	
	/**
	*This method calls isMeetingRunning on the BigBlueButton server.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return 
	* 	- If SUCCESS it returns an xml packet
	* 	- If the FAILED or the server is unreachable returns a string of 'false'
	*/
	public function getMeetingXML( $meetingID, $URL, $SALT ) {
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::isMeetingRunningURL( $meetingID, $URL, $SALT ) );
		if( $xml && $xml->returncode == 'SUCCESS') 
			return ( str_replace('</response>', '', str_replace("<?xml version=\"1.0\"?>\n<response>", '', $xml->asXML())));
		else
			return 'false';	
	}

	/**
	*This method returns the URL to get a list of recordings from BigBlueButton
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*                 -- Note: if blank, this will return all recordings
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return the url to get the recordings
	*/

	public function getRecordingsURL($meetingID, $URL, $SALT) { 
		$base_url = $URL."api/getRecordings?";
		$params = "";
		if ($meetingID != "") { 
			$params = 'meetingID='.urlencode($meetingID).'&';
		}
		return ($base_url.$params.'checksum='.sha1("getRecordings".$params.$SALT) );
	}
	
	/**
	*This method calls getRecordings on the BigBlueButton server.
	*
	*@param meetingID -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*                 -- Note: if blank, this will return all recordings
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*
	*@return 
	* 	- If SUCCESS it returns an xml packet
	* 	- If the FAILED or the server is unreachable returns a string of 'false'
	*/
	public function getRecordings($meetingID, $URL, $SALT) { 
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::getRecordingsURL( $meetingID, $URL, $SALT ) );

		if( $xml && $xml->returncode == 'SUCCESS') 
			return $xml->asXML(); 
		else
			return 'false';	
	}
	
	
	
	
	// TODO: WRITE AN ITERATOR WHICH GOES OVER WHATEVER IT IS BEING TOLD IN THE API AND LIST INFORMATION
	/* we have to define at least 2 variable fields for getInformation to read out information at any position
	The first is: An identifier to chose if we look for attendees or the meetings or something else
	The second is: An identifier to chose what integrated functions are supposed to be used

	@param IDENTIFIER -- needs to be put in for the function to identify the information to print out
				 current values which can be used are 'attendee' and 'meetings'
	@param meetingID -- needs to be put in to identify the meeting
	@param modPW -- needs to be put in if the users are supposed to be shown or to retrieve information about the meetings
	@param URL -- needs to be put in the URL to the bigbluebutton server
	@param SALT -- needs to be put in for the security salt calculation

	Note: If 'meetings' is used, then only the parameters URL and SALT needs to be used
		  If 'attendee' is used, then all the parameters needs to be used
	*/
	public function getInformation( $IDENTIFIER, $meetingID, $modPW, $URL, $SALT ) {
		// if the identifier is null or '', then return false
		if( $IDENTIFIER == "" || $IDENTIFIER == null ) {
			echo "You need to type in a valid value into the identifier.";
			return false;
		}
		// if the identifier is attendee, call getUsers
		else if( $IDENTIFIER == 'attendee' ) {
			return BigBlueButton::getUsers( $meetingID, $modPW, $URL, $SALT );
		}
		// if the identifier is meetings, call getMeetings
		else if( $IDENTIFIER == 'meetings' ) {
			return BigBlueButton::getMeetings( $URL, $SALT );
		}
		// return nothing
		else {
			return true;
		}
		
	}
	
	/**
	*This method gets a list of meetingIDs that have been recorded
	*
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*
	*@return 
	* 	- If SUCCESS it returns an array of meeting IDs
	* 	- If the FAILED or the server is unreachable returns a string of 'false'
	*/
	public function getRecordedMeetingIDs($url, $salt) {
		$xml = BigBlueButton::getRecordings("", $url, $salt);
		if (preg_match("/<meetingID>.*?<\/meetingID>/",$xml,$matches)) { 
			$matches = array_values(array_unique($matches));
			return $matches;
		} else { 
			return "false" ;
		}
	}
	/**
	*This method gets the following information for all recorded meetings: 
	*                 			meta tags: 
	*								Topic 
	*								Presenter
	*								Description
	*								Keywords
	*							URLs: 
	*								Playback URL
	*								Publish URL
	*								Unpublish URL
	*							Flags: 
	*								Published
	*								
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*
	*@return 
	* 	- If SUCCESS it returns an array of meeting information structured like so:
	*          Array {
	*                 ["Course name-session name"] {
	*												[instance number] { 
	*																	["topic"] => meta_topic
	*																	["presenter"] => meta_presenter
	*																	["description"] => meta_description
	*																	["url"] => url
	*																	["keywords"] => meta_keywords
	*																	["published"] => published
	*																	["pubURL"] => BigBlueButton::publishRecordingsURL( $record, 'true', $URL, $SALT )
	*																	["unpubURL"] => BigBlueButton::publishRecordingsURL( $record, 'false', $URL, $SALT )
	*																}
	*												}
	*				}
	*
	*
	*       example:    Array { 
	*						"Intro to Astronomy-SP 2012" { 
	*															0 { 
	*																"The topic of this course is ..." 
	*																"John Doe"
	*																"Astronomy Class 1" 
	*																"http://YOURHOST/playback/slides/playback.html?meetingId=..."
	*																"blah,blah,blah,blah,blah,blah"
	*																"true"
	*																"http://YOURHOST/bigbluebutton/publish?..."
	*																"http://YOURHOST/bigbluebutton/publish?..."
	*																}
	*															1 { 
	*																"The topic of this course is ..." 
	*																"Jane Doe"
	*																"Astronomy Class 2" 
	*																"http://YOURHOST/playback/slides/playback.html?meetingId=..."
	*																"blah,blah,blah,blah,blah,blah"
	*																"true"
	*																"http://YOURHOST/bigbluebutton/publish?..."
	*																"http://YOURHOST/bigbluebutton/publish?..."
	*															}
	*														}
	*						"Intro to Astronomy-FALL 2012" { 
	*															0 { 
	*																"The topic of this course is ..." 
	*																"John Doe"
	*																"Astronomy Class 1" 
	*																"http://YOURHOST/playback/slides/playback.html?meetingId=..."
	*																"blah,blah,blah,blah,blah,blah"
	*																"true"
	*																"http://YOURHOST/bigbluebutton/publish?..."
	*																"http://YOURHOST/bigbluebutton/publish?..."
	*																}
	*														}
	*						}
	*
	*
	*
	*
	*
	* 	- If the FAILED or the server is unreachable returns a string of 'false'
	*/
	public function getRecordingsArray($URL, $SALT) {
		$xml = BigBlueButton::getRecordings("", $URL, $SALT);
		$id = "unknown";
		$topic = "unknown"; 
		$presenter = "unknown"; 
		$description = "unknown"; 
		$playback = "unknown";
		$keywords = "unknown";
		$published = "false";
		$n['unknown']=0; 
		if (preg_match_all("/<recording>.*?<\/recording>/",$xml,$matches) > 0) {
			foreach ($matches as $m) { 
				foreach ($m as $match){
					if (preg_match("/<meetingID>(.*?)<\/meetingID>/",$match,$names)) { 
							$id = $names[1];
							
							if (in_array($id,$n)){
								$n[$id] = $n[$id] + 1;
							} else { 
								$n[$id] = 0;
							}
					} 
					if (preg_match("/<topic><!\[CDATA\[(.*?)\]\]><\/topic>/",$match,$topics)) { 
							$topic = $topics[1]; 
					} 
					if (preg_match("/<presenter><!\[CDATA\[(.*?)\]\]><\/presenter>/",$match,$presenters)) { 
							$presenter = $presenters[1]; 
					}
					if (preg_match("/<description><!\[CDATA\[(.*?)\]\]><\/description>/",$match,$descriptions)) { 
							$description = $descriptions[1]; 
					} 
					if (preg_match("/<url>(.*?)<\/url>/",$match,$playbacks)) { 
							$playback = $playbacks[1]; 
					} 
					if (preg_match("/<keywords><!\[CDATA\[(.*?)\]\]><\/keywords>/",$match,$allkeywords)) { 
							$keywords = $allkeywords[1]; 
					} 
					if (preg_match("/<published>(.*?)<\/published>/",$match,$publisheds)) { 
							$published = $publisheds[1]; 
					} 
					if (preg_match("/<recordID>(.*?)<\/recordID>/",$match,$records)) { 
							$record = $records[1]; 
					} 
					$out[$id][$n[$id]]["topic"] = $topic;
					$out[$id][$n[$id]]["presenter"] = $presenter;
					$out[$id][$n[$id]]["description"] = $description;
					$out[$id][$n[$id]]["url"] = $playback;
					$out[$id][$n[$id]]["keywords"] = $keywords;
					$out[$id][$n[$id]]["published"] = $published;
					$out[$id][$n[$id]]["pubURL"] = BigBlueButton::publishRecordingsURL( $record, 'true', $URL, $SALT );
					$out[$id][$n[$id]]["unpubURL"] = BigBlueButton::publishRecordingsURL( $record, 'false', $URL, $SALT );
				}
			}
			return $out;
		} else { 
			return "false" ;
		}
	}
	
	/**
	*This method gets a list of recordIDs that have been recorded for the specific meetingID
	*
	*@param meetingID -- needs to be put in to identify the meeting
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*
	*@return 
	* 	- If SUCCESS it returns an array of recordIDs
	* 	- If the FAILED or the server is unreachable returns a string of 'false'
	*/
	public function getRecordedRecordID($meetingID, $url, $salt) {

		$xml = BigBlueButton::getRecordings("", $url, $salt);
		
		if (preg_match("/<recordID>.*?<\/recordID>/",$xml,$matches)) { 
			$vals = array_values(array_unique($matches));
			$out[$meetingID]=$vals;
			return $out;
		} else { 
			return "false" ;
		}
	}	
	
	/**
	*This method gets the URL to publish/unpublish a meeting
	*
	*@param recordID -- needs to be put in to identify the recording
	*@param publish -- needs to be put in to publish/unpublish the recording
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*
	*@return the URL to publish/unpublish recording or error message if invalid inputs.
	* 	
	*/
	public function publishRecordingsURL( $recordID, $publish='false', $URL, $SALT ) {
		if (strtolower($publish) == "false" || strtolower($publish) == "true") {  
			$base_url = $URL."api/publishRecordings?";
			$params = 'recordID='.urlencode($recordID).'&publish='.urlencode($publish);
			return ( $base_url.$params.'&checksum='.sha1("publishRecordings".$params.$SALT) );
		} else { 
			return "Publish input may only be true or false.";
		}
	}	
	
	/**
	*This method gets the URL to delete a recording
	*
	*@param recordID -- needs to be put in to delete the recording
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*
	*@return the URL to delete recording
	* 	
	*/
	public function deleteRecordingsURL( $recordID, $URL, $SALT ) {
		$base_url = $URL."api/deleteRecordings?";
		$params = 'recordID='.urlencode($recordID);
		return ( $base_url.$params.'&checksum='.sha1("deleteRecordings".$params.$SALT) );
	}	
		/**
	*This method publishes/unpublishes a meeting
	*
	*@param recordID -- needs to be put in to identify the recording
	*@param publish -- needs to be put in to publish/unpublish the recording
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*
	*@return 
	* 	- If SUCCESS it returns a string of 'true'
	* 	- If the FAILED or the server is unreachable returns a string of 'false'
	*/
	public function publishRecordings( $recordID, $publish='false', $URL, $SALT ) {
		if (strtolower($publish) == "false" || strtolower($publish) == "true") {  
			$xml = bbb_wrap_simplexml_load_file( BigBlueButton::publishRecordingsURL( $meetingID, $publish, $URL, $SALT ) );
			if( $xml && $xml->returncode == 'SUCCESS') 
				return 'true';
			else
				return 'false';	
		} else { 
			return 'false';
		}
	}	
	
	/**
	*This method deletes a recording
	*
	*@param recordID -- needs to be put in to delete the recording
	*@param URL -- the url of the bigbluebutton server
	*@param SALT -- the security salt of the bigbluebutton server
	*
	*@return 
	* 	- If SUCCESS it returns a string of 'true'
	* 	- If the FAILED or the server is unreachable returns a string of 'false'
	*/
	public function deleteRecordings( $recordID, $URL, $SALT ) {
		$xml = bbb_wrap_simplexml_load_file( BigBlueButton::deleteRecordingsURL( $meetingID, $publish, $URL, $SALT ) );
		if( $xml && $xml->returncode == 'SUCCESS') 
			return 'true';
		else
			return 'false';	
	}	
	
	function getServerIP() {
		// get the server url
		$sIP = $_SERVER['SERVER_ADDR'];
		return $serverIP = 'http://'.$sIP.'/bigbluebutton/';
	}
}
?>
