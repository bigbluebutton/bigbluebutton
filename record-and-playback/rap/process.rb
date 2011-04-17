puts "pwd = #{Dir.pwd}"
Dir.glob("#{Dir.pwd}/archive/*.rb").sort.each { |file|
  puts file
  IO.popen("ruby #{file}") do |output|
    output.each do |line|
      puts line
    end
  end
} 

