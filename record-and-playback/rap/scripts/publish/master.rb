
# 
puts "pwd = #{Dir.pwd}"
Dir.glob("#{Dir.pwd}/steps/*.rb").sort.each do |file|
  puts file
  IO.popen("ruby #{file}") do |output|
    output.each do |line|
      puts line
    end
  end
end
