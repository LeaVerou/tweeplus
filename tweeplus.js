function $(id) { return document.getElementById(id); }
function $t(tag, con) { return (con || document).getElementsByTagName(tag); }

//(function() {

// Cache DOM lookups, for performance
var mobile = /i(Phone|Pad)/i.test(navigator.userAgent), // mobile devices I could get my hands on...
	form = document.forms[0],
	textarea = $t('textarea')[0],
	textInput = form.elements.text,
	counter = $('counter'),
	counterEncoded = $('counter-encoded'),
	linksContainer = $('links'),
	replyURL = $('reply-url'),

	// Find radial-gradient prefix
	prefix = (function() {
		var prefixes = ['', '-moz-', '-webkit-', '-o-', '-ms-'],
			gradient = 'radial-gradient(white,black)',
			style = document.createElement('p').style;
	
		for(var i=0; i<prefixes.length; i++) {
			try { 
				style.backgroundImage = prefixes[i] + gradient;
			} catch(e) {}
	
			if(style.backgroundImage) {
				return prefixes[i];
			}
		}
	
		return false;
	})();

if (prefix !== false) {
	onmousemove = function(evt) {
		var x = ~~(100/innerWidth * evt.clientX),
			y = ~~(100/innerHeight * evt.clientY);

		document.body.style.backgroundImage = prefix + 'radial-gradient(' + x + '% ' + y + '%, rgba(0,0,0,0), black)';
	};
}

var encodingFactor = 0;

textarea.oninput = textarea.onkeyup = function(e) {
	if(e && e.type === 'input' && textarea.onkeyup) {
		textarea.onkeyup = null;
	}

	var text = textarea.value,
		length = text.length;

	// Update counters
	counter.innerHTML = length;

	// Estimate encoded length
	var encodedEstimate = ~~(length * encodingFactor);

	counterEncoded.innerHTML = 'around ' + encodedEstimate;

	// Adjust textarea size
	!mobile && adjustSize();

	// Extract users & hashtags info
	var links = Tweeplus.links(text);

	for (var i=links.length-1; i>=0; i--) {
		links[i] = Tweeplus.linkify(links[i]);
	}

	linksContainer.innerHTML = links.join(' ');
	
	// Does it look like a reply?
	if(links.length && !replyURL.value && text.charAt(0) === '@') {
		textarea.className = 'possible-atreply';
	}
	else if (textarea.className) {
		textarea.className = ''
	}
};

textarea.onblur = function() {
	var text = textarea.value,
		length = text.length,
		encoded = Tweeplus.encode(text);

	hash('#' + encoded);
	
	adjustSize();

	// Update encoded counter
	counterEncoded.innerHTML = encoded.length;

	encodingFactor = encoded.length / text.length;

	counterEncoded.className = encoded.length > 2000? 'over-limit' : '';

	// Generate short tweet
	textInput.value = Tweeplus.tweet(text, replyURL.value || '');
	
};

/* Stuff done on page load */
if(location.search) {
	var reply = (location.search.match(/(?:\?|&)in_reply_to=([^&]+)/i) || [])[1];

	if(reply) {
		replyURL.value = decodeURIComponent(reply);
	}
}

(onhashchange = function() {
	var decoded = Tweeplus.decode(hash());

	if (textarea.value !== decoded) {
		textarea.value = decoded;
	}

	textarea.oninput();
	textarea.onblur();
})();

form.onsubmit = function () {
	textarea.onblur(); // Just in case

	updateReply();
};

replyURL.onfocus = function() {
	this.select();
};

/**
 * Helper functions
 */
function updateReply() {
	$('in_reply_to').value = replyURL.value? (replyURL.value.match(/\/status\/(\d{3,})$/i) || [,''])[1] : '';
}

function adjustSize() {
	var length = textarea.value.length;

	textarea.rows = ~~(length/80) || 1;

	do {
		textarea.rows += 2;

		var height = textarea.offsetHeight;
	} while (height && height < textarea.scrollHeight && textarea.rows < length);

	textarea.rows++;
}

if(!mobile) {
	onresize = adjustSize;
}


function hash(hash) {
	if (!hash) {
		// location.hash is automatically decoded in FF
		return (location.href.match(/#(.+$)/) || [,''])[1];
	}
	else if (history.pushState) {
	    history.pushState(null, null, hash.indexOf('#') === 0? hash : '#' + hash);
	}
	else {
		location.hash = hash;
	}
}

//})();