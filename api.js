/**
 * Twee+ API (kind of) - http://tweeplus.com
 * @author Lea Verou
 * Last update: 23/8/2011
 * For moderate usage, you may hotlink, but try to host it yourself if you can
 */

Tweeplus = (function(){

var apig = document.createElement('a');

var self, private = {
	remove: function(arr, remarr) {
		if(!arr || !arr.length || !remarr || !remarr.length) {
			return arr;
		}
	
		var o = private.objectize(arr);
	
		for(var i=0; i<remarr.length; i++) {
			delete o[remarr[i]];
		}
	
		return private.arrayize(o);
	},
	
	objectize: function(arr) {
		var o = {}, l = arr.length;
	
		for(i=0; i<l;i+=1) {
			o[arr[i]] = arr[i];
		}
	
		return o;
	},
	
	arrayize: function(o) {
		var r = [];
	
		for(var i in o) {
			r.push(o[i]);
		}
	
		return r;
	},
	
	unique: function(arr) {
		return private.arrayize(private.objectize(arr));
	}
};

return self = {
	encode: function(text) {
		return encodeURIComponent(trim(text))
			.replace(/'/g, '%27')
			.replace(/\(/g, '%28')
			.replace(/\)/g, '%29')
			.replace(/\*/g, '%2A')
			.replace(/\./g, '%2E')
			.replace(/~/g, '%7E')
			
			.replace(/%20/g, '+');
	},
	
	decode: function(text) {
		try {
			return decodeURIComponent(text.replace(/\+/g, '%20'));
		}
		catch (e) {
			return 'Does not compute :(';
		}
	},
	
	// Get mentions, hashtags, URLs
	links: function(text) {
		return private.unique(text.match(/(@\w{1,20}|(https?|ftps?):\/\/\w[\w._\+%#\/-]+|#\w+)/gi) || []);
	},
	
	// Get mentions only
	mentions: function(text) {
		return private.unique(text.match(/@\w{1,20}/g) || []);
	},
	
	// Pass in an @mention, #hashtag or URL, get an HTML link
	linkify: function(name) {
		var ret = ['<a target="_blank" href="'],
		    twitter = 'http://twitter.com/',
		    ame = name.slice(1);
		
		if (name.charAt(0) === '@') {
			ret.push(twitter, ame, '"><img src="', twitter, '/api/users/profile_image?screen_name=', ame, '&amp;size=mini" />', name);
		}
		else if (name.charAt(0) === '#') {
			// Hashtag
			ret.push(twitter, 'search?q=%23', ame, '">', name);
		}
		else if (/^(https?|ftps?):\/\//i.test(name)) {
			ret.push(name, 
				name.length > 30? '" title="' + name + '">' + name.slice(0, 30) + '…' : '">' + name
			);
		}
		
		ret.push('</a>');
		
		return ret.join('');
	},
	
	tweet: function(text, replyURL) {
		if(text.length > 140) {
			text = text.trim? text.trim() : text.replace(/^\s+|\s+$/g, '');
			
			var username = replyURL? (replyURL.match(/\/(\w+)\/status\//i) || [,''])[1] : '',
				cutoff = 114 - (username? username.length + 2 : 0), // initial cut-off point
				summary,
				mentions = self.mentions(text),
				previousLength = mentions.length + 1;
	
			while (mentions.length < previousLength) {
				summary = text.slice(0, cutoff - (mentions.length? mentions.join(' ').length + 1 : 0));
				previousLength = mentions.length;
				mentions = private.remove(mentions, self.mentions(summary));
			}
			
			apig.href = location.href;
		
			apig.search = replyURL? 'in_reply_to=' + replyURL : '';

			return summary + '[…] ' + apig.href + (mentions.length? ' ' + mentions.join(' ') : '');
		}
		else {
			return text;
		}
	}
};

function trim(text) {
	return text && (text.trim? text.trim() : text.replace(/^\s+|\s+$/g, ''));
}

})();