<!DOCTYPE html>
<head>
	<meta http-equiv="Content-type" content="text/html; charset=utf-8">
	<title>joinIfRunning</title>
	<link type="text/css" rel="stylesheet" href="../css/main.css">
	<script type="text/javascript" charset="utf-8">
		 if(window.top==window) {
		    // you're not in a frame so you reload the site
		     window.setTimeout('location.reload()', 10000); //reloads after 10 seconds
		 } else {
		    //you're inside a frame, so you stop reloading
		 }
	</script>
</head>

<body id="joinifrunning" onload="">
<div id="main">
	<h1>Attempting to Join...</h1>
		
	<?php
	/* _____ PHP Big Blue Button API Usage ______
	* by Peter Mentzer peter@petermentzerdesign.com
	* Use, modify and distribute however you like.
	*/
	
	// Require the bbb-api file:
	require_once('../includes/bbb-api.php');
	$bbb = new BigBlueButton();
	$meetingId = '1234';
	$itsAllGood = true;
	try {$result = $bbb->isMeetingRunningWithXmlResponseArray($meetingId);}
		catch (Exception $e) {
			echo 'Caught exception: ', $e->getMessage(), "\n";
			$itsAllGood = false;
		}
	if ($itsAllGood == true) {
		//Output results to see what we're getting:
		//print_r($result);		
		$status = $result['running'];
		//echo "<p style='color:red;'>".$status."</p>";
		
		$holdMessage = '
			<div id="status">
				<p>Your meeting has not yet started. Waiting for a moderator to start the meeting...</p>
				<img src="../assets/ajax-loader.gif" alt="...contacting server..." />
				<p>You will be connected as soon as the meeting starts.</p>
			</div>
		';
				
		// The meeting is not running yet so hold your horses:
		if ($status == 'false') {
			echo $holdMessage;
		}
		else {
			//Here we redirect the user to the joinUrl.
			// For now we output this:
			echo "...User would be redirected to the meeting now at:";
			
			$joinParams = array(
				'meetingId' => '1234', 			// REQUIRED - We have to know which meeting to join.
				'username' => 'Test Attendee',	// REQUIRED - The user display name that will show in the BBB meeting.
				'password' => 'ap',				// REQUIRED - Must match either attendee or moderator pass for meeting.
				'createTime' => '',				// OPTIONAL - string
				'userId' => '',					// OPTIONAL - string
				'webVoiceConf' => ''			// OPTIONAL - string
			);

			// Get the URL to join meeting:
			$allGood = true;
			try {$result = $bbb->getJoinMeetingURL($joinParams);}
				catch (Exception $e) {
					echo 'Caught exception: ', $e->getMessage(), "\n";
					$allGood = false;
				}

			if ($allGood == true) {
				//Output resulting URL. Send user there...
				echo "<p>".$result."</p>";
			}
		}
	}	
	?>
	
	
	
	
	
</div>
</body>