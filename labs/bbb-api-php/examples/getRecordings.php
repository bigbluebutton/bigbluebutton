<?php

/* _____ PHP Big Blue Button API Usage ______
* by Peter Mentzer peter@petermentzerdesign.com
* Use, modify and distribute however you like.
*/

// Require the bbb-api file:
require_once('../includes/bbb-api.php');


// Instatiate the BBB class:
$bbb = new BigBlueButton();

/* ___________ GET RECORDINGS INFO ______ */
/* Get recordings info based on optional meeting id, or all.
*/

$recordingsParams = array(
	'meetingId' => '', 			// OPTIONAL - comma separate if multiples

);

// Now get recordings info and display it:
$itsAllGood = true;
try {$result = $bbb->getRecordingsWithXmlResponseArray($recordingsParams);}
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
			if ($result['returncode'] == 'SUCCESS') {
				// Then do stuff ...
				echo "<p>Meeting info was found on the server.</p>";
			}
			else {
				echo "<p>Failed to get meeting info.</p>";
			}
		}
	}	
?>