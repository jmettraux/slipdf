
#
# Spec'ing Slipdf
#
# Tue Nov 21 18:15:32 JST 2017
#

require 'spec_helpers'


describe 'Slipdf' do

  describe '.prepare' do

    it 'creates a template' do

      expect(
        js %q{
          var s =
            'document\n' +
            '  footer\n' +
            '    image.logo\n';
          return Slipdf.prepare(s);
        }
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'footer', 'cn' => [
              { 't' => 'image', 'cs' => %w[ logo ] }
            ] }
          ] }
      )
    end

    it 'creates a template (with strings)' do

      #print_tree js(%q{
      #  var s =
      #    'document\n' +
      #    '  footer\n' +
      #    '    | fun stuff\n';
      #  return Slipdf.debug(s, 3);
      #})
      expect(js %q{
        var s =
          'document\n' +
          '  footer\n' +
          '    | fun stuff\n';
        return Slipdf.prepare(s);
      }).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'footer', 'cn' => [
              { 's' => 'fun stuff' }
            ] }
          ] }
      )
    end

    it 'creates a template (with code)' do

      expect(js %q{
        var s =
          'document\n' +
          '  = user.name\n' +
          '  - user.items.forEach(function(i) \{\n' +
          '    = i.count\n';
        return Slipdf.prepare(s);
      }).to eq(
        { 't' => 'document', 'cn' => [
            { 'x' => '=', 'c' => 'user.name' },
            { 'x' => '-', 'c' => 'user.items.forEach(function(i) {', 'cn' => [
              { 'x' => '=', 'c' => 'i.count' }
            ] },
          ] }
      )
    end

    it 'creates a template (with eol code)' do

      #print_tree js(%q{
      #  var s =
      #    'document\n' +
      #    '  orientation= user.name\n';
      #  return Slipdf.debug(s, 3);
      #})
      expect(js %q{
        var s =
          'document\n' +
          '  orientation= user.name\n';
        return Slipdf.prepare(s);
      }).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'orientation', 'cn' => [
              { 'x' => '=', 'c' => 'user.name' }
            ] },
          ] }
      )
    end

    it 'creates a template (with eol text)' do

      expect(js %q{
        var s =
          'document\n' +
          '  orientation landscape\n';
        return Slipdf.prepare(s);
      }).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'orientation', 'cn' => [
              { 's' => ' landscape' }
            ] },
          ] }
      )
    end

    it 'creates a template (with hash bracket)' do

      #print_tree js(%q{
      #  var s =
      #    'doc\n' +
      #    '  x user: #{user.login} id: #{user.id}\n' +
      #    '    | name: #{user.name}\n';
      #  return Slipdf.debug(s, 3);
      #})
      expect(js %q{
        var s =
          'doc\n' +
          '  x user: #{user.login} id: #{user.id}\n' +
          '    | name: #{user.name}\n';
        return Slipdf.prepare(s);
      }).to eq(
        { 't' => 'doc', 'cn' => [
            { 't' => 'x', 'cn' => [
              { 's' => ' user: ' },
              { 'x' => '=', 'c' => 'user.login' },
              { 's' => ' id: ' },
              { 'x' => '=', 'c' => 'user.id' },
              { 's' => 'name: ' },
              { 'x' => '=', 'c' => 'user.name' },
            ] },
          ] }
      )
    end

    it 'creates a template (with loop)' do

      expect(js %q{
        var s =
          'doc\n' +
          '  - user.children.forEach(function(c) \{\n' +
          '    name= c.name\n';
        return Slipdf.prepare(s);
      }).to eq(
        { 't' => 'doc', 'cn' => [
          { 'x' => '-', 'c' => 'user.children.forEach(function(c) {', 'cn' => [
            { 't' => 'name', 'cn' => [
              { 'x' => '=', 'c' => 'c.name' } ] } ] } ] }
      )
    end

    it 'creates a template (with plain attributes)' do

      src = %q{
        document
          tag att0="val0" att1="val1"
      }.inspect
      #print_tree(js "var src = #{src}; return Slipdf.debug(src, 2);")

      expect(
        js "return Slipdf.prepare(#{src});"
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'tag', 'as' => [
              [ 'att0', '"val0"' ], [ 'att1', '"val1"' ]
            ] }
          ] }
      )
    end
  end
end

