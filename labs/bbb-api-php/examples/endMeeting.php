<?php

/* _____ PHP Big Blue Button API Usage ______
* by Peter Mentzer peter@petermentzerdesign.com
* Use, modify and distribute however you like.
*/

// Require the bbb-api file:
require_once('../includes/bbb-api.php');

// Instatiate the BBB class:
$bbb = new BigBlueButton();

/* ___________ END A MEETING ______ */
/* Determine the meeting to end via meetingId and end it.
*/

$endParams = array(
	'meetingId' => '1234', 			// REQUIRED - We have to know which meeting to end.
	'password' => 'mp',				// REQUIRED - Must match moderator pass for meeting.

);

// Get the URL to end a meeting:
$itsAllGood = true;
try {$result = $bbb->endMeetingWithXmlResponseArray($endParams);}
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
				echo "<p>Meeting succesfullly ended.</p>";
			}
			else {
				echo "<p>Failed to end meeting.</p>";
			}
		}
	}	
?>