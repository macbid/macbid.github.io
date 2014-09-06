$(window).resize(function(){
    $(".twitter-timeline").height($(window).height()-120);
});

$(window).load(function(){
   function resizeTw(){
     $(window).trigger('resize');
   };
   window.setTimeout(resizeTw, 500); // 1 second
})