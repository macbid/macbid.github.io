var first = true;

var config = {
  //"id": '502160051226681344', //test avec photos de chat
  "id": '507966006153584640', //test fil macbidouille
  "enableLinks": true,
  "maxTweets": 50,
  "showImages": true,
  "showUser": false,
  "showTime": true,
  "showRetweet": true,
  "showInteraction": true,
  "customCallback": handleTweets,
  "dateFunction": dateFormatter,
  "lang": 'fr'
};

function dateFormatter(date) {
	var offset = 4;

	var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
	var newDate = new Date(utc + (3600000*offset));
	
	return newDate.toLocaleString();
}

function handleTweets(tweets){    
	for(t in tweets) {
		if (add(tweets[t])){
			if (first){
				$("#twitter ul").prepend('<li>' + tweets[t] + '</li>');
			} else {
			    $('<li>' + tweets[t] + '</li>').hide().prependTo("#twitter ul").fadeIn({ duration: 1000, queue: false }).slideDown(1000); ;	
			}
    	}
	}
	first = false;
}

function add(tweet){
	var result = true;
	
	var id = $(tweet).first().val();
	var date = new Date($(tweet).eq(2).text());
	
	var datet = new Date($('li').first().find('.timePosted').text());
	
	if (date <= datet){
		return false;
	}
	
	$('li').each(function(){
		var idt = $(this).find('input').val();
				
		if( idt == id ) {
			result = false;
    		return false;
  		}
  		
	});
	
	$('input[name=id]').each(function() {
		if( $(this).val() == id ) {
			result = false;
    		return false;
  		}
	});
	return result;
}

function refresh(){
        twitterFetcher.fetch(config);
        setTimeout("refresh()",3000);
}

refresh();
