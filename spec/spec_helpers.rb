
#
# spec'ing slipdf.js
#
# Tue Nov 21 17:26:37 JST 2017
#

require 'pp'
#require 'selenium-webdriver'
require 'io/console'
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
    sc0 = "[1;33m" # string color
    sc1 = "[0;33m" # string color
    c1 = "[0;32m" # result 1 color
    rc = "[0;0m" # reset color

    o, l = n['offset'], n['length']
    s = n['input']['string'][o..-1]
    r = n['result'].to_s; r = "#{c1}#{r}#{tc}" if r == '1'

    mw = IO.console.winsize[1] rescue 80

    sio = StringIO.new
    sio <<
      indent << tc << (n['name'] || '(null)') <<
      ' ' << r << ' ' <<
      n['parter'] << "(#{o}, #{l})"

    mw = mw - sio.length - 3 - 10; mw = 0 if mw < 0
    s = s[0, mw]
    if l < mw
      s.insert(l, sc1)
    elsif l > mw
      s = s + sc1 + '...'
    end
    s = s.gsub(/\n/, '\n')

    sio <<
      ' >' << sc0 << s << tc << '<'

    puts sio.string

    n['children'].each { |c| print_tree(c, indent + '  ') }
  end
end
RSpec.configure { |c| c.include(Helpers) }

