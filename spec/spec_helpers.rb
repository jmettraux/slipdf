
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
end
RSpec.configure { |c| c.include(Helpers) }

