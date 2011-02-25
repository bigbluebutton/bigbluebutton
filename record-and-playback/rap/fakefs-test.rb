require "benchmark"
require "fileutils"

def test
  path = "/tmp/faketest"
  FileUtils.mkdir_p("#{path}/public/stylesheets")
  FileUtils.mkdir_p("#{path}/public/javascripts")
  FileUtils.mkdir_p("#{path}/public/images")
  FileUtils.mkdir_p("#{path}/views/templates")
  FileUtils.mkdir_p("#{path}/views/layouts")
  File.open("#{path}/views/layouts/application.html.haml", "w") {|f| f.write "= catch_content :for_layout\n" }    
  FileUtils.touch("#{path}/public/stylesheets/style.css")
  FileUtils.touch("#{path}/public/stylesheets/.gitignore")
  FileUtils.touch("#{path}/public/javascripts/.gitignore")
  FileUtils.touch("#{path}/public/images/.gitignore")
  FileUtils.touch("#{path}/views/templates/.gitignore")
  FileUtils.rm_r(path)
end

n = 1000
Benchmark.bm(7) do |b|
  b.report("FS:") { n.times { test } }
  
  require "fakefs/safe"
  FakeFS.activate!
  
  b.report("FakeFS:") { n.times { test } }
end

# % ruby fakefs_bench.rb
#              user     system      total        real
# FS:      1.460000   2.850000   4.310000 (  5.456569)
# FakeFS:  1.600000   0.010000   1.610000 (  1.680584)