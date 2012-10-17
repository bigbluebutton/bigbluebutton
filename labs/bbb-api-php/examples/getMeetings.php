<?php

/* _____ PHP Big Blue Button API Usage ______
* by Peter Mentzer peter@petermentzerdesign.com
* Use, modify and distribute however you like.
*/

// Require the bbb-api file:
require_once('../includes/bbb-api.php');

// Instatiate the BBB class:
$bbb = new BigBlueButton();

/* ___________ GET MEETINGS FROM BBB SERVER ______ */
/* 
*/

/* 
---DEBUG - useful for manually checking the raw xml results.
$test = $bbb->getGetMeetingsUrl();
echo $test;
 ---END DEBUG 
*/

$itsAllGood = true;
try {$result = $bbb->getMeetingsWithXmlResponseArray();}
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
		if ($result['returncode'] == 'SUCCESS') {
			// Then do stuff ...
			echo "<p>We got some meeting info from BBB:</p>";
			// You can parse this array how you like. For now we just do this:
			print_r($result);
		}
		else {
			echo "<p>We didn't get a success response. Instead we got this:</p>";
			print_r($result);
		}
	}
}

?>