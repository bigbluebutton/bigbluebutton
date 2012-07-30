<!--

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

Author: Jesus Federico <jesus@123it.ca>

-->
<%@ page import="java.util.*,java.io.*,java.text.*" errorPage="error.jsp" %>
<%@ page import="org.expressme.openid.*,org.expressme.openid.OpenIdManager" %>

<%!
static final long ONE_HOUR = 3600000L;
static final long TWO_HOUR = ONE_HOUR * 2L;
static final String ATTR_MAC = "openid_mac";
static final String ATTR_ALIAS = "openid_alias";

private OpenIdManager manager = new OpenIdManager();

void showAuthentication(PrintWriter pw, Authentication auth) {
    pw.print("<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" /><title>Test JOpenID</title></head><body><h1>You have successfully signed on!</h1>");
    pw.print("<p>Identity: " + auth.getIdentity() + "</p>");
    pw.print("<p>Email: " + auth.getEmail() + "</p>");
    pw.print("<p>Full name: " + auth.getFullname() + "</p>");
    pw.print("<p>First name: " + auth.getFirstname() + "</p>");
    pw.print("<p>Last name: " + auth.getLastname() + "</p>");
    pw.print("<p>Gender: " + auth.getGender() + "</p>");
    pw.print("<p>Language: " + auth.getLanguage() + "</p>");
    pw.print("</body></html>");
    pw.flush();
}


void checkNonce(String nonce) {
    // check response_nonce to prevent replay-attack:
    if (nonce==null || nonce.length()<20)
        throw new OpenIdException("Verify failed.");
    // make sure the time of server is correct:
    long nonceTime = getNonceTime(nonce);
    long diff = Math.abs(System.currentTimeMillis() - nonceTime);
    if (diff > ONE_HOUR)
        throw new OpenIdException("Bad nonce time.");
    if (isNonceExist(nonce))
        throw new OpenIdException("Verify nonce failed.");
    storeNonce(nonce, nonceTime + TWO_HOUR);
}

// simulate a database that store all nonce:
private Set<String> nonceDb = new HashSet<String>();

// check if nonce is exist in database:
boolean isNonceExist(String nonce) {
    return nonceDb.contains(nonce);
}

// store nonce in database:
void storeNonce(String nonce, long expires) {
    nonceDb.add(nonce);
}

long getNonceTime(String nonce) {
    try {
        return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ")
                .parse(nonce.substring(0, 19) + "+0000")
                .getTime();
    }
    catch(ParseException e) {
        throw new OpenIdException("Bad nonce time.");
    }
}


%>

