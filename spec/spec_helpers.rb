
#
# spec'ing slipdf.js
#
# Tue Nov 21 17:26:37 JST 2017
#

require 'pp'
require 'yaml'
require 'io/console'
#require 'execjs'
require 'ferrum'


module Helpers

  #def run(s)
  #  $driver ||=
  #    begin
  #      d = Selenium::WebDriver.for :phantomjs
  #      #d = Selenium::WebDriver.for :chrome
  #      d.navigate.to('file://' + File.absolute_path('spec/test.html'))
  #      #d.execute_script('window._src = document.body.innerHTML;');
  #      d
  #    end
  #  r = $driver.execute_script(s)
  #  r = r.strip if r.is_a?(String)
  #  r = r.gsub(/\n( *)/, "\n") if r.is_a?(String)
  #  r
  #end
    #
  #def js(s)
  #  ExecJS
  #    .compile(
  #      File.read('spec/jaabro-1.1.0.min.js') +
  #      File.read('src/slipdf.js') +
  #      File.read('spec/helpers.js'))
  #    .exec(s)
  #end
    #
  def js(s)

    $sources ||=
      begin
        %w[ spec/jaabro-1.1.0.min.js src/slipdf.js spec/helpers.js ]
          .collect { |path| File.read(path) }
          .join(';')
      end
    $browser ||=
      begin
        Ferrum::Browser.new(js_errors: true)
      end

    s = "JSON.stringify((function() { #{$sources}; #{s}; })())"
    j = $browser.evaluate(s)

    JSON.parse(j)
  end

  def print_tree(n, indent=0)

    tc =  "[0;90m" # tree color
    sc0 = "[1;33m[4m" # string color 0
    sc1 = "[0;33m" # string color 1
    c1 =  "[0;32m" # result 1 color
    rc =  "[0;0m" # reset color
    rdc = "[1;31m" # red color
    nc =  "[0;97m" # name color

    if indent == 0
      n['input']['string']
        .split("\n")
        .each { |l| puts "#{tc}  │#{sc1}#{l}#{rc}" }
    end

    o, l = n['offset'], n['length']
    s = n['input']['string'][o..-1]
    res = n['result']
    r = res.to_s; r = "#{c1}#{r}#{tc}" if res == 1

    mw = IO.console.winsize[1] rescue 80

    na = n['name']; na = na ? "#{nc}#{na}#{tc}" : '(null)'

    ind = (0..indent)
      .inject('') { |ss, i|
        ss +
          case i % 3
          when 0 then '│ '
          when 1 then '· '
          else '· '; end }

    sio =
      StringIO.new
    sio <<
      ind << tc << na << ' ' << r << ' ' << n['parter'] << "(#{o}, #{l})"

    if res != 1
      #sc0 = "[1;90m";
      sc1 = "[0;90m"
    end

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

    n['children'].each { |c| print_tree(c, indent + 1) }

    if indent == ''
      il = n['input']['string'].length
      tl = n['length']; tl = "#{rdc}#{tl}#{rc}" if tl != il
      puts "├─ input length:  #{il}"
      puts "└─ tree length:   #{tl}"
    end
  end
end
RSpec.configure { |c| c.include(Helpers) }

