var easycursor = document.getElementById('easycursor');
var easybutton = document.getElementById('easybutton');
var hardcursor = document.getElementById('hardcursor');
var hardbutton = document.getElementById('hardbutton');

easybutton.style.visibility = 'hidden';
hardbutton.style.visibility = 'hidden';

easycursor.onmouseover = function() {
	easybutton.style.visibility = 'visible';
};

easybutton.onclick = function() {
	easybutton.style.visibility = 'hidden';
};

hardcursor.onmouseover = function() {
	hardbutton.style.visibility = 'visible';
};

hardbutton.onclick = function() {
	hardbutton.style.visibility = 'hidden';
};