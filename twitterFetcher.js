/* https://github.com/jasonmayes/Twitter-Post-Fetcher */
var twitterFetcher = function() {
  var domNode = '';
  var maxTweets = 20;
  var parseLinks = true;
  var queue = [];
  var inProgress = false;
  var printTime = true;
  var printUser = true;
  var formatterFunction = null;
  var supportsClassName = true;
  var showRts = true;
  var customCallbackFunction = null;
  var showInteractionLinks = true;
  var showImages = false;
  var lang = 'en';

  function handleTweets(tweets){
    if (customCallbackFunction === null) {
      var x = tweets.length;
      var n = 0;
      var element = document.getElementById(domNode);
      var html = '<ul>';
      while(n < x) {
        html += '<li>' + tweets[n] + '</li>';
        n++;
      }
      html += '</ul>';
      element.innerHTML = html;
    } else {
      customCallbackFunction(tweets);
    }
  }

  function strip(data) {
    return data.replace(/<b[^>]*>(.*?)<\/b>/gi, function(a,s){return s;})
        .replace(/class=".*?"|data-query-source=".*?"|dir=".*?"|rel=".*?"/gi,
        '');
  }

  function getElementsByClassName (node, classname) {
    var a = [];
    var regex = new RegExp('(^| )' + classname + '( |$)');
    var elems = node.getElementsByTagName('*');
    for (var i = 0, j = elems.length; i < j; i++) {
        if(regex.test(elems[i].className)){
          a.push(elems[i]);
        }
    }
    return a;
  }

  function extractImageUrl(image_data) {
    if (image_data !== undefined) {
      var data_src = image_data.innerHTML.match(/data-srcset="([A-z0-9%_\.-]+)/i)[0];
      return decodeURIComponent(data_src).split('"')[1];
    }
  }

  return {
    fetch: function(config) {
      if (config.maxTweets === undefined) {
        config.maxTweets = 20;
      }
      if (config.enableLinks === undefined) {
        config.enableLinks = true;
      }
      if (config.showUser === undefined) {
        config.showUser = true;
      }
      if (config.showTime === undefined) {
        config.showTime = true;
      }
      if (config.dateFunction === undefined) {
        config.dateFunction = 'default';
      }
      if (config.showRetweet === undefined) {
        config.showRetweet = true;
      }
      if (config.customCallback === undefined) {
        config.customCallback = null;
      }
      if (config.showInteraction === undefined) {
        config.showInteraction = true;
      }
      if (config.showImages === undefined) {
        config.showImages = false;
      }

      if (inProgress) {
        queue.push(config);
      } else {
        inProgress = true;

        domNode = config.domId;
        maxTweets = config.maxTweets;
        parseLinks = config.enableLinks;
        printUser = config.showUser;
        printTime = config.showTime;
        showRts = config.showRetweet;
        formatterFunction = config.dateFunction;
        customCallbackFunction = config.customCallback;
        showInteractionLinks = config.showInteraction;
        showImages = config.showImages;

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'http://cdn.syndication.twimg.com/widgets/timelines/' +
            config.id + '?&lang=' + (config.lang || lang) + '&callback=twitterFetcher.callback&' +
            'suppress_response_codes=true&rnd=' + Math.random();
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    },

    callback: function(data) {
      var div = document.createElement('div');
      div.innerHTML = data.body;
      if (typeof(div.getElementsByClassName) === 'undefined') {
         supportsClassName = false;
      }

      var tweets = [];
      var authors = [];
      var times = [];
      var images = [];
      var rts = [];
      var tids = [];
      var x = 0;

      if (supportsClassName) {
        var tmp = div.getElementsByClassName('tweet');
        while (x < tmp.length) {
          if (tmp[x].getElementsByClassName('retweet-credit').length > 0) {
            rts.push(true);
          } else {
            rts.push(false);
          }
          if (!rts[x] || rts[x] && showRts) {
            tweets.push(tmp[x].getElementsByClassName('e-entry-title')[0]);
            tids.push(tmp[x].getAttribute('data-tweet-id'));
            authors.push(tmp[x].getElementsByClassName('p-author')[0]);
            times.push(tmp[x].getElementsByClassName('dt-updated')[0]);
            if (tmp[x].getElementsByClassName('inline-media')[0] !== undefined) {
              images.push(tmp[x].getElementsByClassName('inline-media')[0]);
            } else {
              images.push(undefined);
            }
          }
          x++;
        }
      } else {
        var tmp = getElementsByClassName(div, 'tweet');
        while (x < tmp.length) {
          tweets.push(getElementsByClassName(tmp[x], 'e-entry-title')[0]);
          tids.push(tmp[x].getAttribute('data-tweet-id'));
          authors.push(getElementsByClassName(tmp[x], 'p-author')[0]);
          times.push(getElementsByClassName(tmp[x], 'dt-updated')[0]);
          if (getElementsByClassName(tmp[x], 'inline-media')[0] !== undefined) {
            images.push(getElementsByClassName(tmp[x], 'inline-media')[0]);
          } else {
            images.push(undefined);
          }

          if (getElementsByClassName(tmp[x], 'retweet-credit').length > 0) {
            rts.push(true);
          } else {
            rts.push(false);
          }
          x++;
        }
      }

      if (tweets.length > maxTweets) {
        tweets.splice(maxTweets, (tweets.length - maxTweets));
        authors.splice(maxTweets, (authors.length - maxTweets));
        times.splice(maxTweets, (times.length - maxTweets));
        rts.splice(maxTweets, (rts.length - maxTweets));
        images.splice(maxTweets, (images.length - maxTweets));
      }

      var arrayTweets = [];
      var n = tweets.length-1;
      var x = -1;
      while(n > x) {
        if (typeof(formatterFunction) !== 'string') {
          var newDate = new Date(times[n].getAttribute('datetime')
              .replace(/-/g,'/').replace('T', ' ').split('+')[0]);
          var dateString = formatterFunction(newDate);
          times[n].setAttribute('aria-label', dateString);

          if (tweets[n].innerText) {
            // IE hack.
            if (supportsClassName) {
              times[n].innerText = dateString;
            } else {
              var h = document.createElement('p');
              var t = document.createTextNode(dateString);
              h.appendChild(t);
              h.setAttribute('aria-label', dateString);
              times[n] = h;
            }
          } else {
            times[n].textContent = dateString;
          }
        }
        var op = '';
        
        op += '<input type="hidden" name="id" value="'+ tids[n] +'">';
        
        if (showInteractionLinks) {
          op += '<div class="interact"><a href="https://twitter.com/intent/' +
              'tweet?in_reply_to=' + tids[n] + '" class="twitter_reply_icon">' +
              'Reply</a><a href="https://twitter.com/intent/retweet?tweet_id=' +
              tids[n] + '" class="twitter_retweet_icon">Retweet</a>' +
              '<a href="https://twitter.com/intent/favorite?tweet_id=' +
              tids[n] + '" class="twitter_fav_icon">Favorite</a></div>';
        }
        if (parseLinks) {
          if (printUser) {
            op += '<div class="user">' + strip(authors[n].innerHTML) +
                '</div>';
          }
          if (printTime) {
            op += '<div class="timePosted">' +
                times[n].getAttribute('aria-label') + '</div>';
          }
          op += '<div class="tweet">' + strip(tweets[n].innerHTML) + '</div>';
        } else {
          if (tweets[n].innerText) {
            if (printUser) {
              op += '<div class="user">' + authors[n].innerText + '</div>';
            }
            if (printTime) {
              op += '<div class="timePosted">' + times[n].innerText + '</div>';
            }
            op += '<div class="tweet">' +  tweets[n].innerText + '</div>';
          } else {
            if (printUser) {
              op += '<div class="user">' + authors[n].textContent + '</div>';
            }
            if (printTime) {
              op += '<div class="timePosted">' + times[n].textContent + '</div>';
            }
            op += '<div class="tweet">' +  tweets[n].textContent + '</div>';
          }
        }

        if (showImages && images[n] !== undefined) {
          op += '<div class="media">' +
              '<img src="' + extractImageUrl(images[n]) + '" alt="Image from tweet" />' +
              '</div>';
        }

        arrayTweets.push(op);
        n--;
      }
      handleTweets(arrayTweets);
      inProgress = false;

      if (queue.length > 0) {
        twitterFetcher.fetch(queue[0]);
        queue.splice(0,1);
      }
    }
  }
}();
