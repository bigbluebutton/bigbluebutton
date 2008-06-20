////////////////////////////////////////////////////////////////////////////////
//
//  ADOBE SYSTEMS INCORPORATED
//  Copyright 2006-2007 Adobe Systems Incorporated
//  All Rights Reserved.
//
//  NOTICE: Adobe permits you to use, modify, and distribute this file
//  in accordance with the terms of the license agreement accompanying it.
//
////////////////////////////////////////////////////////////////////////////////

var ECLIPSE_FRAME_NAME = "ContentViewFrame";
var eclipseBuild = false;
var liveDocsBaseUrl = "http://livedocs.macromedia.com/flex/2/langref/";

function findObject(objId) {
	if (document.getElementById)
		return document.getElementById(objId);

	if (document.all)
		return document.all[objId];
}

function isEclipse() {
	return eclipseBuild;
//	return (window.name == ECLIPSE_FRAME_NAME) || (parent.name == ECLIPSE_FRAME_NAME) || (parent.parent.name == ECLIPSE_FRAME_NAME);
}

function configPage() {
	if (isEclipse()) {
		if (window.name != "classFrame")
		{
			var localRef = window.location.href.indexOf('?') != -1 ? window.location.href.substring(0, window.location.href.indexOf('?')) : window.location.href;
			localRef = localRef.substring(localRef.indexOf("langref/") + 8);
			if (window.location.search != "")
				localRef += ("#" + window.location.search.substring(1));

			window.location.replace(baseRef + "index.html?" + localRef);
			return;
		}
		else
		{
			setStyle(".eclipseBody", "display", "block");
//			var isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
//			if (isIE == false && window.location.hash != "")
			if (window.location.hash != "")
				window.location.hash=window.location.hash.substring(1);
		}
	}
	else if (window == top) { // no frames
		findObject("titleTable").style.display = "";
	}
	else { // frames
		findObject("titleTable").style.display = "none";
	}
	showTitle(asdocTitle);
}

function loadFrames(classFrameURL, classListFrameURL) {
	var classListFrame = findObject("classListFrame");
	if(classListFrame != null && classListFrameContent!='')
		classListFrame.document.location.href=classListFrameContent;
 
	if (isEclipse()) {
		var contentViewFrame = findObject(ECLIPSE_FRAME_NAME);
		if (contentViewFrame != null && classFrameURL != '')
			contentViewFrame.document.location.href=classFrameURL;
	}
	else {
		var classFrame = findObject("classFrame");
		if(classFrame != null && classFrameContent!='')
			classFrame.document.location.href=classFrameContent;
	}
}

function showTitle(title) {
	if (!isEclipse())
		top.document.title = title;
}

function loadClassListFrame(classListFrameURL) {
	if (parent.frames["classListFrame"] != null) {
		parent.frames["classListFrame"].location = classListFrameURL;
	}
	else if (parent.frames["packageFrame"] != null) {
		if (parent.frames["packageFrame"].frames["classListFrame"] != null) {
			parent.frames["packageFrame"].frames["classListFrame"].location = classListFrameURL;
		}
	}
}

function gotoLiveDocs(primaryURL, secondaryURL) {
	var url = liveDocsBaseUrl + "index.html?" + primaryURL;
	if (secondaryURL != null && secondaryURL != "")
		url += ("&" + secondaryURL);
	window.open(url, "mm_livedocs", "menubar=1,toolbar=1,status=1,scrollbars=1");
}

function findTitleTableObject(id)
{
	if (isEclipse())
		return parent.titlebar.document.getElementById(id);
	else if (top.titlebar)
		return top.titlebar.document.getElementById(id);
	else
		return document.getElementById(id);
}

function titleBar_setSubTitle(title)
{
	if (isEclipse() || top.titlebar)
		findTitleTableObject("subTitle").childNodes.item(0).data = title;
}

function titleBar_setSubNav(showConstants,showProperties,showStyles,showEffects,showEvents,showConstructor,showMethods,showExamples,
				showPackageConstants,showPackageProperties,showPackageFunctions,showInterfaces,showClasses,showPackageUse)
{
	if (isEclipse() || top.titlebar)
	{
		findTitleTableObject("propertiesLink").style.display = showProperties ? "inline" : "none";
		findTitleTableObject("propertiesBar").style.display = (showProperties && (showPackageProperties || showConstructor || showMethods || showPackageFunctions || showEvents || showStyles || showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("packagePropertiesLink").style.display = showPackageProperties ? "inline" : "none";
		findTitleTableObject("packagePropertiesBar").style.display = (showPackageProperties && (showConstructor || showMethods || showPackageFunctions || showEvents || showStyles || showConstants || showEffects || showPackageConstants || showInterfaces || showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("constructorLink").style.display = showConstructor ? "inline" : "none";
		findTitleTableObject("constructorBar").style.display = (showConstructor && (showMethods || showPackageFunctions || showEvents || showStyles || showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("methodsLink").style.display = showMethods ? "inline" : "none";
		findTitleTableObject("methodsBar").style.display = (showMethods && (showPackageFunctions || showEvents || showStyles || showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("packageFunctionsLink").style.display = showPackageFunctions ? "inline" : "none";
		findTitleTableObject("packageFunctionsBar").style.display = (showPackageFunctions && (showEvents || showStyles || showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("eventsLink").style.display = showEvents ? "inline" : "none";
		findTitleTableObject("eventsBar").style.display = (showEvents && (showStyles || showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("stylesLink").style.display = showStyles ? "inline" : "none";
		findTitleTableObject("stylesBar").style.display = (showStyles && (showEffects || showConstants || showPackageConstants || showInterfaces || showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("effectsLink").style.display = showEffects ? "inline" : "none";
		findTitleTableObject("effectsBar").style.display = (showEffects && (showConstants || showPackageConstants || showInterfaces || showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("constantsLink").style.display = showConstants ? "inline" : "none";
		findTitleTableObject("constantsBar").style.display = (showConstants && (showPackageConstants || showInterfaces || showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("packageConstantsLink").style.display = showPackageConstants ? "inline" : "none";
		findTitleTableObject("packageConstantsBar").style.display = (showPackageConstants && (showInterfaces || showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("interfacesLink").style.display = showInterfaces ? "inline" : "none";
		findTitleTableObject("interfacesBar").style.display = (showInterfaces && (showClasses || showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("classesLink").style.display = showClasses ? "inline" : "none";
		findTitleTableObject("classesBar").style.display = (showClasses && (showPackageUse || showExamples)) ? "inline" : "none";

		findTitleTableObject("packageUseLink").style.display = showPackageUse ? "inline" : "none";
		findTitleTableObject("packageUseBar").style.display = (showPackageUse && showExamples) ? "inline" : "none";

		findTitleTableObject("examplesLink").style.display = showExamples ? "inline" : "none";
	}
}

function titleBar_gotoClassFrameAnchor(anchor)
{
	if (isEclipse())
		parent.classFrame.location = parent.classFrame.location.toString().split('#')[0] + "#" + anchor;
	else
		top.classFrame.location = top.classFrame.location.toString().split('#')[0] + "#" + anchor;
}

function setMXMLOnly() 
{
	if (getCookie("showMXML") == "false")
	{
		toggleMXMLOnly();
	}
}
function toggleMXMLOnly() 
{
	var mxmlDiv = findObject("mxmlSyntax");
	var mxmlShowLink = findObject("showMxmlLink");
	var mxmlHideLink = findObject("hideMxmlLink");
	if (mxmlDiv && mxmlShowLink && mxmlHideLink)
	{
		if (mxmlDiv.style.display == "none")
		{
			mxmlDiv.style.display = "block";
			mxmlShowLink.style.display = "none";
			mxmlHideLink.style.display = "inline";
			setCookie("showMXML","true", new Date(3000,1,1,1,1), "/", document.location.domain);
		}
		else
		{
			mxmlDiv.style.display = "none";
			mxmlShowLink.style.display = "inline";
			mxmlHideLink.style.display = "none";
			setCookie("showMXML","false", new Date(3000,1,1,1,1), "/", document.location.domain);
		}
	}
}

function showHideInherited()
{	
	setInheritedVisible(getCookie("showInheritedConstant") == "true", "Constant");
	setInheritedVisible(getCookie("showInheritedProtectedConstant") == "true", "ProtectedConstant");
	setInheritedVisible(getCookie("showInheritedProperty") == "true", "Property");
	setInheritedVisible(getCookie("showInheritedProtectedProperty") == "true", "ProtectedProperty");
	setInheritedVisible(getCookie("showInheritedMethod") == "true", "Method");
	setInheritedVisible(getCookie("showInheritedProtectedMethod") == "true", "ProtectedMethod");
	setInheritedVisible(getCookie("showInheritedEvent") == "true", "Event");
	setInheritedVisible(getCookie("showInheritedStyle") == "true", "Style");
	setInheritedVisible(getCookie("showInheritedEffect") == "true", "Effect");
}
function setInheritedVisible(show, selectorText)
{
	if (document.styleSheets[0].cssRules != undefined)
	{
		var rules = document.styleSheets[0].cssRules;
		for (var i = 0; i < rules.length; i++)
		{
			if (rules[i].selectorText == ".hideInherited" + selectorText)
				rules[i].style.display = show ? "" : "none";
				
			if (rules[i].selectorText == ".showInherited" + selectorText)
				rules[i].style.display = show ? "none" : "";
		}
	}
	else
	{
		document.styleSheets[0].addRule(".hideInherited" + selectorText, show ? "display:inline" : "display:none");
		document.styleSheets[0].addRule(".showInherited" + selectorText, show ? "display:none" : "display:inline");
	}
	setCookie("showInherited" + selectorText, show ? "true" : "false", new Date(3000,1,1,1,1), "/", document.location.domain);
	setRowColors(show, selectorText);
}

function setRowColors(show, selectorText)
{
	var rowColor = "#F2F2F2";
	var table = findObject("summaryTable" + selectorText);
	if (table != null)
	{
		var rowNum = 0;
		for (var i = 1; i < table.rows.length; i++)
		{
			if (table.rows[i].className.indexOf("hideInherited") == -1 || show)
			{
				rowNum++;
				table.rows[i].bgColor = (rowNum % 2 == 0) ? rowColor : "#FFFFFF";
			}			
		}
	}
}

function setStyle(selectorText, styleName, newValue)
{
	if (document.styleSheets[0].cssRules != undefined)
	{
		var rules = document.styleSheets[0].cssRules;
		for (var i = 0; i < rules.length; i++)
		{
			if (rules[i].selectorText == selectorText)
			{
				rules[i].style[styleName] = newValue;
				break;
			}
		}
	}
	else
	{
		document.styleSheets[0].addRule(selectorText, styleName + ":" + newValue);
	}
}