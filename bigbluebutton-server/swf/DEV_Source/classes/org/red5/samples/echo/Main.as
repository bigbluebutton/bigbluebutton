package org.red5.samples.echo
{
	/**
	 * RED5 Open Source Flash Server - http://www.osflash.org/red5
	 *
	 * Copyright (c) 2006-2008 by respective authors (see below). All rights reserved.
	 *
	 * This library is free software; you can redistribute it and/or modify it under the
	 * terms of the GNU Lesser General Public License as published by the Free Software
	 * Foundation; either version 2.1 of the License, or (at your option) any later
	 * version.
	 *
	 * This library is distributed in the hope that it will be useful, but WITHOUT ANY
	 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
	 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
	 *
	 * You should have received a copy of the GNU Lesser General Public License along
	 * with this library; if not, write to the Free Software Foundation, Inc.,
	 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
	*/
	
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.NetConnection;
	import flash.net.ObjectEncoding;
	import flash.net.SharedObject;
	import flash.system.Capabilities;
	import flash.utils.getTimer;
	
	import mx.collections.ArrayCollection;
	import mx.controls.*;
	import mx.core.Application;
	import mx.events.FlexEvent;
	import mx.rpc.remoting.RemoteObject;
	
	import org.red5.samples.echo.data.EchoTestData;
	import org.red5.samples.echo.data.EchoTestResult;
	import org.red5.samples.echo.events.EchoTestEvent;
	
	/**
	 * Echo test application for AMF and RTMP server implementations.
	 * 
	 * Contains tests for ActionScript 1.0 and 2.0 data types (AMF0),
	 * and ActionScript 3.0 data types (AMF3). Tests are transported
	 * using the NetConnection or RemoteObject class over the AMF or 
	 * RTMP protocol.
	 * 
	 * @author Joachim Bauch ( jojo@struktur.de )
	 * @author Thijs Triemstra ( info@collab.nl )
	*/	
	public class Main extends Application
	{
		[Bindable]
		public var appVersion			: String = "0.3.3";
		
		[Bindable]
		public var testResults			: ArrayCollection;
		
		[Bindable]
		public var testParams			: EchoTestData;
		
		[Bindable]
		private var testIndex			: Number;
		
		[Bindable]
		private var AMF0Count			: Number;
		
		[Bindable]
		private var testsFailed			: Number;
		
		[Bindable]
		public var fpVersion 			: String;
		
		[Bindable]
		public var statusText 			: String;
		
		[Bindable]
		public var rtmp_txt 			: TextInput;
		
		[Bindable]
		public var rtmpMethod_txt 		: TextInput;
		
		[Bindable]
		public var http_txt 			: TextInput;
		
		[Bindable]
		public var httpMethod_txt 		: TextInput;
		
		[Bindable]
		public var username_txt 		: TextInput;
		
		[Bindable]
		public var password_txt 		: TextInput;
		
		public var resultGrid			: DataGrid;
		public var null_test			: CheckBox;
		public var undefined_test		: CheckBox;
		public var boolean_test			: CheckBox;
		public var string_test			: CheckBox;
		public var number_test			: CheckBox;
		public var array_test			: CheckBox;
		public var object_test			: CheckBox;
		public var date_test			: CheckBox;
		public var remote_test			: CheckBox;
		public var custom_test			: CheckBox;
		public var xml0_test			: CheckBox;
		public var xml3_test			: CheckBox;
		public var externalizable_test	: CheckBox;
		public var arraycollection_test	: CheckBox;
		public var objectproxy_test		: CheckBox;
		public var bytearray_test		: CheckBox;
		public var unsupported_test		: CheckBox;
		
		private var amf0_tests			: Array = new Array();
		private var amf3_tests			: Array = new Array();
		private var tests_selection 	: Array = new Array();
		private var success 			: String = "<font color='#149D25'>";
		private var failure 			: String = "<font color='#FF1300'>";
		private var globalTimer			: int;
		private var local_so			: SharedObject;
		private var nc					: NetConnection;
		private var echoService 		: RemoteObject;
    
        public function Main() : void
        {
        	this.addEventListener( FlexEvent.CREATION_COMPLETE, setupApp );
        }
		
		private function setupApp( event:FlexEvent ) : void
		{
			amf0_tests = [ null_test, undefined_test, boolean_test, string_test, number_test, 
					       array_test, object_test, date_test, xml0_test, remote_test, custom_test ];
			
			amf3_tests = [ xml3_test, externalizable_test, arraycollection_test, objectproxy_test, 
			               bytearray_test, unsupported_test ];
			
			tests_selection = [ amf0_tests, amf3_tests ];
			
			// Display FP version nr.
        	fpVersion = "Flash Player " + Capabilities.version + " - " 
        	            + Capabilities.playerType;
        	
        	// Load http and rtmp uri's from shared object
        	local_so = SharedObject.getLocal( "EchoTest" );
        	
        	// load url's from flookie when present
        	if ( local_so.data.rtmpUri != null ) {
        		rtmp_txt.text = local_so.data.rtmpUri;
        	} else {
        		rtmp_txt.text = "rtmp://localhost/echo";
        	}
        	if ( local_so.data.httpUri != null ) {
        		http_txt.text = local_so.data.httpUri;
        	} else {
        		http_txt.text = "http://localhost:5080/echo/gateway";
        	}
        	if ( local_so.data.httpMethod != null ) {
        		httpMethod_txt.text = local_so.data.httpMethod;
        	} else {
        		httpMethod_txt.text = "echo";
        	}
        	if ( local_so.data.rtmpMethod != null ) {
        		rtmpMethod_txt.text = local_so.data.rtmpMethod;
        	} else {
        		rtmpMethod_txt.text = "echo";
        	}
			
			// Setup a single NetConnection for every test suite.
			nc = new NetConnection();
			nc.addEventListener( NetStatusEvent.NET_STATUS, netStatusHandler ); 
			nc.addEventListener( AsyncErrorEvent.ASYNC_ERROR, netASyncError );
            nc.addEventListener( SecurityErrorEvent.SECURITY_ERROR, netSecurityError );
            nc.addEventListener( IOErrorEvent.IO_ERROR, netIOError );
		}
		
		public function onConnect( protocol: String, encoding: uint ) : void 
		{
			if ( nc.connected ) 
			{
				nc.close();
			}
			nc.objectEncoding = encoding;
			var url: String;
			if ( protocol == "http" ) {
			    // Remoting...
				url = http_txt.text;
				local_so.data.httpUri = url;
			} 
			else
			{
				// RTMP...
				url = rtmp_txt.text;
				local_so.data.rtmpUri = url;
			}
            
            statusText = "Connecting through <b>" + protocol.toUpperCase() + "</b> using <b>AMF" 
                         + encoding  + "</b> encoding";
            
            var flushStatus:String = null;
            try {
                flushStatus = local_so.flush();
            } 
            catch ( error:Error ) 
            {
            	printText( "<br/><b>" + failure + "Local SharedObject error: </font></b>" 
            	           + error.getStackTrace() + "<br/>" );
            }
            
			//
			if ( protocol == "remoteObject" ) 
			{
				// Setup a RemoteObject
            	echoService = new RemoteObject( "Red5Echo" );
            	echoService.source = "EchoService";
            	// echoService.addEventListener( ResultEvent.RESULT, onRem );
            	
				if ( username_txt.text.length > 0 ) {
					// test credentials feature
					echoService.setCredentials( username_txt.text, password_txt.text );
					statusText += " ( using setCredentials )";
				}
				statusText += "...";
				startTests();
				// ignore rest of setup logic
				return;
			}
			else if ( protocol == "sharedObject" )
			{
				
			}
			
			if ( username_txt.text.length > 0 ) {
				// test credentials feature
				nc.addHeader("Credentials", false, {userid: username_txt.text, password: password_txt.text});
				statusText += " ( using setCredentials )";
			}
			//
			statusText += "...";
			if ( echoService != null ) {
				// http_txt.text
				echoService.destination = null;
			}
			// connect to server
			nc.connect( url );
			//			
			if ( protocol == "http" ) {
				// Don't wait for a successfull connection for AMF0/AMF3 remoting tests.
				startTests();
			}
		}
		
		private function printText( msg : String ) : void
		{
			statusText += msg;
		}
		
		private function startTests(): void 
		{
			testParams = new EchoTestData( tests_selection );
			
			if (testResults != null ) { 
				testResults.removeAll();
			}
			
			testResults = new ArrayCollection();
			testIndex = 0;
			testsFailed = 0;
			globalTimer = getTimer();
			
			if ( testParams.items.length > 0 ) {
				doTest();
			}
		}
		
		private function doTest() : void 
		{
			// Create new test and listen for events
			var testObj:EchoTest = new EchoTest();
			testObj.addEventListener( EchoTestEvent.TEST_INIT, onTestInit );
			testObj.addEventListener( EchoTestEvent.TEST_ACTIVE, onTestActive );
			testObj.addEventListener( EchoTestEvent.TEST_COMPLETE, onTestComplete );
			testObj.addEventListener( EchoTestEvent.TEST_FAILED, onTestFailed );
			testObj.addEventListener( EchoTestEvent.TEST_ERROR, onTestFailed );
			testObj.addEventListener( EchoTestEvent.TEST_TIMEOUT, onTestTimeout );
			
			// Setup test and wait for result from call
			testObj.setupTest( testIndex, testParams.items[ testIndex ] );
			
			// Call method in remote service
			if ( echoService == null || echoService.destination == null ) 
			{
				// NetConnection requests
				nc.call( httpMethod_txt.text, testObj.responder, testObj.input );
			} 
			else 
			{
				// RemotingObject requests
				echoService.echo( testObj.input );
			}
		}
		
		/**
		 * Add test to grid.
		 * 
		 * @param event
		 */		
		private function onTestInit( event : EchoTestEvent ) : void 
		{
			var result:EchoTestResult = event.result;
			testResults.addItem( result );
		}
		
		/**
		 * Updates during the test.
		 * 
		 * @param event
		 */		
		private function onTestActive( event : EchoTestEvent ) : void 
		{
			resultGrid.validateNow();
		}
		
		/**
		 * Test failed, go to next test.
		 * 
		 * @param event
		 */		
		private function onTestFailed( event : EchoTestEvent ) : void 
		{
			testsFailed++;
			testIndex += 1;
			
			// onDisconnect();
			
			if ( testIndex < testParams.items.length )
			{
				doTest()
			}
		}
		
		/**
		 * Test succeeded, check if it's the last one, or continue to
		 * the next test.
		 * 
		 * @param event
		 */		
		private function onTestComplete( event : EchoTestEvent ) : void 
		{
			var testCount: Number = testParams.items.length;
			
			testIndex += 1;
			
			if ( nc.objectEncoding == ObjectEncoding.AMF0 ) 
			{
				testCount = testParams.AMF0COUNT;
			}
			
			printTestResults( testCount );
		}
		
		/**
		 * @param event
		 */		
		private function onTestTimeout( event : EchoTestEvent ) : void 
		{
			trace("onTestTimeout");
		}
		
		private function printTestResults( testCount : Number ) : void
		{
			var testTime : Number = ( getTimer() - globalTimer ) / 1000;
			
			if ( testIndex < testCount ) 
			{
				// Still tests left, start next one.
				doTest();
			} 
			else if ( testsFailed == 0 ) 
			{
				// All tests were completed with success.
				printText( "<br><b>Successfully ran " + success + testCount + 
				           "</font> test(s) in " + testTime + " seconds.</b><br/>" );
				onDisconnect();
			} 
			else 
			{
				// One or more tests failed.
				printText( "<br><b>Ran " + success + testCount + "</font> test(s) in " + 
				           testTime + " seconds, " + failure + testsFailed + 
				           "</font> test(s) failed.</b>" );
				onDisconnect();
			}
		}
		
		private function netStatusHandler( event : NetStatusEvent ) : void 
		{
			var infoCode:String = event.info.code;
			
			switch( infoCode ) 
			{
				case "NetConnection.Connect.Success":
					startTests();
					break;
				
				case "NetConnection.Connect.Rejected":
					onDisconnect();
					break;
					
				case "NetConnection.Connect.Failed":
				case "NetConnection.Connect.Closed":
					onDisconnect();
					break;
			}
		}
		
		private function netSecurityError( event : SecurityErrorEvent ) : void 
		{
			printText( "<b>" + failure + "Security error</font></b>: " + event.text );
		}
				
		private function netIOError( event : IOErrorEvent ) : void 
		{
			printText( "<b>" + failure + "I/O error</font></b>: " + event.text );
		}
				
		private function netASyncError( event : AsyncErrorEvent ) : void 
		{
			printText( "<b>" + failure + "Async error</font></b>: " 
			           + event.error.getStackTrace() );
		}
		
		private function onDisconnect() : void 
		{
			nc.close();
		}
		
	}
}
