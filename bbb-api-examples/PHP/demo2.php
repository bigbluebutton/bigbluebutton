<?
/*
BigBlueButton - http://www.bigbluebutton.org

Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.

BigBlueButton is free software; you can redistribute it and/or modify it under the
terms of the GNU Lesser General Public License as published by the Free Software
Foundation; either version 3 of the License, or (at your option) any later
version.

BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along
with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.

Author: DJP <DJP@architectes.org>

*/

require('bbb_api.inc.php');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Join a Selected Course</title>
</head>
<body>
<br />
<?
if ($_REQUEST['action'] == 'join' && trim($_REQUEST['username']) && trim($_REQUEST['meetingID']))
{
   /*
	* Got an action=join
	*/

    $joinURL = getJoinURL($_REQUEST['username'], $_REQUEST['meetingID'], null);
    if (substr($joinURL, 0, 7) == 'http://')
    {
    	?>
<script language="javascript" type="text/javascript">
  window.location.href="<?=$joinURL?>";
</script>
    	<?
    }
    else
    {
    	?>
Error: getJoinURL() failed
<p><?=$joinURL?></p>
    	<?
    }
}
else
{
	include('demo_header.php');
?>
<h2>Demo #2: Join a Selected Course</h2>

<form name="form1" method="get">
	<table width="600" cellspacing="20" cellpadding="20" style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);" border="3">
		<tr>
			<td width="50%">Join a Selected Course.</td>
			<td width="50%">
				Enter your name: <input type="text"	name="username" /><br />
				<input type="hidden" name="action" value="join"><br />
				Course:&nbsp;
				<select name="meetingID">
					<option value="English 232">English 232</option>
					<option value="English 300">English 300</option>
					<option value="English 402">English 402</option>
					<option value="Demo Meeting">Demo Meeting</option>
				</select>
				<br />
				<input type="submit" value="Join" />
			</td>
		</tr>
	</table>
</form>
<? } ?>
<?
include('demo_footer.php');
?>
</body>
</html>