# JRuby - style
require 'java'
module RedFive
    include_package "org.springframework.core.io"
    include_package "org.red5.server.webapp.oflaDemo"
end
include_class "org.red5.server.api.Red5"
include_class "java.util.HashMap"

#
# demoservice.rb - a translation into Ruby of the ofla demo application, a red5 example.
#
# @author Paul Gregoire
#
class DemoService < RedFive::DemoServiceImpl

    attr_reader :filesMap
    attr_writer :filesMap

	def initialize
	   puts "Initializing ruby demoservice"
	   super
	   @filesMap = HashMap.new
	end

	def getListOfAvailableFLVs
		puts "Getting the FLV files"
		begin
#		    puts "R5 con local: #{Red5::getConnectionLocal}"
#		    puts "Scope: #{Red5::getConnectionLocal.getScope}"
#		    puts "Root path: #{File.expand_path('/')}"
#		    puts "Current path:  #{File.expand_path('webapps/oflaDemo/')}"
            dirname = File.expand_path('webapps/oflaDemo/streams').to_s
			Dir.open(dirname).entries.grep(/\.flv$/) do |dir|
			    dir.each do |flvName|
      			    fileInfo = HashMap.new
      			    stats = File.stat(dirname+'/'+flvName)
      			    fileInfo["name"] = flvName
      			    fileInfo["lastModified"] = stats.mtime
      			    fileInfo["size"] = stats.size || 0
                    @filesMap[flvName] = fileInfo
                    print 'FLV Name:', flvName
                    print 'Last modified date:', stats.mtime
                    print 'Size:', stats.size || 0
                    print '-------'
                end
            end
		rescue Exception => ex
			puts "Error in getListOfAvailableFLVs #{errorType} \n"
			puts "Exception: #{ex} \n"
			puts caller.join("\n");
		end
		return filesMap
	end

	def formatDate(date)
		return date.strftime("%d/%m/%Y %I:%M:%S")
	end

    def method_missing(m, *args)
      super unless @value.respond_to?(m)
      return @value.send(m, *args)
    end

end
