var timelineIntervalId;

function showFlashPlayer(width,height,divName,pID,eID,cID,aID,plID,start,end,net,startOffset,endOffset,personid,noshare,autoplay,autostart,privateHash)
{
	if ( width == undefined ) 
		width = 646;
	if ( height == undefined ) 
		height = 528;
	var vidwidth = width - 8; //total width minus border width from both sides
	var vidheight = height - 68; //total height minus border height from top and bottom minus the height of the control panel 
	if ( startOffset === undefined ) 
		startOffset = 0;
	if ( endOffset === undefined ) 
		endOffset = 0;
	if(autostart === undefined)
		autostart = 0;

	if ( privateHash === undefined 
	 || privateHash == 0 )
		privateHash = '';
	else
		privateHash = 'x'+privateHash;
		
	if ( personid===undefined
		|| personid == 0 ) 
		personid = ''; 
	else 
		personid = 'p'+personid; 
	var params = { 
		bgcolor: '#ffffff', 
		base: 'swf', 
		allowScriptAccess: 'always', 
		allowFullScreen: 'true', 
		quality: 'high', 
		wmode: 'transparent' 
	}; 
	if( noshare != undefined 
		&& noshare != 0 ) 
		params['noshare'] = 'true';

	if(pID != undefined)
	{
		if(net != undefined && net > 0)
			system = 'http://www.c-spanvideo.org/common/services/flashXml.php?z=' + start + '-' + end + '-' + net + '-' + pID;
		else
			system = 'http://www.c-spanvideo.org/common/services/flashXml.php?programid=' + pID + personid + privateHash;
	}
	else if(cID != undefined)
	{
		system = 'http://www.c-spanvideo.org/common/services/flashXml.php?clipid=' + cID;
		if(cID.toString().indexOf('n') == 0)
			cID = cID.toString().substring(1);
	}
	else if(aID != undefined)
		system = 'http://www.c-spanvideo.org/common/services/flashXml.php?appid=' + aID;
	else if(plID != undefined)
		system = 'http://www.c-spanvideo.org/common/services/flashXml.php?playlistid=' + plID;
	else
		system = 'http://www.c-spanvideo.org/common/services/flashXml.php?eventid=' + eID + personid;
	
	var flashvars = { 
		system: system, 
		style: 'inline' 
	}; 
	if ( startOffset != 0 || endOffset != 0 ) 
	{ 
		flashvars['autoplay'] = 'true'; 
		flashvars['start'] = startOffset; 
		flashvars['end'] = endOffset; 
	} 
	else if ( personid != '' || ( autoplay != undefined && autoplay != 0 ) ) 
	{
		flashvars['autoplay'] = 'true'; 
	}
	if(noshare != undefined && noshare != 0)
		flashvars['noshare'] = 'true';
	if(autostart > 0)
		flashvars['initSeek'] = autostart;
	var attributes = { 
		id: 'flashPlayer', 
		name: 'flashPlayer' 
	}; 
	
	var fpversion = '10.2.0';
	var fpversionOld = '10.0.0';

	var player = 'CSPANPlayer.13.07.22.swf';
	var ok = 0;

	if(swfobject.hasFlashPlayerVersion(fpversion))
	{
		ok = 1;
	}
	else if(swfobject.hasFlashPlayerVersion(fpversionOld))
	{
		ok = 1;
		player = 'CSPANPlayer_ppc.swf';
	}

	player = 'http://static.c-spanvideo.org/assets/swf/' + player;

	if ( ok == 1 )
	{
		if(pID != undefined)
		{
			if ( privateHash == 0 )
				swfobject.embedSWF(player + '?programid=' + pID, divName, width, height, fpversion, false, flashvars, params, attributes, false);
			else
				swfobject.embedSWF(player + '?programid=' + pID, divName, width, height, fpversion, false, flashvars, params, attributes, false);
		}
		else if(cID != undefined)
			swfobject.embedSWF(player + '?clipid=' + cID, divName, width, height, fpversion, false, flashvars, params, attributes, false);
		else if(aID != undefined)
			swfobject.embedSWF(player + '?appid=' + aID, divName, width, height, fpversion, false, flashvars, params, attributes, false);
		else if(plID != undefined)
			swfobject.embedSWF(player + '?playlistid=', divName, width, height, fpversion, false, flashvars, params, attributes, false);
		else
			swfobject.embedSWF(player + '?eid=' + eID, divName, width, height, fpversion, false, flashvars, params, attributes, false);
	}
	else
	{
		var iframePlayer = "<font color='red'>Flash version " + fpversionOld + " required to view this video. " +
			"Please <a href='http://get.adobe.com/flashplayer/'>upgrade to the latest verison of Flash</a>";
		if(pID != undefined)
			iframePlayer += ", or use a browser that supports HTML5 MP4 video streaming.</font>\n" +
				"<iframe width='" + width + "' height='" + height + "' src='/videoLibrary/embed/embed.php?programid=" + pID + "&width=" + (width - 20) + "&noFlash' frameborder='0'></iframe>";
		else if(cID != undefined)
			iframePlayer += ", or use a browser that supports HTML5 MP4 video streaming.</font>\n" +
				"<iframe width='" + width + "' height='" + height + "' src='/videoLibrary/embed/embed.php?clipid=" + cID + "&width=" + (width - 20) + "&noFlash' frameborder='0'></iframe>";
		else
			iframePlayer += ".</font>";
		
		document.getElementById(divName).innerHTML = iframePlayer;
	}
}

$(document).ready(function() {

	if($("#own").length > 0)
		initPurchasePanel();
	
	if($("#clipPurchase > div").length > 0)
		initClipPurchasePanel();
	
	if($("#userOptions").length > 0)
	{
		$("#userOptions a.user_action").unbind('click').click(function(){
			$.ajax({
				url: $(this).attr('href'),
				type: "GET",
				data: $("#userOptions form").serialize() + "&action=" + $(this).attr('rel'),
				success: function(html){
					$.fancybox(html, {scrolling: 'no'});
//					alert('create clip');
					Cufon.refresh('.swap-cufon');
					$("#createClip").unbind('submit').submit(function(){
						var clipform = $(this);
						$.ajax({
							url: $(clipform).attr('action'),
							type: "POST",
							data: $(clipform).serialize(),
							success: function(html){
								if(html.match(/clip_error/))
								{
									$.fancybox(html, {scrolling: 'no'});
									Cufon.refresh('.swap-cufon');
								}
								else
								{
									$.fancybox.close();
									location.href = $("#currentUserLink").attr('href') + "&filter=clips";
								}
							}
						});
						return false;
					});
				}
			});
			return false;
		});
		$("#userOptions input[name='progfav']").unbind('click').click(function(){
			var thischk = $(this);
			var chkdata = $("#userOptions form").serialize() + "&action=updateFavorite";
			if($(thischk).is(":checked"))
				chkdata += "&progfav";
			$(thischk).attr('disabled', 'disabled');
			$.ajax({
				url: $("#userOptions form").attr('action'),
				type: "POST",
				data: chkdata,
				success: function(html){
					$(thischk).removeAttr('disabled');
					$(thischk).parent().siblings(".user_timestamp").html(html);
				}
			});
			return true;
		});
	}
	
	if($("#userShare").length > 0)
	{
		$("#userShare .program_follow").unbind("click").click(function(){
			if(!$(this).hasClass("disabled"))
			{
				if($("#userShareForm").length == 0)
				{
					$.ajax({
						url: "/videoLibrary/ajax/ajax-widget-public.php?type=user_cliplogin&saveProgram=" + $("#userShare .follower_list").attr('rel'),
						type: "GET",
						success: function(html){
							$.fancybox(html, {scrolling: 'no'});
							Cufon.refresh('.swap-cufon');
							$("#userClipLogin").unbind('submit').submit(function(){
								var loginform = $(this);
								$.ajax({
									url: $(loginform).attr('action'),
									type: "POST",
									data: $(loginform).serialize(),
									success: function(html){
										if(html.match(/login_error/))
										{
											$("#userClipLogin .error").html(html);
										}
										else
										{
											$.fancybox.close();
											location.href = "/program/id/" + $("#userShare .follower_list").attr('rel') + "&saveProgram";
										}
									}
								});
								return false;
							});
						}
					});
					return false;
				}
				$(this).addClass("disabled");
				if(!$(this).hasClass("program_follow_selected"))
				{
					$("#userShare .follower_list").text(VLAddCommas(parseInt($("#userShare .follower_list").text().replace(/\,/g,''),10) + 1));
					$(this).addClass("program_follow_selected");
					$("#userShareForm input[name='progfav']").val(1);
					$("#userShareForm").submit();
				}
				else
				{
					$("#userShare .follower_list").click();
				}
				
			}
			return false;
		});
		
		$("#userShareForm").unbind("submit").submit(function(){
			$("#userShareForm .submit_status").text('');
			$.ajax({
				url: $("#userShareForm").attr('action'),
				type: "POST",
				data: $("#userShareForm").serialize(),
				success: function(html){
					var thisstar = $("#userShareForm .program_follow");
					$(thisstar).removeClass('disabled');
					if($(thisstar).hasClass("program_follow_selected"))
					{
						$("#userShare .follower_list").click();
						$(thisstar).attr('title', html);
						if(!$("#userShareForm .follower_comment").is(":visible"))
							$("#userShareForm .follower_comment").slideDown('fast');
						else
							$("#userShareForm .submit_status").text('Comment updated');
					}
					else
					{
						$(thisstar).attr('title', 'Click to save this program');
						$("#userShareForm .follower_comment").slideUp('fast');
					}
				}
			});
			return false;
		});
		
		$("#userShare .follower_list").unbind("click").click(function(){
			$.ajax({
				type: "GET",
				url: "/videoLibrary/ajax/ajax-widget-public.php?type=program_liststars&id=" + $(this).attr('rel'),
				success: function(html){
					$.fancybox(html, {scrolling: 'no'});
					Cufon.refresh('.swap-cufon');
					$("#userShareForm .program_follow").removeClass('disabled');
					$("#commentForm").unbind("submit").submit(function(){
						$("#commentForm button").attr('disabled', 'disabled');
						$.ajax({
							type: "POST",
							url: $(this).attr('action'),
							data: $(this).serialize(),
							success: function(html){
								$("#starUserList ul").fadeOut('fast', function(){
									$("#starUserList ul").html(html).fadeIn('fast');
									$("#commentForm button").removeAttr('disabled');
								});
							}
						});
						return false;
					});
					$("#starUserList .remove_saved").unbind('click').click(function(){
						$("#userShare .follower_list").text(VLAddCommas(parseInt($("#userShare .follower_list").text().replace(/\,/g,''),10) - 1));
						$("#userShare .program_follow").removeClass("program_follow_selected");
						$("#userShareForm input[name='progfav']").val(0);
						$.fancybox.close();
						$("#userShareForm").submit();
						return false;
					});
				}
			});
			return false;
		});
	}

	$(document).on({
		'click': function(e){
			e.stopPropagation();
			$.fancybox.close();
			$("#createClip").submit();
			return false;
		}
	}, "#clipSkipLogin");
	$(document).on({
		'click': function(e){
			e.stopPropagation();
			$.fancybox.close();
			$.ajax({
				url: "/videoLibrary/ajax/ajax-widget-public.php",
				type: "POST",
				data: "type=user_removerecentclip&clipid=" + $("#createClip input[name='exClipid']").val(),
				success: function(){
					$("#createClip input[name='exClipid']").val(0);
				}
			});
			return false;
		}
	}, "#clipCancel");
});

$(document).ready(function() {
	var container = $("#flagVideo");	

	$.ajax({
		type: "GET",
		url: $(container).attr("rel"),
		success: function(html){
			$(container).html(html);
			if(html.length == 0)
				$(container).html("<br/>");

			$(container).fadeIn("slow");
		
			var val = $("#options div div ul li:first-child a").attr("rel");

			$("#options div .smallBack").val(val);

			$("#flagVideo #text .videoFlag").unbind("click").click(function() {
				
				if($(this).attr("href") == "Request")
				{
					$.ajax({
						type: "GET",
						url: $(container).attr("rel"),
						data: {flag:"Request"},
						success: function(html) {
							$(container).html(html);
							$(container).fadeIn("slow");					
						}

					});
					return false;
				}

				$(this).parent().hide();
				$(this).parent().parent().children("#options").show();
				return false;
			});

      			$("#options .select").unbind('click').click(function(){
                		$(this).children('div').slideToggle();
        		});

        		$("#flagVideo .select ul li a").unbind('click').click(function(){

              			var container = $( "#options .select span" );

                		$(container).text( $(this).text() );

                		$(this).parent().parent().parent().slideUp();

                		return false;
       			});

			$("#flagVideo input[type=submit]").unbind('click').click(function() {
				var option = $( "#options .select span" );

				if($( option ).text() == "Other" && $("#otherText").val() == "")
				{
					$("#options").hide();
					$("#explain").show();
					
					return false;
				}

			        $.ajax({
       				         type: "GET",
       				         url: $(container).attr("rel"),
					 data: {flag:$( option ).text(), comment:$("#otherText").val()},
        			         success: function(html){
			                        $(container).html(html);

                        			$(container).fadeIn("slow");
						return false;
					}
				});
			});
		}
	});

	if($("#mobileFlagWrapper").length > 0)
	{
		$.ajax({
			type: "GET",
			url: $("#mobileFlagWrapper").attr('rel'),
			success: function(html){
				if(html.length > 0)
				{
					$("#mobileFlagLink").addClass('ui-disabled').addClass('ui-btn-active').find(".ui-btn-text").text(html);
				}
				$("#mobileFlagWrapper").show();
			}
		});
		
		$("#mobileFlagLink").unbind('click').click(function(){
			if(!$(this).hasClass('ui-disabled'))
			{
				$(this).hide();
				$("#mobileFlagForm").show();
			}
			return false;
		});
		$("#mobileFlagForm").unbind('submit').submit(function(){
			$.ajax({
				type: "GET",
				url: $("#mobileFlagForm").attr('action'),
				data: $("#mobileFlagForm").serialize(),
				success: function(html){
					if(html.length > 0)
					{
						$("#mobileFlagLink").addClass('ui-disabled').addClass('ui-btn-active').find(".ui-btn-text").text(html);
					}
					$("#mobileFlagForm").hide();
					$("#mobileFlagLink").show();
				}
			});
			return false;
		});
		$("#mobileFlagForm input[type='radio']").unbind('click').click(function(){
			if($(this).val() == 'Other')
				$("#flagCommentWrapper").show();
			else
				$("#flagCommentWrapper").hide();
			return true;
		});
	}
});

$(document).ready(function() {
	$("#video-width").blur(function() {

		if($(this).attr("rel") != $(this).val())
			$(this).addClass("changed");

		if(!$("#video-height").hasClass("changed"))
		{
			if($("#video-info").is(":checked"))
				var scale = (500/410);
			else
				var scale = (375/410);

			$("#video-height").val(Math.round($(this).val()*scale));
			$("#video-height").attr("rel", $("#video-height").val());
			$("#video-height").blur();
		}

		updateTextCopy("width", $(this).val());
	});

	$("#video-height").blur(function() {

		if($(this).attr("rel") != $(this).val())
			$(this).addClass("changed");

		if(!$("#video-width").hasClass("changed"))
		{
			if($("#video-info").is(":checked"))
				var scale = (410/500);
			else
				var scale = (410/375);
			
			$("#video-width").val(Math.round($(this).val()*scale));
			$("#video-width").attr("rel", $("#video-width").val());
			$("#video-width").blur();
		}

		updateTextCopy("height", $(this).val());
	});

	$("#video-info").click(function () {
		var to = "";
		var from = "";

		if($(this).is(":checked"))
		{
			to = "full";
			from = "embedded";
		} else {
			to = "embedded";
			from = "full";
		}
		
		var text = $("#codeBox textarea");
		var str = $(text).text();

		var pattern = "style=" + from;
		
		var regex = new RegExp(pattern, "g");

		str = str.replace(regex, "style=" + to);

		text.text(str);

		if(to == "embedded")
		{
			$("#video-height").val(375);
			$("#video-height").attr("rel", 375);
			$("#video-height").blur();
			$("#video-width").val(410);
			$("#video-width").attr("rel", 410);
			$("#video-width").blur();
			$("#video-height").removeClass("changed");
			$("#video-width").removeClass("changed");
		} else {
			$("#video-height").val(500);
			$("#video-height").attr("rel", 500);
			$("#video-height").blur();
			$("#video-width").val(410);
			$("#video-width").attr("rel", 410);
			$("#video-width").blur();
			$("#video-height").removeClass("changed");
			$("#video-width").removeClass("changed");
		}
	});

	function updateTextCopy(wording, val)
	{
		var text = $("#codeBox textarea");
		var str = $(text).text();

		var pattern = wording + "='\\d+'";

		var regex = new RegExp(pattern, "g");

		str = str.replace(regex, wording + "='" + val +"'"); 

		text.text(str);
	}
});


$(function(){

	$("#who .grid-view").unbind("click").click(function(){
		$("#who .grid").show();
		$("#who .list").hide();
		
		return false;
	});

	$("#who .list-view").unbind("click").click(function(){
		$("#who .grid").hide();
		$("#who .list").show();
		
		return false;
	});
	
	$("#featuredVideo .video-content #dispFullAbstract").click(function(){
		$("#featuredVideo .video-content .shortAbstract").hide();
		$("#featuredVideo .video-content .fullAbstract").show();
		
		return false;
	});

	//$("#tabBox").tabs();
	
	$("#shareBox input[type=text]").hover(
		function() {
			$(this).css("background-color", "#CCCCCC");
		}, function() {
			if($(this).attr("rel") != "in")
				$(this).css("background-color", "#DDDDDD");
		}
	);

	$("#shareBox input[type=text]").focus(function(){

		$(this).css("background-color", "#CCCCCC");
		$(this).attr("rel", "in");

		if($(this).attr("title") == $(this).val())
			$(this).val("");
	}); 

	$("#shareBox input[type=text]").blur(function(){

		$(this).css("background-color", "#DDDDDD");
		$(this).attr("rel", "");

		if($(this).val() == "")
			$(this).val($(this).attr("title"));
	});

	$("#shareBox .send-video").click(function(){
		if($("#shareBox .share-pop:visible").length > 0)
			$("#shareBox .share-pop").slideUp({ direction: 'down'});
		else if($("#shareBox .share-confirm:visible").length > 0)
			$("#shareBox .share-confirm").slideUp({ direction: 'down'});
		else
			$("#shareBox .share-pop").slideDown({ direction: 'down'});
		
		return false;
	});
	
	$("#close-send").click(function(){
		$("#shareBox .share-pop").slideUp({ direction: 'down'});
		
		return false;
	});
	
	$("#close-confirm").click(function(){
		$("#shareBox .share-confirm").slideUp({ direction: 'down'});
		
		return false;
	});
	
	$("#shareEmail").submit(function(){
		
		$.post("/videoLibrary/ajax/ajax-share-email.php", {
			sender: $("#send-fromname").val(),
			recipient: $("#send-toname").val(),
			email: $("#send-email").val(),
			progid: $("#send-progid").val()
		},
		function(data){
			$("#shareBox .share-confirm .top").html(data);
			$("#shareBox .share-confirm").show();
			$("#shareBox .share-pop").hide();
		});
		
		return false;
	});
	
	if($("#clipThumbnails").length > 0)
	{
		initThumbnails();
		$("#clipThumbnails .refresh_screenshots").unbind('click').click(function(){
			if($("#clipThumbnails .clip_screenshots img.selected").length > 0)
			{
				$("#clipThumbnails .clip_screenshots img.selected").removeClass('selected');
				$("#clipThumbnails .clip_program img.clip_thumb").addClass('selected');
			}
			var timeoffset = 0
			try
			{
				var flashObject = document.getElementById('flashPlayer');
				timeoffset = flashObject.getTime();
			}
			catch(err) {
			}
			$.ajax({
				type: "GET",
				url: $("#clipThumbnails .refresh_screenshots").attr('href') + "&offset=" + timeoffset,
				success: function(html){
					$("#clipThumbnails .clip_screenshots").html(html);
					initThumbnails();
				}
			});
			return false;
		});
	}
	
	if($("#userClaimClipLink").length > 0)
	{
		$("#userClaimClipLink").unbind('click').click(function(){
			if($("#currentUserLink").length > 0)
				location.href = $("#userClaimClipLink").attr('href');
			else
			{
				$.ajax({
					url: "/videoLibrary/ajax/ajax-widget-public.php?type=user_cliplogin&copyClip",
					type: "GET",
					success: function(html){
						$.fancybox(html, {scrolling: 'no'});
						Cufon.refresh('.swap-cufon');
						$("#userClipLogin").unbind('submit').submit(function(){
							var loginform = $(this);
							$.ajax({
								url: $(loginform).attr('action'),
								type: "POST",
								data: $(loginform).serialize(),
								success: function(html){
									if(html.match(/login_error/))
									{
										$("#userClipLogin .error").html(html);
									}
									else
									{
										$.fancybox.close();
										location.href = $("#userClaimClipLink").attr('href');
									}
								}
							});
							return false;
						});
					}
				});
			}
			return false;
		});
	}
	
	if($("#deleteClip").length > 0)
	{
		$("#deleteClip").unbind('click').click(function(){
			var cnf = window.confirm("Are you sure you wish to remove this clip?");
			if(cnf)
				location.href = $("#deleteClip").attr('href');
			return false;
		});
	}
	
	if($("#programTabContent").length > 0 && $("#programTabs .selected").length > 0)
	{
		$("#selectedTab .tab-middle").css("width", $("#programTabs .selected a").width().toString() + 'px');
		$("#selectedTab").css("left", $("#programTabs .selected a").position().left + 'px');
		
		$("#programTabs h2 a").unbind('click').click(function(){
			if($(this).parent().hasClass("selected"))
				return false;
			$("#programTabs .selected").removeClass("selected");
			$(this).parent().addClass("selected");
			$("#selectedTab .tab-middle").css("width", $("#programTabs .selected a").width().toString() + 'px');
			$("#selectedTab").attr("rel", $(this).attr('rel'));
			$("#selectedTab").animate({left: $(this).position().left}, 400);
			Cufon.refresh('.swap-cufon');
			
			refreshTabContent();
			
			return false;
		});
		
		$("#programTabContent .select ul li a").unbind('click').click(function(){
			
			
			return false;
		});
		
		refreshTabContent();
	}
	
	if($("#clipTabContent").length > 0 && $("#clipTabs .selected").length > 0)
	{
		$("#selectedTab .tab-middle").css("width", $("#clipTabs .selected a").width().toString() + 'px');
		$("#selectedTab").css("left", $("#clipTabs .selected a").position().left + 'px');
		
		$("#clipTabs h2 a").unbind('click').click(function(){
			if($(this).parent().hasClass("selected"))
				return false;
			$("#clipTabs .selected").removeClass("selected");
			$(this).parent().addClass("selected");
			$("#selectedTab .tab-middle").css("width", $("#clipTabs .selected a").width().toString() + 'px');
			$("#selectedTab").attr("rel", $(this).attr('rel'));
			$("#selectedTab").animate({left: $(this).position().left}, 400);
			Cufon.refresh('.swap-cufon');
			
			refreshTabContent();
			
			return false;
		});
		
		if($("#clipTextAjaxLink").length > 0)
		{
			$.ajax({
				url: $("#clipTextAjaxLink").attr('href'),
				type: "GET",
				success: function(html){
					$("#clipTextAjaxLink").closest("div").html(html);
					refreshTabContent();
					initTranscript();
				}
			});
		}
		
		refreshTabContent();
//		initTranscript();
	}
	
	if($("#followSuggestions").length > 0)
	{
		$(document).on({
			"click": function(){
				if($(this).attr('rel'))
					VLFollowSuggestions($(this).attr('rel'));
				else
					VLFollowSuggestions();
				return false;
			}
		}, ".follow_suggest_link");
	}
});

function initThumbnails()
{
	$("#clipThumbnails img.clip_thumb").unbind('click').click(function(){
		if(!$(this).hasClass('selected'))
		{
			$("#clipThumbnails img.selected").removeClass('selected');
			$(this).addClass('selected');
			$("#clipThumbnails form input[name='thumbTime']").val($(this).attr('rel'));
		}
		return false;
	});
}

function initTranscript()
{
	$("#transcriptType span").unbind('click').click(function() {
		$(this).siblings('div').slideToggle();
	});

	$("#transcriptType ul li").unbind('click').click(function () {
		var span = $(this).parent().parent().siblings('span');
		$(span).text($(this).text());
		$("#transcriptType").val($(this).attr('rel'));
		
		$(this).parent().parent().slideUp();
		//TODO: show/hide graphical and text timelines
		if($("#transcriptType").val() == 'graph')
		{
			$("#transcriptSearch").fadeOut('fast');
			$("#timeline .transcript").fadeOut('fast', function(){
				$("#timeline .graphic_timeline").fadeIn('fast', function(){
					if($("#timeline .graphic_timeline .ajaxurl").length > 0)
					{
						$.ajax({
							type: "GET",
							url: $("#timeline .graphic_timeline .ajaxurl").attr('href'),
							success: function(html){
								$("#timeline .graphic_timeline").html(html);
								
								$("#timeline .graphic_timeline area").unbind('click').click(function(){
									if($(this).attr('rel'))
										playerSeek(parseInt($(this).attr('rel'), 10));
									return false;
								});
								
								$("#timeline .graphic_timeline area.appR").tooltip({
									track:true, 
									content:function(){return $(this).attr('title');},
									show:{duration:100},
									hide:{duration:100},
									tooltipClass:"jquery-tooltip-normal jquery-tooltip-appR"
								});
								$("#timeline .graphic_timeline area.appD").tooltip({
									track:true, 
									content:function(){return $(this).attr('title');},
									show:{duration:100},
									hide:{duration:100},
									tooltipClass:"jquery-tooltip-normal jquery-tooltip-appD"
								});
								$("#timeline .graphic_timeline area.appI").tooltip({
									track:true, 
									content:function(){return $(this).attr('title');},
									show:{duration:100},
									hide:{duration:100},
									tooltipClass:"jquery-tooltip-normal jquery-tooltip-appI"
								});
								$("#timeline .graphic_timeline area.app").tooltip({
									track:true, 
									content:function(){return $(this).attr('title');},
									show:{duration:100},
									hide:{duration:100},
									tooltipClass:"jquery-tooltip-normal"
								});
								$("#timeline .graphic_timeline area.vote").tooltip({
									track:true, 
									content:function(){return $(this).attr('title');},
									show:{duration:100},
									hide:{duration:100},
									tooltipClass:"jquery-tooltip-normal"
								});
								$("#timeline .graphic_timeline area.debate").tooltip({
									track:true, 
									content:function(){return $(this).attr('title');},
									show:{duration:100},
									hide:{duration:100},
									tooltipClass:"jquery-tooltip-normal"
								});
							}
						});
					}
				});
			});
		}
		else
		{
			$("#timeline .graphic_timeline").fadeOut('fast', function(){
				$("#transcriptSearch").fadeIn('fast');
				$("#timeline .transcript").fadeIn('fast');
			});
		}

		return false;
	});
	
	$("#transcriptSearch").unbind('submit').submit(function(){
		$(".transselect > div:visible").slideUp();
		$("#transcriptSearch button").attr('disabled', 'disabled').addClass('disabled');
		searchTranscript();
		return false;
	});
	
	$("#transcriptSearch input[type=text]").unbind('focus').focus(function(){
		$(this).addClass('focus');
		if($(this).hasClass('no_search'))
			$(this).removeClass('no_search').val('');
	});
	
	$("#transcriptSearch input[type=text]").unbind('blur').blur(function(){
		$(this).removeClass('focus');
		if($(this).val() == '')
			$(this).addClass('no_search').val('Search Timeline');
	});
	
	$(".transselect span").unbind('click').click(function(){
		if($(this).siblings('div:visible').length > 0)
			$(this).siblings('div:visible').slideUp();
		else
		{
			$(".select > div:visible").css('z-index', 11).slideUp();
			$(this).siblings('div').css('z-index', 12).slideDown();
		}
	});
	
	$(".transselect ul li").unbind('click').click(function(e){
		if(e.shiftKey && $(".transselect li.psn-last").length > 0)
		{
			$(".transselect li.selected").removeClass('selected');
			var psnlast = $(".transselect li.psn-last").get(0);
			var psnthis = $(this).get(0);
			var indexlast = $(".transselect li").index(psnlast);
			var indexthis = $(".transselect li").index(psnthis);
			if(indexlast == -1 || indexlast == indexthis)
				$(this).toggleClass('selected');
			else if (indexlast > indexthis)
			{
				for(var i = indexthis; i <= indexlast; i++)
					$(".transselect li").eq(i).addClass('selected');
			}
			else //if (indexlast < indexthis)
			{
				for(var i = indexlast; i <= indexthis; i++)
					$(".transselect li").eq(i).addClass('selected');
			}
		}
		else if(e.ctrlKey || e.metaKey)
		{
			$(".transselect li.psn-last").removeClass('psn-last');
			$(this).addClass('psn-last');
			$(this).toggleClass('selected');
		}
		else if($(this).hasClass('selected') && $(".transselect li.selected").length == 1)
		{
			$(".transselect li.psn-last").removeClass('psn-last');
			$(this).removeClass('selected');
		}
		else
		{
			$(".transselect li.psn-last").removeClass('psn-last');
			$(".transselect li.selected").removeClass('selected');
			$(this).addClass('selected').addClass('psn-last');
		}
		
		var psnCnt = $(".transselect li.selected").length;
		if(psnCnt == 1)
		{
			$(this).parents('.transselect').children('span').text($(".transselect li.selected").text());
			$("#trans-person").val($(".transselect li.selected a").attr('rel'));
		}
		else if(psnCnt == 0 || psnCnt == $(".transselect li").length)
		{
			$(this).parents('.transselect').children('span').text("All Speakers");
			$("#trans-person").val('0');
		}
		else
		{
			var psnSearch = '';
			$(".transselect li.selected a").each(function(){
				psnSearch += ':' + $(this).attr('rel'); 
			});
			$(this).parents('.transselect').children('span').text(psnCnt.toString() + " Speakers");
			$("#trans-person").val(psnSearch.substr(1));
		}
		
		return false;
	});
	
	$("#trans-nonids").unbind('click').click(function(){
		if($("#trans-nonids").is(':checked'))
			$(".transselect li.psn-nonid").show();
		else
			$(".transselect li.psn-nonid").hide();
	});
	
	$("#timeline tr").unbind('click').click(function(){
		playerSeek(parseInt($(this).attr('id').substr(4), 10));
		
		return false;
	});
	
	$("#timeline").hover(function(){
		$(this).addClass('timeline-over');
	}, function(){
		$(this).removeClass('timeline-over');
	});
	
	$("#clipTabContent .clip_timeline").hover(function(){
		$(this).addClass('timeline-over');
	}, function(){
		$(this).removeClass('timeline-over');
	});
}

function initRelated()
{
	if($("#relatedBox .action-bar .pager a").length > 10)
	{
		for(var i = 10; i < $("#relatedBox .action-bar .pager a").length; i++)
		{
			$("#relatedBox .action-bar .pager a").eq(i).hide();
		}
	}
	$("#relatedBox .action-bar .pager a").unbind('click').click(function(){
		if($(this).hasClass('active'))
			return false;
		
		var url = $(this).attr("href");
		var relulcontainer = $("#relatedBoxTop > div > ul");
		$("#relatedBox .action-bar .pager .active").removeClass('active');
		$(this).addClass('active');
		if($("#relatedBox .action-bar .pager a").length > 10)
		{
			var thisindex = Math.max(5, Math.min($(this).index("#relatedBox .action-bar .pager a"), $("#relatedBox .action-bar .pager a").length - 5));
			for(var i = 0; i < $("#relatedBox .action-bar .pager a").length; i++)
			{
				if(i >= thisindex - 5 && i < thisindex + 5)
					$("#relatedBox .action-bar .pager a").eq(i).show();
				else
					$("#relatedBox .action-bar .pager a").eq(i).hide();
			}
		}
		$(relulcontainer).fadeOut("fast", function(){
			$.ajax({
				type: "GET",
				url: url,
				success: function(html){
					$(relulcontainer).html(html);
					$(relulcontainer).fadeIn("fast");
				}
			});
		});		
		
		return false;
	});
}

function initClipList()
{
	if($("#clipOptions input[name='order']").val() == 'timeline')
		$("#relatedBox .pager").hide();
	else
		$("#relatedBox .pager").show();
	$("#clipOptions .select span").unbind('click').click(function() {
		$(this).siblings('div').slideToggle();
	});

	$("#clipOptions .select ul li").unbind('click').click(function () {
		var span = $(this).parent().parent().siblings('span');
		$(span).text($(this).text());
		$("#clipOptions input[name='order']").val($(this).attr('rel'));
		
		$(this).parent().parent().slideUp();
		
		if($("#clipOptions input[name='order']").val() == 'timeline')
			$("#relatedBox .pager").fadeOut('fast');
		else
			$("#relatedBox .pager").fadeIn('fast');
		$("#clipList").fadeOut('fast', function(){
			$.ajax({
				url: $("#clipOptions").attr('action'),
				data: $("#clipOptions").serialize(),
				type: "GET",
				success: function(html){
					$("#clipList").html(html);
					$("#clipList").fadeIn('fast');
					$("#clipList #clipTimeline").hover(function(){
						$(this).addClass('timeline-over');
					}, function(){
						$(this).removeClass('timeline-over');
					});
				}
			});
		});

		return false;
	});
	
	if($("#relatedBox .action-bar .pager a").length > 10)
	{
		for(var i = 10; i < $("#relatedBox .action-bar .pager a").length; i++)
		{
			$("#relatedBox .action-bar .pager a").eq(i).hide();
		}
	}
	$("#relatedBox .action-bar .pager a").unbind('click').click(function(){
		if($(this).hasClass('active'))
			return false;
		
		var url = $(this).attr("href");
		$("#relatedBox .action-bar .pager .active").removeClass('active');
		$(this).addClass('active');
		if($("#relatedBox .action-bar .pager a").length > 10)
		{
			var thisindex = Math.max(5, Math.min($(this).index("#relatedBox .action-bar .pager a"), $("#relatedBox .action-bar .pager a").length - 5));
			for(var i = 0; i < $("#relatedBox .action-bar .pager a").length; i++)
			{
				if(i >= thisindex - 5 && i < thisindex + 5)
					$("#relatedBox .action-bar .pager a").eq(i).show();
				else
					$("#relatedBox .action-bar .pager a").eq(i).hide();
			}
		}
		$("#clipList").fadeOut("fast", function(){
			$.ajax({
				type: "GET",
				url: url,
				success: function(html){
					$("#clipList").html(html);
					$("#clipList").fadeIn("fast");
					$("#clipList #clipTimeline").hover(function(){
						$(this).addClass('timeline-over');
					}, function(){
						$(this).removeClass('timeline-over');
					});
				}
			});		
		});		
		
		return false;
	});
}

function initPurchasePanel()
{
	$.ajax({
		url: "/videoLibrary/ajax/ajax-purchase.php?progid=" + $("#own").attr('rel'),
		type: "GET",
		success: function(html){
			$("#own > div").html(html);
			$( "#own #purchase_type_select img" ).click( function() { 
		
				var clicked = this;
		
				$( this ).parent().fadeOut( "fast", function() {
		
					// jQuery wont do it....?
					$( this ).css( "display", "none" );
		
					if( $( clicked ).hasClass( "dvd" ) )
					{
						var option = $( "#own #download_format ul li a[rel='dvd']" );
					} else {
						var option = $( "#own #download_format ul li[rel!='false'] a[rel!='dvd']" );
		
						if( !option.length )
							option = $( "#own #download_format ul li a[rel='mp4-std']" );
						if( !option.length )
							option = $( "#own #download_format ul li:not(.listheader) a[rel!='dvd']" );
		
						if( option.length > 1 )
							option = option[0];
					}
		
					$( "#own #download_format > span" ).text( $(option).text() ) ;
					$( "#own #download_format input" ).val( $(option).attr( "rel" ) );
					
					if( $(option).parent().attr( "rel" ) != "false" )
					{	
						updateStats();
						$( "#own #purchase_config" ).css( "display", "block" )
						$( "#own #purchase_request" ).css( "display", "none" )
					} else {
						$( "#own #purchase_config" ).css( "display", "none" )
						$( "#own #purchase_request" ).css( "display", "block" )
					}
					
					var image = $( "#own .buy_image" );
					if( !$( image ).hasClass( $( "#own #download_format input" ).val() ) )
					{
						if( $( "#own #download_format input" ).val() == "dvd" )
						{
							$( image ).removeClass( "download" ).addClass( "dvd" );
							$( "#own #purchase_clip" ).fadeOut( "fast" );
						} else {
							$( image ).removeClass( "dvd" ).addClass( "download" );
							$( "#own #purchase_clip" ).fadeIn( "fast" );
						}
					}
					
					$( "#own #purchase_options" ).show();
				});
		
				return false;
			});
		
			$( "#own .select" ).click( function() {
				var id = $( this ).attr( "id" );
		
				$( "#own .select" ).each( function() {
					if( id != $( this ).attr( "id" ) )
						$( this ).children( "div" ).slideUp();
				});
		
				$( this ).children( "div" ).slideToggle();
		
				return false;
			});
		
			$( "#own #purchase_clip ul li a" ).click( function() {
		
				$( "#own #purchase_clip input[name=purchase_clip]" ).val( $( this ).attr( "rel" ) );
		
				updateStats();
				
				if( $( this ).attr( "rel" ) == "clip" )
				{
					var target = $( "#pageWrapper" ).offset().top;
					$('html,body').animate( {scrollTop: target}, 1000 );
		
					//the try block hides the errors created
					//the flashObject won't be available until the
					//the player fully loads
					try
					{
						var flashObject = document.getElementById('flashPlayer');
		
						if ( flashObject )
						{
							flashObject.showEditView();
						}
					}
					catch(err)
					{
					}
				}
		
				$( this ).children( "div" ).slideToggle();
		
			});
		
			$( "#own #download_format ul li a" ).click( function() {
				$( "#own #download_format > span" ).text( $( this ).text() ).attr( "rel", $( this ).children( "span" ).attr( "rel" ) ) ;
		
				$( "#own #download_format input" ).val( $( this ).attr( "rel" ) );
		
				$( "#own #download_format div" ).slideUp();
		
				if ($(this).attr("rel") == 'mp4-high')
				{
					$( "#own #purchase_clip input[name=purchase_clip]" ).val('clip');
					updateStats();
					if( $( "#own #purchase_config" ).css( "display" ) != "block" )
					{
						$( "#own #purchase_request" ).fadeOut( "fast", function() {
							$( "#own #purchase_config" ).fadeIn( "fast" );
						});
					}
					var target = $( "#pageWrapper" ).offset().top;
					$('html,body').animate( {scrollTop: target}, 1000 );
		
					//the try block hides the errors created
					//the flashObject won't be available until the
					//the player fully loads
					try
					{
						var flashObject = document.getElementById('flashPlayer');
		
						if ( flashObject )
						{
							flashObject.showEditView();
						}
					}
					catch(err)
					{
					}
				}
				else if( $( this ).parent().attr( "rel" ) != "false" || $(this).attr("rel") == 'mov-std' || $(this).attr("rel") == 'avi-std')
				{
					updateStats();
					if( $( "#own #purchase_config" ).css( "display" ) != "block" )
					{
						$( "#own #purchase_request" ).fadeOut( "fast", function() {
							$( "#own #purchase_config" ).fadeIn( "fast" );
						});
					}
				}
				else
				{
					if( $( "#own #purchase_request" ).css( "display" ) != "block" )
					{
						$( "#own #purchase_config" ).fadeOut( "fast", function() {
							$( "#own #purchase_request" ).fadeIn( "fast" );
						});
					}
				}
		
				var image = $( "#own .buy_image" );
				var imgclass = $("#own #download_format input").val();
				if(imgclass != "dvd")
					imgclass = "download";
				if( !$( image ).hasClass(imgclass) )
				{
					$( image ).fadeOut( "fast", function() {
						if( $( "#own #download_format input" ).val() == "dvd" )
						{
							$( image ).removeClass( "download" ).addClass( "dvd" );
							$( "#own #purchase_clip" ).fadeOut( "fast" );
						} else {
							$( image ).removeClass( "dvd" ).addClass( "download" );
							$( "#own #purchase_clip" ).fadeIn( "fast" );
						}
		
						$( image ).fadeIn( "fast" );
					});
				}
		
				return false; 
			});
		
			$( "#own #purchase_config a .add_to_cart" ).parent().click( function(e) {
				e.preventDefault();
		
				var format = $( "#own .purchase_format" ).val();
				var clip = $( "#own #purchase_config input[name=purchase_clip]" ).val();	
		
				if( ( $( "#own #purchase_config input[name=purchase_clip_start]" ).val() == 0 &&
					$( "#own #purchase_config input[name=purchase_clip_stop]" ).val() == $( "#own #purchase_config input[name=purchase_length]" ).val() )
					|| format == "dvd" )
				{
					clip = "full";
				}
				
		//		if( clip == "clip" )
				if(format != 'dvd')
				{
					var programid = $( "#own" ).attr( "rel" );
					if(clip == "full")
					{
						var clipStart = 0;
						var clipStop = 0;
						var clipAction = "showFull";
					}
					else
					{
						var clipStart = $( "#own #purchase_config input[name=purchase_clip_start]" ).val();
						var clipStop = $( "#own #purchase_config input[name=purchase_clip_stop]" ).val();
						var clipAction = "showClip";
					}
		
					$.ajax({
						url: "/videoLibrary/ajax/create_clip.php",
						type: "GET",
						data: "programid=" + programid + "&format=" + format + "&clipStart=" + clipStart + "&clipStop=" + clipStop + "&action=" + clipAction,
						cache: false,
						success: function( data ) {
		//					alert($(data).text());
							if( $( data ).text().match( /Oops!/ ) )
							{
								$.fancybox( data, {scrolling: 'no'} );
								Cufon.refresh('.swap-cufon');
								return;
							}
							
							//Ugly hack, but Safari broke our ability to overlay fancybox over the flash player without messing up the position of the contents.
							var agent = navigator.userAgent.toLowerCase();
							var macsafari_check = false;
							if(agent.indexOf('mac os x') != -1 && agent.indexOf('safari') != -1)
								macsafari_check = true;
							
							if(macsafari_check)
								$("#flashPlayer").hide();
							$.fancybox( data,
							   			{
											modal: true,
											scrolling: 'no'
										} );
							Cufon.refresh('.swap-cufon');
		
							$( "#fancybox-inner .cancel" ).unbind("click").click( function() {
								$.fancybox.close();
								if(macsafari_check)
									$("#flashPlayer").show();
								return false;
							});
		
							$( "#fancybox-inner .continue" ).click(function() {
								if(macsafari_check)
									$("#flashPlayer").show();
								downloads_show_tos(function(){
									if(clip == "clip" || format == "mp4-high" || format == "mp3-std" || format == "avi-std" || format == "mov-std" )
									{
										$.ajax({
											url: "/videoLibrary/ajax/create_clip.php",
											type: "GET",
											data: "programid=" + programid + "&format=" + format + "&clipStart=" + clipStart + "&clipStop=" + clipStop + "&action=create",
											cache: false,
											success: function( data ) {
				
												if( $( data ).text().match( /^Oops!.*$/ ) )
												{
													$.fancybox( data, {scrolling: 'no'} );
													Cufon.refresh('.swap-cufon');
													return;
												}
				
												var after_load = function() {
													$.ajax({
														url: "/videoLibrary/ajax/create_clip.php",
														type: "GET",
														data: "programid=" + programid + "&format=" + format + "&clipStart=" + clipStart + "&clipStop=" + clipStop + "&action=getId",
														cache: false,
														success: function( data ) {
				
															if( data.match( /^[0-9]+$/) )
															{
																$( "#own #add_to_cart input[name=buyid]" ).val( data );
																$( "#own #add_to_cart" ).submit();
															} else {
																$.fancybox( "<div>" + data + "</div>", {scrolling: 'no'} );
																Cufon.refresh('.swap-cufon');
															}
														}
													});
												};
				
												$.fancybox( data, { modal: true, onComplete: after_load, scrolling: 'no' } );
												Cufon.refresh('.swap-cufon');
												$.fancybox.showActivity();
												$( "#fancybox-loading" ).css( "margin-top", parseInt(parseInt( $( "#fancybox-loading" ).css( "margin-top" ) ) + 20 ) + "px" );
											}
										});
									}
									else
									{
										$.fancybox.close();
										var id = $( "#own #download_format li a[rel=" + format + "]" ).parent().attr( "rel" );
										$( "#own #add_to_cart input[name=buyid]" ).val( id );
							
										$( "#own #add_to_cart" ).submit();
									}
								});
		
								return false;
							});
						}
					});			
		//		} else if(format != 'dvd') {
		//			downloads_show_tos(function(){
		//				$.fancybox.close();
		//				var id = $( "#own #download_format li a[rel=" + format + "]" ).parent().attr( "rel" );
		//				$( "#own #add_to_cart input[name=buyid]" ).val( id );
		//	
		//				$( "#own #add_to_cart" ).submit();
		//			});
				} else {
					var id = $( "#own #download_format li a[rel=" + format + "]" ).parent().attr( "rel" );
					$( "#own #add_to_cart input[name=buyid]" ).val( id );
		
					$( "#own #add_to_cart" ).submit();
				}
		
				return false;
			});
		
			$( "#own .request_download" ).click(function() {
				var programid = $( "#own" ).attr( "rel" );
				var format = $( "#own #download_format input" ).val();
		
				var parts = format.match( /([a-z0-9]+)-([a-z0-9]+|)/ );
		
				format = parts[1];
		
				if(parts[2] == "high" )
					var quality = "high";
				else if(parts[2] == "low")
					var quality = "low";
				else
					var quality = "standard";
			
				$.ajax({
					url: "/videoLibrary/ajax/download_request.php",
					type: "GET",
					data: "programid=" + programid + "&format=" + format + "&quality=" + quality + "&action=request",
					cache: false,
					success: function( data ) {
						$.fancybox( data, {enableKeyboardNav: false, scrolling: 'no'} );
						Cufon.refresh('.swap-cufon');
		
						$( "#notify_form" ).submit( function(e) {
							e.preventDefault();
		
							var name = $(this).find( "input[name=name]" ).val();
							var email = $( this ).find( "input[name=email]" ).val();
							var url = $( this ).attr( "action" );
							
							if(email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i))
							{
								$.ajax({
									url: url,
									type: "POST",
									data: {name: name, email: email},
									cache: false,
									success: function( data ) {
										$.fancybox( data, {scrolling: 'no'} );
										Cufon.refresh('.swap-cufon');
									}
								});
							}
							else
								$("#dlReqError").html("Cannot process request: invalid email provided.").show();
		
							return false;
						});
					}
				});			
		
		
				return false;
			});
		
			$( "#own #download_format ul li:first-child a" ).click();
		
			$( "#own #purchase_config .price_samples" ).click( function() {
				$.ajax({
					url: "/videoLibrary/ajax/download_pricing_samples.php",
					type: "GET",
					success: function( data ) {
						$.fancybox( data, {
										transitionIn: 'elastic',
										transitionOut: 'elastic',
										easingIn: 'swing',
										easingOut: 'swing',
										centerOnScroll: true,
										autoDimensions:false, 
										width: 420, 
										height: 650
									});
		//				Cufon.refresh('.swap-cufon');
						}
					
				});
		
				return false;
			});
		}
	});
}

function refreshTabContent()
{
	if($("#programTabs .selected a").length > 0)
	{
		var url = $("#programTabs .selected a").attr('href');
		$("#programTabContent").fadeOut('fast', function(){
			$("#programTabContent").attr('rel', url);
			$.ajax({
				type: "GET",
				url: url,
				success: function(html){
					if($("#programTabContent").attr('rel') == url)
					{
						$("#programTabContent").html(html);
						Cufon.refresh('.swap-cufon');
						$("#programTabContent").fadeIn('fast');
						if($("#programTabs .selected a").attr('rel') == 'timeline')
							initTranscript();
						if($("#programTabs .selected a").attr('rel') == 'related')
							initRelated();
						if($("#programTabs .selected a").attr('rel') == 'clips')
							initClipList();
					}
				}
			});
		});
	}
	else if($("#clipTabs .selected a").length > 0)
	{
		var cliprel = $("#clipTabs .selected a").attr('rel');
		if(!$("#clipTabContent div[rel='"+cliprel+"']").hasClass('div_selected'))
		{
			$("#clipTabContent").fadeOut('fast', function(){
				if($("#clipTabContent .div_selected").length > 0)
					$("#clipTabContent .div_selected").removeClass('div_selected');
				$("#clipTabContent div[rel='"+cliprel+"']").addClass('div_selected');
				$("#clipTabContent").fadeIn('fast');
			});
		}
	}
	
	clearInterval(timelineIntervalId);
	if($("#programTabs h2.selected a[rel='timeline']").length > 0)
	{
		setTimeout(function(){
			timelineIntervalId = setInterval(function(){updateTranscript();},5000);
		},3000);
	}
}

function initClipPurchasePanel()
{
	var buyurl = "/videoLibrary/ajax/ajax-purchase.php";
	if($("#clipPurchase").hasClass("app_purchase"))
		buyurl += "?appid=" + $("#clipPurchase").attr('rel');
	else
		buyurl += "?clipid=" + $("#clipPurchase").attr('rel');
	$.ajax({
		url: buyurl,
		type: "GET",
		success: function(html){
			$("#clipPurchase > div").html(html);
			updateStats();
			
			$("#clipPurchase #purchase_type_select img").click( function() { 
				var clicked = this;
		
				$(this).parent().fadeOut("fast", function() {
					// jQuery wont do it....?
					$(this).css( "display", "none" );
		
					if( $( clicked ).hasClass( "dvd" ) )
					{
						var option = $( "#clipPurchase #download_format ul li a[rel='dvd']" );
					} else {
						var option = $( "#clipPurchase #download_format ul li[rel!='false'] a[rel!='dvd']" );
		
						if( !option.length )
							option = $( "#clipPurchase #download_format ul li a[rel='mp4-std']" );
						if( !option.length )
							option = $( "#clipPurchase #download_format ul li:not(.listheader) a[rel!='dvd']" );
		
						if( option.length > 1 )
							option = option[0];
					}
		
					$( "#clipPurchase #download_format > span" ).text( $(option).text() ) ;
					$( "#clipPurchase #download_format input" ).val( $(option).attr( "rel" ) );
					
					if( $(option).parent().attr( "rel" ) != "false" )
					{	
						updateStats();
						$( "#clipPurchase #purchase_config" ).css( "display", "block" )
						$( "#clipPurchase #purchase_request" ).css( "display", "none" )
					} else {
						$( "#clipPurchase #purchase_config" ).css( "display", "none" )
						$( "#clipPurchase #purchase_request" ).css( "display", "block" )
					}
					
					var image = $( "#clipPurchase .buy_image" );
					if( !$( image ).hasClass( $( "#clipPurchase #download_format input" ).val() ) )
					{
						if( $( "#clipPurchase #download_format input" ).val() == "dvd" )
						{
							$( image ).removeClass( "download" ).addClass( "dvd" );
							$( "#clipPurchase #purchase_clip" ).fadeOut( "fast" );
						} else {
							$( image ).removeClass( "dvd" ).addClass( "download" );
							$( "#clipPurchase #purchase_clip" ).fadeIn( "fast" );
						}
					}
					
					$( "#clipPurchase #purchase_options" ).show();
				});
		
				return false;
			});
		
			$( "#clipPurchase .select" ).click( function() {
				var id = $( this ).attr( "id" );
		
				$( "#clipPurchase .select" ).each( function() {
					if( id != $( this ).attr( "id" ) )
						$( this ).children( "div" ).slideUp();
				});
		
				$( this ).children( "div" ).slideToggle();
		
				return false;
			});
		
			$( "#clipPurchase #purchase_clip ul li a" ).click( function() {
		
				$( "#clipPurchase #purchase_clip input[name=purchase_clip]" ).val( $( this ).attr( "rel" ) );
		
				updateStats();
				
				if( $( this ).attr( "rel" ) == "clip" )
				{
					var target = $( "#pageWrapper" ).offset().top;
					$('html,body').animate( {scrollTop: target}, 1000 );
		
					//the try block hides the errors created
					//the flashObject won't be available until the
					//the player fully loads
					try
					{
						var flashObject = document.getElementById('flashPlayer');
		
						if ( flashObject )
						{
							flashObject.showEditView();
						}
					}
					catch(err)
					{
					}
				}
		
				$( this ).children( "div" ).slideToggle();
		
			});
		
			$( "#clipPurchase #download_format ul li a" ).click( function() {
				$( "#clipPurchase #download_format > span" ).text( $( this ).text() ).attr( "rel", $( this ).children( "span" ).attr( "rel" ) ) ;
		
				$( "#clipPurchase #download_format input" ).val( $( this ).attr( "rel" ) );
		
				$( "#clipPurchase #download_format div" ).slideUp();
		
				if ($(this).attr("rel") == 'mp4-high')
				{
					$( "#clipPurchase #purchase_clip input[name=purchase_clip]" ).val('clip');
					updateStats();
					if( $( "#clipPurchase #purchase_config" ).css( "display" ) != "block" )
					{
						$( "#clipPurchase #purchase_request" ).fadeOut( "fast", function() {
							$( "#clipPurchase #purchase_config" ).fadeIn( "fast" );
						});
					}
					var target = $( "#pageWrapper" ).offset().top;
					$('html,body').animate( {scrollTop: target}, 1000 );
		
					//the try block hides the errors created
					//the flashObject won't be available until the
					//the player fully loads
					try
					{
						var flashObject = document.getElementById('flashPlayer');
		
						if ( flashObject )
						{
							flashObject.showEditView();
						}
					}
					catch(err)
					{
					}
				}
				else if( $( this ).parent().attr( "rel" ) != "false" || $(this).attr("rel") == 'mov-std' || $(this).attr("rel") == 'avi-std')
				{
					updateStats();
					if( $( "#clipPurchase #purchase_config" ).css( "display" ) != "block" )
					{
						$( "#clipPurchase #purchase_request" ).fadeOut( "fast", function() {
							$( "#clipPurchase #purchase_config" ).fadeIn( "fast" );
						});
					}
				}
				else
				{
					if( $( "#clipPurchase #purchase_request" ).css( "display" ) != "block" )
					{
						$( "#clipPurchase #purchase_config" ).fadeOut( "fast", function() {
							$( "#clipPurchase #purchase_request" ).fadeIn( "fast" );
						});
					}
				}
		
				var image = $( "#clipPurchase .buy_image" );
				var imgclass = $("#clipPurchase #download_format input").val();
				if(imgclass != "dvd")
					imgclass = "download";
				if( !$( image ).hasClass(imgclass) )
				{
					$( image ).fadeOut( "fast", function() {
						if( $( "#clipPurchase #download_format input" ).val() == "dvd" )
						{
							$( image ).removeClass( "download" ).addClass( "dvd" );
							$( "#clipPurchase #purchase_clip" ).fadeOut( "fast" );
						} else {
							$( image ).removeClass( "dvd" ).addClass( "download" );
							$( "#clipPurchase #purchase_clip" ).fadeIn( "fast" );
						}
		
						$( image ).fadeIn( "fast" );
					});
				}
		
				return false; 
			});
		
			$( "#clipPurchase #purchase_config a .add_to_cart" ).parent().click( function(e) {
				e.preventDefault();
		
				var format = $( "#clipPurchase .purchase_format" ).val();
				var clip = $( "#clipPurchase #purchase_config input[name=purchase_clip]" ).val();	
		
				if( ( $( "#clipPurchase #purchase_config input[name=purchase_clip_start]" ).val() == 0 &&
					$( "#clipPurchase #purchase_config input[name=purchase_clip_stop]" ).val() == $( "#clipPurchase #purchase_config input[name=purchase_length]" ).val() )
					|| format == "dvd" )
				{
					clip = "full";
				}
				
				var programid = $( "#clipPurchase #purchase_config input[name=purchase_programid]" ).val();
				var clipStart = $( "#clipPurchase #purchase_config input[name=purchase_clip_start]" ).val();
				var clipStop = $( "#clipPurchase #purchase_config input[name=purchase_clip_stop]" ).val();
	
				$.ajax({
					url: "/videoLibrary/ajax/create_clip.php",
					type: "GET",
					data: "programid=" + programid + "&format=" + format + "&clipStart=" + clipStart + "&clipStop=" + clipStop + "&action=showClip",
					cache: false,
					success: function( data ) {
	//					alert($(data).text());
						if( $( data ).text().match( /Oops!/ ) )
						{
							$.fancybox( data, {scrolling: 'no'} );
							Cufon.refresh('.swap-cufon');
							return;
						}
						
						//Ugly hack, but Safari broke our ability to overlay fancybox over the flash player without messing up the position of the contents.
						var agent = navigator.userAgent.toLowerCase();
						var macsafari_check = false;
						if(agent.indexOf('mac os x') != -1 && agent.indexOf('safari') != -1)
							macsafari_check = true;
						
						if(macsafari_check)
							$("#flashPlayer").hide();
						$.fancybox( data,
						   			{
										modal: true,
										scrolling: 'no'
									} );
						Cufon.refresh('.swap-cufon');
	
						$( "#fancybox-inner .cancel" ).unbind("click").click( function() {
							$.fancybox.close();
							if(macsafari_check)
								$("#flashPlayer").show();
							return false;
						});
	
						$( "#fancybox-inner .continue" ).click(function() {
							if(macsafari_check)
								$("#flashPlayer").show();
							downloads_show_tos(function(){
								if(clip == "clip" || format == "mp4-high" || format == "mp3-std" || format == "avi-std" || format == "mov-std" )
								{
									$.ajax({
										url: "/videoLibrary/ajax/create_clip.php",
										type: "GET",
										data: "programid=" + programid + "&format=" + format + "&clipStart=" + clipStart + "&clipStop=" + clipStop + "&action=create",
										cache: false,
										success: function( data ) {
			
											if( $( data ).text().match( /^Oops!.*$/ ) )
											{
												$.fancybox( data, {scrolling: 'no'} );
												Cufon.refresh('.swap-cufon');
												return;
											}
			
											var after_load = function() {
												$.ajax({
													url: "/videoLibrary/ajax/create_clip.php",
													type: "GET",
													data: "programid=" + programid + "&format=" + format + "&clipStart=" + clipStart + "&clipStop=" + clipStop + "&action=getId",
													cache: false,
													success: function( data ) {
			
														if( data.match( /^[0-9]+$/) )
														{
															$( "#clipPurchase #add_to_cart input[name=buyid]" ).val( data );
															$( "#clipPurchase #add_to_cart" ).submit();
														} else {
															$.fancybox( "<div>" + data + "</div>", {scrolling: 'no'} );
															Cufon.refresh('.swap-cufon');
														}
													}
												});
											};
			
											$.fancybox( data, { modal: true, onComplete: after_load, scrolling: 'no' } );
											Cufon.refresh('.swap-cufon');
											$.fancybox.showActivity();
											$( "#fancybox-loading" ).css( "margin-top", parseInt(parseInt( $( "#fancybox-loading" ).css( "margin-top" ) ) + 20 ) + "px" );
										}
									});
								}
								else
								{
									$.fancybox.close();
									var id = $( "#clipPurchase #download_format li a[rel=" + format + "]" ).parent().attr( "rel" );
									$( "#clipPurchase #add_to_cart input[name=buyid]" ).val( id );
						
									$( "#clipPurchase #add_to_cart" ).submit();
								}
							});
	
							return false;
						});
					}
				});
		
				return false;
			});
		
			$( "#clipPurchase .request_download" ).click(function() {
				var programid = $( "#clipPurchase #purchase_config input[name=purchase_programid]" ).val();
				var format = $( "#clipPurchase #download_format input" ).val();
		
				var parts = format.match( /([a-z0-9]+)-([a-z0-9]+|)/ );
		
				format = parts[1];
		
				if(parts[2] == "high" )
					var quality = "high";
				else if(parts[2] == "low")
					var quality = "low";
				else
					var quality = "standard";
			
				$.ajax({
					url: "/videoLibrary/ajax/download_request.php",
					type: "GET",
					data: "programid=" + programid + "&format=" + format + "&quality=" + quality + "&action=request",
					cache: false,
					success: function( data ) {
						$.fancybox( data, {enableKeyboardNav: false, scrolling: 'no'} );
						Cufon.refresh('.swap-cufon');
		
						$( "#notify_form" ).submit( function(e) {
							e.preventDefault();
		
							var name = $(this).find( "input[name=name]" ).val();
							var email = $( this ).find( "input[name=email]" ).val();
							var url = $( this ).attr( "action" );
							
							if(email.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i))
							{
								$.ajax({
									url: url,
									type: "POST",
									data: {name: name, email: email},
									cache: false,
									success: function( data ) {
										$.fancybox( data, {scrolling: 'no'} );
										Cufon.refresh('.swap-cufon');
									}
								});
							}
							else
								$("#dlReqError").html("Cannot process request: invalid email provided.").show();
		
							return false;
						});
					}
				});			
		
		
				return false;
			});
		
			$( "#clipPurchase #download_format ul li:first-child a" ).click();
		
			$( "#clipPurchase #purchase_config .price_samples" ).click( function() {
				$.ajax({
					url: "/videoLibrary/ajax/download_pricing_samples.php",
					type: "GET",
					success: function( data ) {
						$.fancybox( data, {
										transitionIn: 'elastic',
										transitionOut: 'elastic',
										easingIn: 'swing',
										easingOut: 'swing',
										centerOnScroll: true,
										autoDimensions:false, 
										width: 420, 
										height: 650
									});
		//				Cufon.refresh('.swap-cufon');
						}
					
				});
		
				return false;
			});
		}
	});
}

function searchTranscript()
{
	var containerFull = $("#transcript-full");
	var containerResults = $("#transcript-results");
	$("#searchinfo").html("Searching timeline...").slideDown("fast");
	
	if($("#trans-search").hasClass('no_search'))
		$("#trans-query").val('');
	else
		$("#trans-query").val($("#trans-search").val());
	
	var url = $("#timeline .ajaxurl").attr('href') + "&query=" + $("#trans-query").val() + "&personid=" + $("#trans-person").val();
	if($("#trans-nonids").length && !$("#trans-nonids").is(':checked'))
		url += "&nonids=true";
	var urlfull = url + "&full=true";
	
	$(containerFull).fadeOut("fast", function(){
		$.ajax({
			type: "GET",
			url: urlfull,
			success: function(html){
				$(containerFull).html(html);
				
				$("#transcript-full tr").unbind('click').click(function(){
					playerSeek(parseInt($(this).attr('id').substr(4), 10));
					
					return false;
				});
			}
		});
	});
	$(containerResults).fadeOut("fast", function(){
		$.ajax({
			type: "GET",
			url: url,
			success: function(html){
				$(containerResults).html(html);
				
				var numResults = $("#transcript-results tr").length;
				if(numResults > 0)
				{
					$("#searchinfo").html(numResults.toString() + " results found. <a href='#'>Close Search Results</a>");
					$(containerResults).fadeIn("fast");
					$("#searchinfo a").unbind('click').click(function(){
						$("#searchinfo").slideUp("fast");
						$(containerResults).fadeOut("fast", function(){
							$(containerFull).fadeIn("fast");
						});
						return false;
					});
				}
				else
				{
					if($("#trans-query").val() == '' && $("#trans-person").val() == '0')
					{
						$("#searchinfo").slideUp("fast");
						$(containerFull).fadeIn("fast");
					}
					else
					{
						$("#searchinfo").html("No results found for '" + $("#trans-query").val() + "'. <a href='#'>Show Full Transcript</a>");
						$("#searchinfo a").unbind('click').click(function(){
							$("#searchinfo").slideUp("fast");
							$(containerResults).fadeOut("fast", function(){
								$(containerFull).fadeIn("fast");
							});
							return false;
						});
					}
				}
				
				$("#transcript-results tr").unbind('click').click(function(){
					playerSeek(parseInt($(this).attr('id').substr(4), 10));
					$("#searchinfo").slideUp("fast");
					$(containerResults).fadeOut("fast", function(){
						$(containerFull).fadeIn("fast");
					});
					
					return false;
				});
				
				$("#transcriptSearch button").removeAttr('disabled').removeClass('disabled');
			}
		});
	});
}

function playerSeek(time)
{
	//the try block hides the errors created
	//the flashObject won't be available until the
	//the player fully loads
	try
	{
		var flashObject = document.getElementById('flashPlayer');

		if ( flashObject )
		{
			flashObject.seek(time);
		}
	}
	catch(err)
	{
	}
}

function updateTranscript()
{
	//the try block hides the errors created
	//the flashObject won't be available until the
	//the player fully loads
	try
	{
		var flashObject = document.getElementById('flashPlayer');
		var timeoffset = 0;

		if ( flashObject && $(".timeline-over").length == 0 && $("#timeline input.focus").length == 0 )
		{
			if($("#timeline .graphic_timeline").length > 0 && $("#timeline .graphic_timeline").is(":visible"))
			{
				timeoffset = flashObject.getTime();
				if($("#timeline .graphic_timeline area[rel='"+timeoffset.toString()+"']").length)
				{
					var areaelem = $("#timeline .graphic_timeline area[rel='"+timeoffset.toString()+"']");
					var areacoords = $(areaelem).attr('coords').split(',');
						if(areacoords.length == 4)
					$("#timeline .graphic_timeline").scrollTo({top: Math.min(areacoords[1], areacoords[3]), left: 0}, 200);
				}
				else
				{
					for(var x = timeoffset; x >= 0; x--)
					{
						if($("#timeline .graphic_timeline area[rel='"+x.toString()+"']").length)
						{
							var areaelem = $("#timeline .graphic_timeline area[rel='"+x.toString()+"']");
							var areacoords = $(areaelem).attr('coords').split(',');
							if(areacoords.length == 4)
								$("#timeline .graphic_timeline").scrollTo({top: Math.min(areacoords[1], areacoords[3]), left: 0}, 200);
							break;
						}
					}
				}
			}
			else
			{
				timeoffset = flashObject.getTime();
				if($("#time"+timeoffset.toString()).length)
				{
					var tr = $("#time"+timeoffset.toString());
					$(tr).parents(".table-wrapper-inner").scrollTo($(tr), 200);
				}
				else
				{
					for(var x = timeoffset; x >= 0; x--)
					{
						if($("#time"+x.toString()).length)
						{
							var tr = $("#time"+x.toString());
							$(tr).parents(".table-wrapper-inner").scrollTo($(tr), 200);
							break;
						}
					}
				}
			}
//			alert ( "time = " + flashObject.getTime() );
		}
	}
	catch(err)
	{
	}
	
}

function flash_updateClipInfo( start, stop )
{
	start = Math.round( start );
	stop = Math.round( stop );

	if( stop == 0 )
		stop = $( "#own #purchase_config input[name=purchase_length]" ).val();

	$( "#own #purchase_config input[name=purchase_clip_start]" ).val( start );
	$( "#own #purchase_config input[name=purchase_clip_stop]" ).val( stop ); 
	
	if($("#userOptions").length > 0)
	{
		$("#userOptions .dl-button").show();
		$("#userOptions input[name='start']").val(start);
		$("#userOptions input[name='stop']").val(stop);
	}

	updateStats();
}

function updateStats()
{
	if($("#own").length > 0)
	{
		var len = parseInt( $( "#own table input[name=purchase_length]" ).val() );
		var clip_start = parseInt( $( "#own table input[name=purchase_clip_start]" ).val() );
		var clip_stop = parseInt( $( "#own table input[name=purchase_clip_stop]" ).val() );
	
		if( $( "#own #purchase_clip input[name=purchase_clip]" ).val() == "full" )
		{
			var vidlength = len;
		} else {
			var vidlength = clip_stop - clip_start;
		}	
	
		var length_text = "";
		if ( (days = Math.floor(vidlength / 86400)) >= 1 ) {
			length_text = days + " day";	
			if(days > 1)
				length_text += "s";
		}
		if ( (hours = Math.floor(vidlength / 3600) % 24) >= 1 ) {
			if(length_text != "")
				length_text += ", ";
			length_text += hours + " hour";
			if(hours > 1)
				length_text += "s";
		}
		if ( (minutes = Math.floor(vidlength / 60) % 60) >= 1 ) {
			if(length_text != "")
				length_text += ", ";
			length_text += minutes + " minute";
			if(minutes > 1)
				length_text += "s";
		}
		if (vidlength < 60) {
			length_text = vidlength + " second";
			if(vidlength > 1)
				length_text += "s";
		}
	
		$( "#own table span.purchase_length" ).html( length_text );
	
		var price = "";
	
		if( $( "#own #download_format input" ).val() == "dvd" )
		{
			price = $( "#own #download_format > span" ).attr( "rel" );
	
			$( "#own #purchase_config .price_samples" ).fadeOut( "fast" );
		} else {
			var type = $( "#own #download_format input.purchase_format" ).val().match( /^([A-Za-z0-9]+)\-(high|std|low)$/ );
	
			price = getDownloadPrice(vidlength, type);
	
			$( "#own #purchase_config .price_samples" ).fadeIn( "fast" );
		}
	
		price = Math.round( price * 100 ) / 100;
	
		$( "#own .purchase_price" ).text( "$" + price.toFixed( 2 ) );
	
		var text = $( "#own #purchase_config #purchase_clip > span" ).text();
		var clip = $( "#own #purchase_config input[name=purchase_clip]" ).val();	
	
		if ( parseInt( vidlength ) != parseInt( len )  && clip == "clip" )
		{
			text = "Partial Program";
		} else {
			text = "Complete Program";
		}
	
		$( "#own #purchase_config #purchase_clip > span" ).text( text );
	}
	else if($("#clipPurchase > div").length > 0)
	{
		var vidlength = parseInt( $( "#clipPurchase table input[name=purchase_length]" ).val() );
		var clip_start = parseInt( $( "#clipPurchase table input[name=purchase_clip_start]" ).val() );
		var clip_stop = parseInt( $( "#clipPurchase table input[name=purchase_clip_stop]" ).val() );

		var length_text = "";
		if ( (days = Math.floor(vidlength / 86400)) >= 1 ) {
			length_text = days + " day";	
			if(days > 1)
				length_text += "s";
		}
		if ( (hours = Math.floor(vidlength / 3600) % 24) >= 1 ) {
			if(length_text != "")
				length_text += ", ";
			length_text += hours + " hour";
			if(hours > 1)
				length_text += "s";
		}
		if ( (minutes = Math.floor(vidlength / 60) % 60) >= 1 ) {
			if(length_text != "")
				length_text += ", ";
			length_text += minutes + " minute";
			if(minutes > 1)
				length_text += "s";
		}
		if (vidlength < 60) {
			length_text = vidlength + " second";
			if(vidlength > 1)
				length_text += "s";
		}
	
		$( "#clipPurchase table span.purchase_length" ).html( length_text );
	
		var price = "";
	
		if( $( "#clipPurchase #download_format input" ).val() == "dvd" )
		{
			price = $( "#clipPurchase #download_format > span" ).attr( "rel" );
	
			$( "#clipPurchase #purchase_config .price_samples" ).fadeOut( "fast" );
		} else {
			var type = $( "#clipPurchase #download_format input.purchase_format" ).val().match( /^([A-Za-z0-9]+)\-(high|std|low)$/ );
	
			price = getDownloadPrice(vidlength, type);
	
			$( "#clipPurchase #purchase_config .price_samples" ).fadeIn( "fast" );
		}
	
		price = Math.round( price * 100 ) / 100;
	
		$( "#clipPurchase .purchase_price" ).text( "$" + price.toFixed( 2 ) );
	
		var text = $( "#clipPurchase #purchase_config #purchase_clip > span" ).text();
		var clip = $( "#clipPurchase #purchase_config input[name=purchase_clip]" ).val();	
	
		if ( parseInt( vidlength ) != parseInt( len )  && clip == "clip" )
		{
			text = "Partial Program";
		} else {
			text = "Complete Program";
		}
	
		$( "#clipPurchase #purchase_config #purchase_clip > span" ).text( text );
	}
}

function updateClipTranscript()
{
	//the try block hides the errors created
	//the flashObject won't be available until the
	//the player fully loads
	try
	{
		var flashObject = document.getElementById('flashPlayer');
		var timeoffset = 0;
//		alert ( "time = " + flashObject.getTime() );

		if ( flashObject && $(".timeline-over").length == 0 && $("#timeline input.focus").length == 0 )
		{
			timeoffset = Math.max(0, flashObject.getTime());
			if($("#time"+timeoffset.toString()).length)
			{
				var tr = $("#time"+timeoffset.toString());
				$(tr).parents(".table-wrapper-inner").scrollTo($(tr), 200);
			}
			else
			{
				for(var x = timeoffset; x >= 0; x--)
				{
					if($("#time"+x.toString()).length)
					{
						var tr = $("#time"+x.toString());
						$(tr).parents(".table-wrapper-inner").scrollTo($(tr), 200);
						break;
					}
				}
			}
		}
	}
	catch(err)
	{
	}
}

function downloads_show_tos(orderfunc)
{
	// If Download TOS has been agreed to already, a cookie is set. Skip showing the TOS if this cookie is set.
	if(document.cookie)
	{
		var cookie_arr = document.cookie.split(';');
		for(var i = 0; i < cookie_arr.length; i++)
		{
			if(cookie_arr[i].indexOf("cspanvl_dltos=") != -1)
			{
				orderfunc();
				return;
			}
		}
	}
	
	//Ugly, but unsure how else to fix issue with fancybox over flash player on Mac OS X w/ Safari
	var agent = navigator.userAgent.toLowerCase();
	var macsafari_check = false;
	if(agent.indexOf('mac os x') != -1 && agent.indexOf('safari') != -1)
		macsafari_check = true;
	
	$.ajax( {
		url: "/videoLibrary/tos.php?download_tos",
		type: "GET",
		cache: false,
		success: function( data ) {
			var tos = $("<div></div>");
			var tos_scroll = $( "<div id='tos_popup_text'><h3 style='font-size: 14px;'>Before you continue, please read and agree to the Terms of Service below</h3></div>" );

			$( tos_scroll ).append( "<br />" );
			
			$( tos_scroll ).append( $( data ).find( ".tos" ) );
			
			$(tos).append($(tos_scroll))
			$( tos ).append( "<div id='tos_popup_links'>" +
								"<div class='dl-button' style='float:left; margin-right:10px;'>" +
								"<div class='left'></div>" +
								"<div class='fill'><a href='#' class='swap-cufon dl-action tos_agree'>Agree</a></div>" +
								"<div class='right'></div>" +
								"</div>" +
								"<div class='dl-button' style='float:left;'>" +
								"<div class='left'></div>" +
								"<div class='fill'><a href='#' class='swap-cufon tos_disagree'>Refuse</a></div>" +
								"<div class='right'></div>" +
								"</div>" +
								"</div>");

			$.fancybox( $( tos ).html() , {modal: true, scrolling: 'no', onComplete: function(){
				$("#tos_popup_text").css("height", ($("#fancybox-inner").height() - 38).toString() + 'px');
				if(macsafari_check)
					$("#flashPlayer").hide();
				Cufon.refresh('.swap-cufon');
			}} );
			Cufon.refresh('.swap-cufon');

			$( ".tos_agree" ).click( function() {
				if(macsafari_check)
					$("#flashPlayer").show();
				orderfunc();
				var expireDate = new Date();
				expireDate.setTime(expireDate.getTime()+(10*365*24*60*60*1000));
				document.cookie = 'cspanvl_dltos=true; expires='+expireDate.toGMTString()+'; path=/';
				return false;
			});
			
			$( ".tos_disagree" ).click( function() {
				if(macsafari_check)
					$("#flashPlayer").show();
				$.fancybox("<h1 class='swap-cufon'>Order rejected</h1><p>Sorry, you must agree to the terms of service before your download can be processed.</p>", {scrolling:'no', autoDimensions:false, width: 450, height: 50});
				Cufon.refresh('.swap-cufon');
				return false;
			});
		}	
	});
}

function VLCreateClip(ctitle, cdesc, cstart, cend, fromClipid)
{
	if($("#createClip").length > 0)
	{
		$("#createClip input[name='start']").val(cstart);
		$("#createClip input[name='end']").val(cend);
		$("#createClip input[name='title']").val(ctitle);
		$("#createClip input[name='description']").val(cdesc);
		$("#createClip input[name='exClipid']").val(0);
		var formdata = $("#createClip").serialize() + "&type=user_createclip";
		if(fromClipid > 0 && $("#createClip input[name='fromClipid']").length > 0)
		{
			$("#createClip input[name='fromClipid']").val(fromClipid);
			formdata += "&fromClipid=" + fromClipid;
		}
		
		if($("#currentUserLink").length > 0)
			$("#createClip").submit();
		else
		{
			$.ajax({
				url: "/videoLibrary/ajax/ajax-widget-public.php",
				type: "POST",
				data: formdata,
				success: function(clipid){
					if(clipid.match(/_error/))
					{
						$.fancybox(clipid, {scrolling: 'no'});
					}
					else
					{
						$("#createClip input[name='exClipid']").val(clipid);
						$.ajax({
							url: "/videoLibrary/ajax/ajax-widget-public.php?type=user_cliplogin&createClip=" + clipid,
							type: "GET",
							success: function(html){
								$.fancybox(html, {modal: true, scrolling: 'no'});
								Cufon.refresh('.swap-cufon');
								$("#userClipLogin").unbind('submit').submit(function(){
									var loginform = $(this);
									$.ajax({
										url: $(loginform).attr('action'),
										type: "POST",
										data: $(loginform).serialize(),
										success: function(html){
											if(html.match(/login_error/))
											{
												$("#userClipLogin .error").html(html);
											}
											else
											{
												$.fancybox.close();
												$("#createClip").submit();
											}
										}
									});
									return false;
								});
							}
						});
					}
				}
			});
		}
		return true;
	}
	return false;
}

function VLShareClip(ctitle, cdesc, cstart, cend, fromClipid)
{
	if($("#createClip").length > 0)
	{
		$("#createClip input[name='start']").val(cstart);
		$("#createClip input[name='end']").val(cend);
		$("#createClip input[name='title']").val(ctitle);
		$("#createClip input[name='description']").val(cdesc);
		$("#createClip input[name='exClipid']").val(0);
		var formdata = $("#createClip").serialize() + "&type=user_createclip";
		if(fromClipid > 0)
			formdata += "&fromClipid=" + fromClipid;
		
		$.ajax({
			url: "/videoLibrary/ajax/ajax-widget-public.php",
			type: "POST",
			data: formdata,
			success: function(clipid){
				if(clipid.match(/_error/))
				{
					$.fancybox(clipid, {scrolling: 'no'});
				}
				else
				{
					try
					{
						var flashObject = document.getElementById('flashPlayer');
		
						if ( flashObject )
						{
							flashObject.addClipResult(parseInt(clipid,10));
						}
					}
					catch(err)
					{
					}
				}
			}
		});
		return true;
	}
	return false;
}

function VLSaveProgram()
{
	if($("#userShare .program_follow").length > 0)
	{
		$("#userShare .program_follow").click();
		return true;
	}
	return false;
}

function VLFollowSuggestions(followtype)
{
	if($("#followSuggestions").length > 0)
	{
		var followurl = $("#followSuggestions").attr('action');
		var followdata = $("#followSuggestions").serialize();
		if(followtype && followtype !== undefined)
			followdata += "&followtype=" + followtype;
		$.ajax({
			url: followurl,
			type: "GET",
			data: followdata,
			success: function(html){
				if(html && html.length > 0)
				{
					$.fancybox(html, {scrolling: 'no'});
					
					$("#followSuggestPopupWrapper li.imggroup .group_follow").unbind('click').click(function(){
						if(!$(this).hasClass("disabled"))
						{
							var thisstar = $(this);
							if($("#currentUserLink").length == 0)
							{
								var followloginurl = "/videoLibrary/ajax/ajax-widget-public.php?type=user_cliplogin";
								if($(thisstar).hasClass('person_follow'))
									followloginurl += "&followPerson=" + $(thisstar).attr('rel');
								else if($(thisstar).hasClass('tag_follow'))
									followloginurl += "&followTag=" + $(thisstar).attr('rel');
								else if($(thisstar).hasClass('org_follow'))
									followloginurl += "&followOrg=" + $(thisstar).attr('rel');
								$.ajax({
									url: followloginurl,
									type: "GET",
									success: function(html){
										$.fancybox(html, {scrolling: 'no'});
										Cufon.refresh('.swap-cufon');
										$("#userClipLogin").unbind('submit').submit(function(){
											var loginform = $(this);
											$.ajax({
												url: $(loginform).attr('action'),
												type: "POST",
												data: $(loginform).serialize(),
												success: function(html){
													if(html.match(/login_error/))
													{
														$("#userClipLogin .error").html(html);
													}
													else
													{
														$.fancybox.close();
														if($(thisstar).hasClass('person_follow'))
															location.href = "/videoLibrary/user.php?followPerson=" + $(thisstar).attr('rel');
														else if($(thisstar).hasClass('tag_follow'))
															location.href = "/videoLibrary/user.php?followTag=" + $(thisstar).attr('rel');
														else if($(thisstar).hasClass('org_follow'))
															location.href = "/videoLibrary/user.php?followOrg=" + $(thisstar).attr('rel');
													}
												}
											});
											return false;
										});
									}
								});
								return false;
							}
							
							var thiscount = $(thisstar).siblings(".follower_count");
							$(thisstar).addClass("disabled");
							var chkdata = "action=updateFavorite";
							if($(thisstar).hasClass('person_follow'))
								chkdata += "&personid=" + $(thisstar).attr('rel');
							else if($(thisstar).hasClass('tag_follow'))
								chkdata += "&tagid=" + $(thisstar).attr('rel');
							else if($(thisstar).hasClass('org_follow'))
								chkdata += "&orgid=" + $(thisstar).attr('rel');
							if(!$(thisstar).hasClass("group_follow_selected"))
							{
								$(thiscount).text(VLAddCommas(parseInt($(thiscount).text().replace(/\,/g,''),10) + 1));
								$(thisstar).addClass("group_follow_selected");
								if($(thisstar).hasClass('person_follow'))
									chkdata += "&psnfav=true";
								else if($(thisstar).hasClass('tag_follow'))
									chkdata += "&tagfav=true";
								else if($(thisstar).hasClass('org_follow'))
									chkdata += "&orgfav=true";
							}
							else
							{
								$(thiscount).text(VLAddCommas(parseInt($(thiscount).text().replace(/\,/g,''),10) - 1));
								$(thisstar).removeClass("group_follow_selected");
							}
							$.ajax({
								url: "/common/services/misc.php",
								type: "POST",
								data: chkdata,
								success: function(html){
									$(thisstar).removeClass('disabled');
									if($(thisstar).hasClass("group_follow_selected"))
										$(thisstar).attr('title', html);
									else
										$(thisstar).attr('title', 'Click to follow');
								}
							});
						}
						return false;
					});
					
					$("#followSuggestPopupWrapper .follow_all").unbind('click').click(function(){
						var followul = $(this).closest(".dl-button").siblings("ul");
						if($(followul).find(".group_follow_checkbox").length > 0)
							$(followul).find(".group_follow_checkbox").prop('checked',true);
						else if($("#currentUserLink").length == 0)
						{
							var followloginurl = "/videoLibrary/ajax/ajax-widget-public.php?type=user_cliplogin&programid=" + $("#followSuggestions input[name='programid']").val();
							var finalurl = "/videoLibrary/user.php?programid=" + $("#followSuggestions input[name='programid']").val();
							if($(this).hasClass('follow_all_sponsors'))
							{
								followloginurl += "&followProgramGroup=org";
								finalurl += "&followProgramGroup=org";
							}
							else if($(this).hasClass('follow_all_people'))
							{
								followloginurl += "&followProgramGroup=person";
								finalurl += "&followProgramGroup=person";
							}
							else if($(this).hasClass('follow_all_tags'))
							{
								followloginurl += "&followProgramGroup=tag";
								finalurl += "&followProgramGroup=tag";
							}
							$.ajax({
								url: followloginurl,
								type: "GET",
								success: function(html){
									$.fancybox(html, {scrolling: 'no'});
									Cufon.refresh('.swap-cufon');
									$("#userClipLogin").unbind('submit').submit(function(){
										var loginform = $(this);
										$.ajax({
											url: $(loginform).attr('action'),
											type: "POST",
											data: $(loginform).serialize(),
											success: function(html){
												if(html.match(/login_error/))
												{
													$("#userClipLogin .error").html(html);
												}
												else
												{
													$.fancybox.close();
													location.href = finalurl;
												}
											}
										});
										return false;
									});
								}
							});
						}
						else
						{
							var alldata = "action=groupFavorite&progfav=true";
							if($("#followSuggestions input[name='programid']").length > 0)
								alldata += "&programid=" + $("#followSuggestions input[name='programid']").val();
							if($(this).hasClass('follow_all_sponsors'))
								alldata += "&grouptype=org";
							if($(this).hasClass('follow_all_people'))
								alldata += "&grouptype=person";
							if($(this).hasClass('follow_all_tags'))
								alldata += "&grouptype=tag";
							if($(this).hasClass('follow_all_bills'))
								alldata += "&grouptype=bill";
							$.ajax({
								url: "/common/services/misc.php",
								type: "POST",
								data: alldata,
								success: function(html){
									$(followul).find(".group_follow").each(function(){
										if(!$(this).hasClass("group_follow_selected"))
										{
											$(this).addClass("group_follow_selected").attr('title', 'Following');
											var thiscount = $(this).siblings(".follower_count");
											$(thiscount).text(VLAddCommas(parseInt($(thiscount).text().replace(/\,/g,''),10) + 1));
										}
									});
								}
							});
						}
						
						return false;
					});
					
					if($("#followSuggestLoginCallback").length > 0)
					{
						$("#followSuggestLoginCallback").unbind('submit').submit(function(){
							if($(this).find(".group_follow_checkbox:checked").length > 0)
							{
								var followlogintype = $(this).find("input[name='followtype']").val();
								var followstr = followlogintype + '=';
								$(this).find(".group_follow_checkbox:checked").each(function(){
									followstr += $(this).val() + ',';
								});
								followstr = followstr.substr(0, followstr.length - 2);
								$.ajax({
									url: "/videoLibrary/ajax/ajax-widget-public.php?type=user_cliplogin&" + followstr,
									type: "GET",
									success: function(html){
										$.fancybox(html, {scrolling: 'no'});
										Cufon.refresh('.swap-cufon');
										$("#userClipLogin").unbind('submit').submit(function(){
											var loginform = $(this);
											$.ajax({
												url: $(loginform).attr('action'),
												type: "POST",
												data: $(loginform).serialize(),
												success: function(html){
													if(html.match(/login_error/))
													{
														$("#userClipLogin .error").html(html);
													}
													else
													{
														$.fancybox.close();
														location.href = "/videoLibrary/user.php?" + followstr;
													}
												}
											});
											return false;
										});
									}
								});
							}
							return false;
						});
					}
				}
			}
		});
		return true;
	}
	return false;
}

function getDownloadPrice(vidlength, type)
{
	if(type[1] == 'mp3')
		price = 0.99;
	else
	{
		if( vidlength <= 1200 ) // 15 min + 5 min
		{	
			price = 2.99;
		} else if( vidlength <= 7500 ) { // 120 min + 5 min
			price = 4.99;
		} else if( vidlength <= 29100 ) { // 8 hr + 5 min
			price = 6.99;
		} else {
			price = 7.99;
		}

		if( type[2] == "low" )
			price = price - 1;
		else if(type[2] == 'high')
			price = 150.0;
		
		if(type[1] == 'avi' || type[1] == 'mov')
			price *= 100;
	}
	
	return price;
}