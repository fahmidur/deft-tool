#!/usr/bin/env ruby

require 'yaml'

def parseLabel(label)
	name, time = label.split(" >> ")
	name.gsub!(/\s*\>\>\s*\n/, "")
	time.gsub!(/\s*\>\>\s*\n/, "") if time
	time.gsub!(/\n$/, "") if time
	if time !~ /\d+/
		time = nil
	end
	return {:speaker => name, :time => time}
end

def printGroup(label, lines, count)
	str = "<div class='group"+(label[:time] ? " please-label" : "")+"' id='group-#{count}' data-id='#{count}' data-speaker='#{label[:speaker]}' " +
	(label[:time] ? "data-time='#{label[:time]}'" : "") +
	">\n";
		str += "\t<div class='group-label' id='group-label-#{count}'>\n"+
			"\t\t<span class='speaker'>#{label[:speaker]}</span>\n" + 
			((label[:time]) ? "\t\t<span class='time'>#{label[:time]}</span>\n" : "") + 
		"\t</div>\n";


		str += "<textarea class='group-lines' readonly>\n"
			lines.each_with_index do |line, i|
				#str += "\t\t<p>#{line}</p>\n"
				str += line + ((i == lines.size-1) ? "" : "\n")
			end
		str += "</textarea>\n"
	str += "</div>"
	puts str;
end

group = []
label = ""
data = []

block_count = 1

File.open("fixed1-data.txt", "r").each_line do |line|
	if line =~ /^\n$/
		# puts "--------------------------"
		label = parseLabel(label)

		printGroup(label, group, block_count)

		data << {:label => label, :lines => group}
		group = []
		block_count+=1
	else
		if line =~ /^.+\>\>.*/
			label = line
		else
		group << line.chomp
		end
	end
end

#process last group
label = parseLabel(label)
printGroup(label, group, block_count)
data << {:label => label, :lines => group}


File.open("data.yaml", "w") {|f| f.write data.to_yaml }