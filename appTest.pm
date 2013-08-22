#!/usr/bin/env perl -T

BEGIN {
    my $b__dir = (-d '/home4/syedrez1/perl'?'/home4/syedrez1/perl':( getpwuid($>) )[7].'/perl');
    unshift @INC,$b__dir.'5/lib/perl5',$b__dir.'5/lib/perl5/x86_64-linux-thread-multi',map { $b__dir . $_ } @INC;
}


package appTest; use base 'CGI::Application';

use CGI::Session;
use CGI::Application::Plugin::TT;
use CGI::Application::Plugin::DBH (qw/dbh_config dbh/);
use CGI::Application::Plugin::Session;
use CGI::Application::Plugin::Stream (qw/stream_file/);
use CGI::Application::Plugin::Redirect;
use CGI::Application::Plugin::Forward;

use List::Util 'shuffle';
use Digest::MD5 qw(md5_hex);
use DateTime;
use Data::Dumper;
use Tenjin;
use JSON;
use Crypt::OpenSSL::AES;

use utf8;

sub cgiapp_init { my $self = shift;
	$self->dbh_config("dbi:SQLite:database.sqlite3") or die "DTB connection fail";
	$self->session_config(
		CGI_SESSION_OPTIONS => [ "driver:File", $self->query, {Directory=>'./sessions'} ]
	);
	#Tenjin
	my $tenjin = Tenjin->new({
		layout => "layout.html",
		path => ["templates"],
		encoding => 'UTF-8',
	});

	$self->param('tenjin', $tenjin);
}
sub setup {
	my $self = shift;
	$self->run_modes(
		'landing'						=> 'rm_landing',
		'login'							=> 'rm_login',
		'logout'						=> 'rm_logout',

		'save_group'					=> 'rm_save_group',
		'load_group'					=> 'rm_load_group',
		#----ERROR MODE--------------------------------------
		'AUTOLOAD'						=> 'rm_missing_rm',
	);
	$self->start_mode('landing');
	$self->mode_param('m');
}
sub rm_save_group { my $self = shift;

	if(!$self->is_logged_in()) {
		return to_json({ok => 0, error => "Please log in"});
	}

	my $t = $self->param('tenjin');
	my $q = $self->query();

	my $id = $q->param("id");
	my $text = $q->param("text");

	my %user = $self->current_user();
	my $email = $user{'email'};

	my $cpath = "../corp-deft";
	unless(-e $cpath) { mkdir $cpath; }

	$email =~ s/\.\./\./g;
	$cpath .= "/".$email;
	unless(-e $cpath) { mkdir $cpath; }

	$id =~ s/\.\.//g;
	$cpath .= "/".$id.".txt";

	#clobber file
	open(my $fh, ">:utf8", $cpath);
	print $fh $text;
	# print $fh "’";
	close($fh);

	return to_json({ok => 1, email => $email, id => $id});
}
sub rm_load_group { my $self = shift;
	if(!$self->is_logged_in()) {
		return to_json({ok => 0, error => "Please log in"});
	}
	my $q = $self->query();
	my $id = $q->param("id");

	unless($id =~ /^group\-\d+$/) {
		return to_json({ok => 0, error => "group id not valid"});
	}

	my %user = $self->current_user();
	my $email = $user{'email'};

	my $cpath = "../corp-deft/$email/$id.txt";

	unless(-e $cpath) {
		return to_json({ok => 0, error => "does not exist"});
	}

	open(my $fh, "<$cpath");
	return to_json({ok => 1, text => join('', <$fh>)});
	close($fh);
}
sub rm_missing_rm { my $self = shift;
	my $t = $self->param('tenjin');
	return $t->render("missing.html");
}
sub rm_login { my $self = shift;
	my $t = $self->param("tenjin");
	my $q = $self->query();
	my $dbh = $self->dbh();

	my $email = $q->param("email");
	my $password = $q->param("password");

	my $user = $dbh->selectrow_hashref("SELECT * FROM users WHERE email=? AND password=?", undef, $email, $password);
	if($user != undef) {
		$self->session()->param("logged_in", "yes");
		$self->session()->param("email", $user->{"email"});
		$self->session()->param("fname", $user->{"firstname"});
		$self->session()->param("flname", $user->{"lastname"});
	} else {
		$self->session()->clear(["logged_in", "email", "fname", "lname"]);
	}
	return $self->redirect("?m=landing");
}
sub rm_logout {my $self = shift;
	$self->session()->clear(["logged_in", "email", "fname", "lname"]);
	return $self->redirect("?m=landing");
}
sub rm_landing { my $self = shift;
	my $t = $self->param('tenjin');
	$self->header_add(-type => "text/html; charset=UTF-8");

	if($self->is_logged_in()) {
		return $t->render("label.html", {
			logged_in => $self->session()->param("logged_in"),
			email => $self->session()->param("email"),
			fname => $self->session()->param("fname"),
			lname => $self->session()->param("flname"),
		}, "");
	}
	return $t->render("landing.html");
}
sub is_logged_in { my $self = shift;
	if($self->session()->param("logged_in") eq "yes") {
		return 1;
	}
	return 0;
}
sub current_user { my $self = shift;
	if(!$self->is_logged_in()) {
		return undef;
	}
	my $s = $self->session();
	my %user = (
		email => $s->param("email"),
		fname => $s->param("fname"),
		lname => $s->param("lname"),
	);
	return %user;
}
sub mail { my ($to, $from, $subject, $message) = @_;
 	my $sendmail = '/usr/sbin/sendmail';
 	open(MAIL, "|$sendmail -oi -t") or return 0;
 		print MAIL "From: $from\n";
 		print MAIL "To: $to\n";
 		print MAIL "Subject: $subject\n\n";
 		print MAIL "$message\n";
 	close(MAIL);
 	return 1; #success
}
1;
