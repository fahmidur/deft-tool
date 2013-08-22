#!/usr/bin/env perl

BEGIN {
    my $b__dir = (-d '/home4/syedrez1/perl'?'/home4/syedrez1/perl':( getpwuid($>) )[7].'/perl');
    unshift @INC,$b__dir.'5/lib/perl5',$b__dir.'5/lib/perl5/x86_64-linux-thread-multi',map { $b__dir . $_ } @INC;
}

use CGI::Fast;
use appTest;

while (my $q = new CGI::Fast) {
	my $app = appTest->new(QUERY => $q);
	$app->run();
}