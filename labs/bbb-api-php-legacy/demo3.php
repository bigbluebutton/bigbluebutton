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

$meetings['ENGL-2013'] =  		array('meetingID' => 'ENGL-2013',		'display' => 'ENGL-2013: Research Methods in English', 	'moderatorPW' => "prof123", 'attendeePW' => 'student123');
$meetings['ENGL-2213'] =  		array('meetingID' => 'ENGL-2213', 		'display' => 'ENGL-2213: Drama Production I',			'moderatorPW' => "prof123", 'attendeePW' => 'student123');
$meetings['ENGL-2023'] =  		array('meetingID' => 'ENGL-2023', 		'display' => 'ENGL-2023: Survey of English Literature',	'moderatorPW' => "prof123", 'attendeePW' => 'student123');
$meetings['LAW-1323'] =  		array('meetingID' => 'LAW-1323', 		'display' => 'LAW-1323: Fundamentals of Advocacy', 		'moderatorPW' => "prof123", 'attendeePW' => 'student123');
$meetings['LAW-2273'] =  		array('meetingID' => 'LAW-2273', 		'display' => 'LAW-2273: Business Organizations', 		'moderatorPW' => "prof123", 'attendeePW' => 'student123');
$meetings['LAW-3113'] =  		array('meetingID' => 'LAW-3113', 		'display' => 'LAW-3113: Corporate Finance',				'moderatorPW' => "prof123", 'attendeePW' => 'student123');
$meetings['VOH-SteveStoyan'] =  array('meetingID' => 'VOH-SteveStoyan', 'display' => 'Virtual Office Hours - Steve Stoyan',		'moderatorPW' => "prof123", 'attendeePW' => 'student123');
$meetings['VOH-MikeSmith'] =  	array('meetingID' => 'VOH-MikeSmith',	'display' => 'Virtual Office Hours - Mike Smith',		'moderatorPW' => "prof123", 'attendeePW' => 'student123');
$meetings['VOH-TonyRomo'] =  	array('meetingID' => 'VOH-TonyRomo', 	'display' => 'Virtual Office Hours - Tony Romo', 		'moderatorPW' => "prof123", 'attendeePW' => 'student123');

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Join a Selected Course</title>
</head>
<body>
<br />
<?php
if ( $_REQUEST['action'] == 'Join' && trim($_REQUEST['username']) && trim($_REQUEST['meetingID']) && trim($_REQUEST['password']) ){

	$meetingID = trim($_REQUEST['meetingID']);
	$username = trim($_REQUEST['username']);
	$password = trim($_REQUEST['password']);

	$meeting = $meetings[$meetingID];
	if($password == $meeting['moderatorPW'] || $password == $meeting['attendeePW']){
		$response = BigBlueButton::createMeetingArray($_REQUEST['username'], $meetingID, null, $meeting['moderatorPW'], $meeting['attendeePW'], $salt, $url, "http://bigbluebutton.org");

		//Analyzes the bigbluebutton server's response
		if(!$response){//If the server is unreachable
			$msg = 'Unable to join the meeting. Please check the url of the bigbluebutton server AND check to see if the bigbluebutton server is running.';
		}
		else if( $response['returncode'] == 'FAILED' ) { //The meeting was not created
			if($response['messageKey'] == 'checksumError'){
				$msg =  'A checksum error occured. Make sure you entered the correct salt.';
			}
			else{
				$msg = $response['message'];
			}
		}
		else{ //The meeting was created, and the user will now be joined
			$bbb_joinURL = BigBlueButton::joinURL($meetingID, $_REQUEST['username'],$password, $salt, $url);
			?><script type="text/javascript"> window.location = "<?php echo $bbb_joinURL; ?>";</script><?php
			return;
		}
	}
	else{
		$msg = 'Incorrect Password';
	}
}
else if($_REQUEST['action'] == 'Join'){
	$msg = "All fields need to be filled";
}

include('demo_header.php');
?>
<h2>Demo #3: Join a Selected Course (Password Required)</h2>
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
			<td>
				Select a Course: 
			</td>
			<td>
				<select name="meetingID">
					<?php 
						foreach($meetings as $meeting){
							echo "<option value='".$meeting['meetingID']."'>".$meeting['display']."</option>";
						}
					?>
				</select>
			</td>
		</tr>
		<tr>
			<td>
				Password: 
			</td>
			<td>
				<input type="text"	name="password" />
			</td>
		</tr>
		<tr> 
			<td />
			<td>
				<input type="submit" name="action" value="Join" />
			</td>
		</tr>
	</table>
</form>

Passwords:
<ul>
	<li>
		prof123 - login as a professor (moderator privileges)
	</li>
	<li>
		student123 - login as a student (attendee privileges)
	</li>
</ul>
<?php
include('demo_footer.php');
?>
</body>
</html>