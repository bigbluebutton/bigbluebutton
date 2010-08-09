From: "${voicemail_caller_id_name}" <${voicemail_caller_id_number}@${voicemail_domain}>
To: <${voicemail_notify_email}>
Subject: Voicemail from "${voicemail_caller_id_name}" <${voicemail_caller_id_number}> ${voicemail_message_len}
X-Priority: ${voicemail_priority}
X-Mailer: FreeSWITCH

Content-Type: multipart/alternative; 
	boundary="000XXX000"

--000XXX000
Content-Type: text/plain; charset=ISO-8859-1; Format=Flowed
Content-Disposition: inline
Content-Transfer-Encoding: 7bit

Created: ${voicemail_time}
From: "${voicemail_caller_id_name}" <${voicemail_caller_id_number}>
Duration: ${voicemail_message_len}
Account: ${voicemail_account}@${voicemail_domain}

--000XXX000
Content-Type: text/html; charset=ISO-8859-1
Content-Disposition: inline
Content-Transfer-Encoding: 7bit

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<META http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Voicemail from "${voicemail_caller_id_name}" <${voicemail_caller_id_number}> ${voicemail_message_len}</title>
<meta content="text/html; charset=iso-8859-1" http-equiv="content-type"/>
</head>
<body>

<font face=arial>
<b>Message From "${voicemail_caller_id_name}" <A HREF="tel:${voicemail_caller_id_number}">${voicemail_caller_id_number}</A></b><br>
<hr noshade size=1>
Created: ${voicemail_time}<br>
Duration: ${voicemail_message_len}<br>
Account: ${voicemail_account}@${voicemail_domain}<br>

</body>
</html>
--000XXX000--
