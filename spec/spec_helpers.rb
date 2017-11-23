
#
# spec'ing slipdf.js
#
# Tue Nov 21 17:26:37 JST 2017
#

require 'pp'
#require 'selenium-webdriver'
require 'execjs'


module Helpers

#  def run(s)
#
#    $driver ||=
#      begin
#        d = Selenium::WebDriver.for :phantomjs
#        #d = Selenium::WebDriver.for :chrome
#        d.navigate.to('file://' + File.absolute_path('spec/test.html'))
#        #d.execute_script('window._src = document.body.innerHTML;');
#        d
#      end
#
#    r = $driver.execute_script(s)
#
#    r = r.strip if r.is_a?(String)
#    r = r.gsub(/\n( *)/, "\n") if r.is_a?(String)
#
#    r
#  end

  def js(s)

    ExecJS
      .compile(
        File.read('spec/jaabro-1.1.0.min.js') +
        File.read('src/slipdf.js') +
        File.read('spec/helpers.js'))
      .exec(s)
  end

  def print_tree(n, indent='')

    tc = "[1;30m" # tree color
    sc = "[1;33m" # string color
    rc = "[0;0m" # reset color
    c1 = "[0;32m" # result 1 color

    o, l = n['offset'], n['length']; ll = (l == 0) ? 21 : l; ll = 21 if ll > 21
    s = n['input']['string'][o, ll]; s = s.gsub(/\n/, '\n')
    r = n['result'].to_s; r = "#{c1}#{r}#{tc}" if r == '1'

    puts(
      "#{indent}#{tc}#{n['name'] || '(null)'} #{r}" +
      " #{n['parter']}(#{o}, #{l})" +
      " >#{sc}#{s}#{tc}<#{rc}")

    n['children'].each { |c| print_tree(c, indent + '  ') }
  end
end
RSpec.configure { |c| c.include(Helpers) }

