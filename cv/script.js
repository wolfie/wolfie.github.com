$(document).ready(function () {
	hideJsWarning();
	fixAge();
	fixSkype();
	fixEmail();
});

var hideJsWarning = function() {
	$("#javascriptwarning").remove();
}

var fixAge = function() {
	var dobElement = $("#dob");
	var datestring = dobElement[0].getAttribute("datetime");
	var dob = new Date(datestring);
	var now = new Date();
	var age = now.getFullYear() - dob.getFullYear();
	var m = now.getMonth() - dob.getMonth();
	if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
		age--;
	}
	
	dobElement.append("<span class='faded'>, i.e. "+age+" years old</span>");
};

var fixSkype = function() {
	// security by obfuscation
	$("#skype").html("<a href"+
		"='skype:henrik-paul"+
		"?chat'>henrik-paul</a>");
};

var fixEmail = function() {
	// security by obfuscation
	$("#email").html("<a href"+
		"='mailto:henrik.paul"+
		"@gmail.com'> henrik.paul"+
		"@gmail.com</a>");
};