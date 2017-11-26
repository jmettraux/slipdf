
#
# Spec'ing Slipdf
#
# Tue Nov 21 18:15:32 JST 2017
#

require 'spec_helpers'


describe 'Slipdf' do

  describe '.prepare' do

    it 'creates a template' do

      src = %q{
        document
          footer
            image.logo
      }.inspect
      #print_tree(js "var src = #{src}; return Slipdf.debug(src, 2);")

      expect(
        js("return Slipdf.prepare(#{src});")
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'footer', 'cn' => [
              { 't' => 'image', 'cs' => %w[ logo ] }
            ] }
          ] }
      )
    end

    it 'creates a template (with strings)' do

      src = %q{
        document
          footer
            | fun stuff
      }.inspect
      #print_tree(js "var src = #{src}; return Slipdf.debug(src, 2);")

      expect(
        js("return Slipdf.prepare(#{src});")
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'footer', 'cn' => [
              { 's' => 'fun stuff' }
            ] }
          ] }
      )
    end

    it 'creates a template (with code)' do

      src = %q{
        document
          = user.name
          - user.items.forEach(function(i) \{
            = i.count
      }.inspect
      #print_tree(js "var src = #{src}; return Slipdf.debug(src, 3);")

      expect(
        js("return Slipdf.prepare(#{src});")
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 'x' => '=', 'c' => 'user.name' },
            { 'x' => '-', 'c' => 'user.items.forEach(function(i) {', 'cn' => [
              { 'x' => '=', 'c' => 'i.count' }
            ] },
          ] }
      )
    end

    it 'creates a template (with eol code)' do

      src = %q{
        document
          orientation= user.name
      }.inspect
      #print_tree(js "var src = #{src}; return Slipdf.debug(src, 2);")

      expect(
        js("return Slipdf.prepare(#{src});")
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'orientation', 'cn' => [
              { 'x' => '=', 'c' => 'user.name' }
            ] },
          ] }
      )
    end

    it 'creates a template (with eol text)' do

      src = %q{
        document
          orientation landscape
      }.inspect
      #print_tree(js "var src = #{src}; return Slipdf.debug(src, 2);")

      expect(
        js("return Slipdf.prepare(#{src});")
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'orientation', 'cn' => [
              { 's' => ' landscape' }
            ] },
          ] }
      )
    end

    it 'creates a template (with hash bracket)' do

      src = %q{
        doc
          x user: #{user.login} id: #{user.id}
            | name: #{user.name}
      }.inspect
      #print_tree(js "var src = #{src}; return Slipdf.debug(src, 2);")

      expect(
        js("return Slipdf.prepare(#{src});")
      ).to eq(
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

      src = %q{
        doc
          - user.children.forEach(function(c) \{
            name= c.name
      }.inspect
      #print_tree(js "var src = #{src}; return Slipdf.debug(src, 2);")

      expect(
        js("return Slipdf.prepare(#{src});")
      ).to eq(
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
        js("return Slipdf.prepare(#{src});")
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'tag', 'as' => [
              [ 'att0', '"val0"' ], [ 'att1', '"val1"' ]
            ] }
          ] }
      )
    end

    it 'creates a template (with parenthesis attributes)' do

      src = %q{
        document
          tag att0=(val0) att1=([val1](nada)) att2=[ 1, 2, 3 ] att3={a:'b'}
      }.inspect
      #print_tree(js "var src = #{src}; return Slipdf.debug(src, 2);")

      expect(
        js("return Slipdf.prepare(#{src});")
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'tag', 'as' => [
              [ 'att0', '(val0)' ],
              [ 'att1', '([val1](nada))' ],
              [ 'att2', '[ 1, 2, 3 ]' ],
              [ 'att3', "{a:'b'}" ]
            ] }
          ] }
      )
    end

    it 'creates a template (with double quoted attributes)' do

      src = %q{
        document
          tag att0="abc#{def["x"]}nada"
      }.inspect
      #print_tree(js "var src = #{src}; return Slipdf.debug(src, 2);")

      expect(
        js("return Slipdf.prepare(#{src});")
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'tag', 'as' => [
              [ 'att0', '"abc#{def["x"]}nada"' ],
            ] }
          ] }
      )
    end
  end
end

