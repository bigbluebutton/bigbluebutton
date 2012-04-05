<?php
/*
Copyright 2010 BigBlueButton 

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
   1.1  --  Updated by Omar Shammas
                    (email : omar DOT shammas [a t ] g m ail DOT .com)

*/

require('bbb_api.php');
require('bbb_api_conf.php'); //enter the salt, and url in this file
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
	<title>Join a Course</title>
</head>
<body>
<br />

<?php
if ($_REQUEST['action'] == 'Join' && trim($_REQUEST['username'])){
	
	//Calls endMeeting on the bigbluebutton server
	$response = BigBlueButton::createMeetingArray($_REQUEST['username'], "Demo Meeting", null, "mp", "ap", $salt, $url, "http://bigbluebutton.org");
	
	//Analyzes the bigbluebutton server's response
	if(!$response){//If the server is unreachable
		$msg = 'Unable to join the meeting. Please check the url of the bigbluebutton server AND check to see if the bigbluebutton server is running.';
	}
	else if( $response['returncode'] == 'FAILED' ) { //The meeting was not created
		if($response['messageKey'] == 'checksumError'){
			$msg = 'A checksum error occured. Make sure you entered the correct salt.';
		}
		else{
			$msg = $response['message'];
		}
	}
	else{ //The meeting was created, and the user will now be joined
		$bbb_joinURL = BigBlueButton::joinURL("Demo Meeting", $_REQUEST['username'],"mp", $salt, $url);
		?><script type="text/javascript"> window.location = "<?php echo $bbb_joinURL; ?>";</script><?php
		return;
	}
}
else if($_REQUEST['action'] == 'Join'){
	$msg = "You must enter your name.";
}

include('demo_header.php');
?>
<h2>Demo #1: Join a Course</h2>
<?php
	if($msg) echo '<p style="color:red;"><strong>'.$msg.'</strong></p>';
?>
<form name="form1" method="get">
	<table cellspacing="7" cellpadding="7">
		<tr>
			<td>
				Enter your name: 
			</td>
			<td>
				<input type="text"	name="username" />
			</td>
		</tr>
		<tr>
			<td></td>
			<td>
				<input type="submit" name="action" value="Join" />
			</td>
		</tr>
	</table>
</form>

<?php
include('demo_footer.php');
?>

</body>
</html>
