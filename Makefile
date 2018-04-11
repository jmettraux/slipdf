
NAME:=$(shell basename `pwd`)
#SHA:=$(shell git log -1 --format="%H")
SHA:=$(shell git log -1 --format="%h")
NOW:=$(shell date)

VERSION:=$(shell grep VERSION src/$(NAME).js | ruby -e "puts gets.match(/VERSION = '([\d\.]+)/)[1]")


spec:
	bundle exec rspec

pkg_plain:
	mkdir -p pkg
	cp src/$(NAME).js pkg/$(NAME)-$(VERSION).js
	echo "/* from commit $(SHA) on $(NOW) */" >> pkg/$(NAME)-$(VERSION).js
	cp pkg/$(NAME)-$(VERSION).js pkg/$(NAME)-$(VERSION)-$(SHA).js

pkg_mini:
	#mkdir -p pkg
	#printf "/* $(NAME)-$(VERSION).min.js | MIT license: http://github.com/jmettraux/$(NAME)/LICENSE.txt */" > pkg/$(NAME)-$(VERSION).min.js
	##cat src/$(NAME).js | jsmin >> pkg/$(NAME)-$(VERSION).min.js
	#java -jar tools/closure-compiler.jar --js src/$(NAME).js >> pkg/$(NAME)-$(VERSION).min.js
	#echo "/* minified from commit $(SHA) on $(NOW) */" >> pkg/$(NAME)-$(VERSION).min.js
	#cp pkg/$(NAME)-$(VERSION).min.js pkg/$(NAME)-$(VERSION)-$(SHA).min.js

pkg: pkg_plain pkg_mini


.PHONY: spec pkg

