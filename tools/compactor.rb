
# see ../LICENSE.txt for license

STDIN.readlines.each do |line|

  l = line.strip

  next if l == ''
  next if l.match(/\A\/\//)

  #puts l
  if line.match(/\A  /)
    puts line[2..-1]
  else
    puts line
  end
end

