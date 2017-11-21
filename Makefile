
VERSION:=$(shell grep VERSION src/slipdf.js | ruby -e "puts gets.match(/VERSION: '([\d\.]+)/)[1]")

#SHA:=$(shell git log -1 --format="%H")
SHA:=$(shell git log -1 --format="%h")
NOW:=$(shell date)


spec:
	bundle exec rspec

pkg_plain:
	mkdir -p pkg
	cp src/slipdf.js pkg/slipdf-$(VERSION).js
	echo "/* from commit $(SHA) on $(NOW) */" >> pkg/slipdf-$(VERSION).js

pkg_mini:
	mkdir -p pkg
	printf "/* slipdf-$(VERSION).min.js | MIT license: http://github.com/jmettraux/slipdf/LICENSE.txt */" > pkg/slipdf-$(VERSION).min.js
	#cat src/slipdf.js | jsmin >> pkg/slipdf-$(VERSION).min.js
	java -jar tools/closure-compiler.jar --js src/slipdf.js >> pkg/slipdf-$(VERSION).min.js
	echo "/* minified from commit $(SHA) on $(NOW) */" >> pkg/slipdf-$(VERSION).min.js

pkg: pkg_plain pkg_mini


.PHONY: spec pkg

