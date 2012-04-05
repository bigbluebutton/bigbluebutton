<?php

/* _____ PHP Big Blue Button API Usage ______
* by Peter Mentzer peter@petermentzerdesign.com
* Use, modify and distribute however you like.
*/

// Require the bbb-api file:
require_once('../includes/bbb-api.php');


// Instatiate the BBB class:
$bbb = new BigBlueButton();

/* ___________ GET MEETING INFO ______ */
/* Get meeting info based on meeting id.
*/

$infoParams = array(
	'meetingId' => '1234', 		// REQUIRED - We have to know which meeting.
	'password' => 'mp',			// REQUIRED - Must match moderator pass for meeting.

);

// Now get meeting info and display it:
$itsAllGood = true;
try {$result = $bbb->getMeetingInfoWithXmlResponseArray($infoParams);}
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
		var_dump($result);
			if (!isset($result['messageKey'])) {
				// Then do stuff ...
				echo "<p>Meeting info was found on the server.</p>";
			}
			else {
				echo "<p>Failed to get meeting info.</p>";
			}
		}
	}	
?>