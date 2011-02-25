class NoSuchDirectoryException < RuntimeError
end
    
raise NoSuchDirectoryException, "foo" if not FileTest.directory?("/var/freeswitch/meetings1")
#Dir.chdir("foobar")
if Dir.glob("/var/freeswitch/meetings/cda73e7e-8f71-4906-8e74-cbdc66a5e97f*.wav").empty?
    puts "not empty"
else
    puts "empty"
end
    