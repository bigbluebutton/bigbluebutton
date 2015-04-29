<?php

/* _____ PHP Big Blue Button API Usage ______
* by Peter Mentzer peter@petermentzerdesign.com
* Use, modify and distribute however you like.
*/

// Require the bbb-api file:
require_once('../includes/bbb-api.php');


// Instatiate the BBB class:
$bbb = new BigBlueButton();

/* ___________ CREATE MEETING w/ OPTIONS ______ */
/* 
*/
$creationParams = array(
	'meetingId' => '1234', 					// REQUIRED
	'meetingName' => 'Test Meeting Name', 	// REQUIRED
	'attendeePw' => 'ap', 					// Match this value in getJoinMeetingURL() to join as attendee.
	'moderatorPw' => 'mp', 					// Match this value in getJoinMeetingURL() to join as moderator.
	'welcomeMsg' => '', 					// ''= use default. Change to customize.
	'dialNumber' => '', 					// The main number to call into. Optional.
	'voiceBridge' => '12345', 				// 5 digit PIN to join voice conference.  Required.
	'webVoice' => '', 						// Alphanumeric to join voice. Optional.
	'logoutUrl' => '', 						// Default in bigbluebutton.properties. Optional.
	'maxParticipants' => '-1', 				// Optional. -1 = unlimitted. Not supported in BBB. [number]
	'record' => 'false', 					// New. 'true' will tell BBB to record the meeting.
	'duration' => '0', 						// Default = 0 which means no set duration in minutes. [number]
	//'meta_category' => '', 				// Use to pass additional info to BBB server. See API docs.
);

// Create the meeting and get back a response:
$itsAllGood = true;
try {$result = $bbb->createMeetingWithXmlResponseArray($creationParams);}
	catch (Exception $e) {
		echo 'Caught exception: ', $e->getMessage(), "\n";
		$itsAllGood = false;
	}

if ($itsAllGood == true) {
	// If it's all good, then we've interfaced with our BBB php api OK:
	if ($result == null) {
		// If we get a null response, then we're not getting any XML back from BBB.
		echo "Failed to get any response. Maybe we can't contact the BBB server.";
	}	
	else { 
	// We got an XML response, so let's see what it says:
	print_r($result);
		if ($result['returncode'] == 'SUCCESS') {
			// Then do stuff ...
			echo "<p>Meeting succesfullly created.</p>";
		}
		else {
			echo "<p>Meeting creation failed.</p>";
		}
	}
}

?>
