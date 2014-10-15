$(window).resize(function(){
	$(".twitter-timeline").height($(window).height()-210);
});

$(window).load(function(){
	function resizeTw(){
		$(window).trigger('resize');
	};
   window.setTimeout(resizeTw, 500); // 1 second

   $('body').click( function (e) {  
   	if ( this === e.target ) {
   		window.open	("http://macway.commander1.com/c3/?tcs=1377&chn=Display&src=Macbidouille&cmp=habillage&med=48&dis_pub=&dis_c=&dis_v=&dis_f=&url=http://www.macway.com/fr/?p=&utm_source=48&utm_campaign=macbidouille&utm_medium=habillage");
   	}
   });
});