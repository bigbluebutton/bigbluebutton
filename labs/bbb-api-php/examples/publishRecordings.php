<?php

/* _____ PHP Big Blue Button API Usage ______
* by Peter Mentzer peter@petermentzerdesign.com
* Use, modify and distribute however you like.
*/

// Require the bbb-api file:
require_once('../includes/bbb-api.php');


// Instatiate the BBB class:
$bbb = new BigBlueButton();

/* ___________ PUBLISH RECORDINGS ______ */
/* Pass a recordId and true/false to publish or unpublish a recording.
*/

$recordingParams = array(
	/* 
	* NOTE: Set the recordId below to a valid id after you have created a recorded meeting, 
	* and received back a real recordID back from your BBB server using the 
	* getRecordingsWithXmlResponseArray method.
	*/
	
	// REQUIRED - We have to know which recording:
	'recordId' => '8cb2237d0679ca88db6464eac60da96345513964-1333379469215', 			
	'publish' => 'true',		// REQUIRED - To publish or not to publish.

);

// Now do it:
$itsAllGood = true;
try {$result = $bbb->publishRecordingsWithXmlResponseArray($recordingParams);}
	catch (Exception $e) {
		echo 'Caught exception: ', $e->getMessage(), "\n";
		$itsAllGood = false;
	}

if ($itsAllGood == true) {
	//Output results to see what we're getting:
	print_r($result);
}	
?>