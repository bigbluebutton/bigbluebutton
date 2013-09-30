<%
/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
*/
%>

<jsp:useBean id="connection" class="connection.JedisConnection" scope="session"/>
<jsp:setProperty name="connection" property="*"/> 

<%@page import="javax.servlet.http.Cookie"%>

<%
	String poll = request.getParameter( "poll" );
	boolean validVote = false;
	String error = null;
	
	// grab cookies and look for the bbbpollstaken cookie
	String cookieValue = null;
	Cookie [] cookies = request.getCookies();
	if (cookies != null) {
		for (int i=0; i < cookies.length; i++) {
			if (cookies[i].getName().equals("bbbpollstaken")) {
				cookieValue = cookies[i].getValue();
			}
		}
	}
	
	String vote = null;
	String [] votes = null;
	if (connection.getTitle() != null) {
		if (connection.getMultiple().equals("false")) {
			vote = request.getParameter( "answers" );
		} else {
			votes = request.getParameterValues( "answers" );
		}
	}
	
	if (poll == null) {
		error = "Error: No poll entered.";
	} else if (poll.equals("youshallnotpass")) {
		error = "Error: Requested resource not found.";
	} else if (connection.cleanWebKey(poll)) {
		error = "Error: Improper formatting.";
	} else if (connection.sessionVoted(poll) || (cookieValue != null && connection.cookieCheck(cookieValue, poll))) { // already voted
		error = "Error: Already voted.";
	} else if (!connection.retrievePoll(poll)) { // tries to find poll
		error = "Error: Poll not found.";
	} else if (connection.getMultiple().equals("false") && vote != null) { // radio buttons used
		// check to see if they pressed they selected an answer
		validVote = true;
		connection.recordRadioVote(vote);
	} else if (connection.getMultiple().equals("true") && votes != null) {	// checkboxes used
		validVote = true;
		connection.recordCheckVote(votes);
	} else {
	  	String [] answers = connection.getAnswers();
	  	session.setAttribute("webkey", poll); %>
		<html>
		<head>
			<title><%= connection.getTitle()%></title>
		</head>
		<body>
			<%= connection.getQuestion()%> <br /> <br />
			<form method="post" action="<%= poll%>">
				<%
				// determine whether to use checkboxes or radio buttons
				String type;
				if (connection.getMultiple().equals("true")) {
					type = "checkbox";
				} else {
					type = "radio";
				}
				
				// display the possible answers
				for (int i=0; i < answers.length; i++){
					%>
					<input type="<%= type%>" name="answers" value="<%= i+1%>" /> <%= answers[i]%> <br />
					<%
				}
				%>
				<br />
				<input type="submit" value="Submit" />
			</form>		
	<%
	}
	
	// check if an error was recorded
	if (error != null) {
	%>
		<html>
		<head>
			<title>Error</title>
		</head>
		<body>
			<h1> <%= error%> </h1>
	<% 
	} else if (validVote) {
		%>
		<html>
		<head>
			<title><%= connection.getTitle()%></title>
		</head>
		<body>
			Thank you for voting!
		<%
		
		// write to the cookie
		if (cookieValue == null) {
			cookieValue = "," + (String) session.getAttribute("webkey") + ",";
		} else {
			cookieValue += session.getAttribute("webkey") + ",";
		}
		
		Cookie bbbpollstaken = new Cookie("bbbpollstaken", cookieValue);
		bbbpollstaken.setMaxAge(60*60*8); // expire after 4h
		
		response.addCookie( bbbpollstaken );
	}
	%>
</body>
</html>
