
println "meetme begin"


number = channel.getData("conf-getconfno", 10000, 10)
conf = db.firstRow("SELECT * FROM conference WHERE conference_number=$number")
if (conf) println "found one! " + conf.conference_name

if (conf) { 
	pin = channel.getData("conf-getpin", 10000)
	println pin
	println conf.pin
	if (pin.toInteger() == conf.pin) {
		channel.streamFile("conf-placeintoconf")
		channel.exec("Meetme", "$number|dMq")
	} else {
		channel.streamFile("conf-invalidpin")
	}
} else {
	channel.streamFile("conf-invalid")
}

/*
//channel.streamFile("conf-adminmenu")
//channel.streamFile("conf-banned")
//channel.streamFile("conf-enteringno")
//channel.streamFile("conference-call")
//channel.streamFile("conference")
//channel.streamFile("conference-reservations")
//channel.streamFile("conf-errormenu")
channel.streamFile("conf-full")
//channel.streamFile("conf-getchannel")

channel.streamFile("conf-getpin")
//channel.streamFile("conf-hasentered")
//channel.streamFile("conf-hasjoin")
//channel.streamFile("conf-hasleft")
channel.streamFile("conf-invalid")

channel.streamFile("confirm-number-is")
//channel.streamFile("conf-kicked")
//channel.streamFile("conf-leaderhasleft")
//channel.streamFile("conf-locked")
//channel.streamFile("conf-lockednow")
//channel.streamFile("conf-muted")
//channel.streamFile("conf-noempty")
//channel.streamFile("conf-onlyone")
//channel.streamFile("conf-onlyperson")
//channel.streamFile("conf-onlypersonleft")
//channel.streamFile("conf-otherinparty")
//channel.streamFile("conf-peopleinconf")

//channel.streamFile("conf-recordings")
//channel.streamFile("conf-sysop")
//channel.streamFile("conf-sysopreqcancelled")
//channel.streamFile("conf-sysopreq")
channel.streamFile("conf-thereare")
//channel.streamFile("conf-unlockednow")
//channel.streamFile("conf-unmuted")
//channel.streamFile("conf-usermenu")
//channel.streamFile("conf-userswilljoin")
//channel.streamFile("conf-userwilljoin")
channel.streamFile("conf-waitforleader")
channel.streamFile("conf-youareinconfnum")
*/

println "meetme end"


def getDigits(int number) {
	StringBuffer sb = new StringBuffer()
	for (int t = 0; t < number; t++) {
		sb.append(channel.waitForDigit(10000))
	}
	return sb.toString()
}