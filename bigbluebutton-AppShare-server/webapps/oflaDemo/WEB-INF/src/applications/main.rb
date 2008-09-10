# JRuby - style
require 'java'
module RedFive
    include_package "org.red5.server.api"
	include_package "org.red5.server.api.stream"
	include_package "org.red5.server.api.stream.support"
	include_package "org.red5.server.adapter"
	include_package "org.red5.server.stream"
end

#
# application.rb - a translation into Ruby of the ofla demo application, a red5 example.
#
# @author Paul Gregoire
#
class Application < RedFive::ApplicationAdapter

    attr_reader :appScope, :serverStream
	attr_writer :appScope, :serverStream
	 
	def initialize
	   #call super to init the superclass, in this case a Java class
	   super
	   puts "Initializing ruby application"
	end

	def appStart(app)
        puts "Ruby appStart"
		@appScope = app
		return true
	end

	def appConnect(conn, params) 
		puts "Ruby appConnect"
		measureBandwidth(conn)
		puts "Ruby appConnect 2"
		if conn.instance_of?(RedFive::IStreamCapableConnection)
		    puts "Got stream capable connection"
			sbc = RedFive::SimpleBandwidthConfigure.new
			sbc.setMaxBurst(8388608)
			sbc.setBurst(8388608)
			sbc.setOverallBandwidth(8388608)
			conn.setBandwidthConfigure(sbc)
		end
		return super
	end

	def appDisconnect(conn) 
		puts "Ruby appDisconnect"
		if appScope == conn.getScope && @serverStream != nil 
			@serverStream.close
		end
		super
	end

	def toString
		return "Ruby toString"
	end

    def setScriptContext(scriptContext)
	   puts "Ruby application setScriptContext"
    end

    def method_missing(m, *args)
      super unless @value.respond_to?(m) 
      return @value.send(m, *args)
    end

end

