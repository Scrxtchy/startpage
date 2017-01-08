VERSION = "v1.6.0";


function version(){
	var msg;
	var responseobj;
	var request = new XMLHttpRequest();

	request.onload = function(){
		responseobj = JSON.parse(this.responseText);
		if(responseobj.tag_name != VERSION && this.status == 200){
			msg = responseobj.tag_name;
		}
	};

	request.open("get",
			"http://api.github.com/repos/scrxtchy/startpage/releases/latest",
			false);
	request.send();

	return msg;
}



function fixJitter(container){
	container.style.height = window.innerHeight - 0.5 + "px";
}


function popup(obj, msg){
	var popuphandler = function(){
		popup(this, msg);
	};
	// add event listener when it's going to be visible
	if(!visibility){
		obj.addEventListener("click", popuphandler);
		obj.innerHTML = msg;
		obj.style.bottom = "-" + data.style.border_width_normal;
	}else{
		obj.removeEventListener("click", popuphandler);
		obj.style.bottom = "-200px";
	}
	visibility = !visibility;
}


// expanding and contracting squares
function expand(){
	if(this.acount > 0){
		this.style.height = 300 + 25*this.acount + "px";
	}else{
		this.style.height = "337px";
	}
	if(data.bool.borders){
		this.style.borderWidth = data.style.border_width_hovered;
	}
}


function contract(){
	this.style.height = "150px";
	this.style.borderWidth = data.style.border_width_normal;
}



String.prototype.replaceChars = function(character, replacement){
	var str = this;
	var a;
	var b;
	for(var i=0; i < str.length; i++){
		if(str.charAt(i) == character){
			a = str.substr(0, i) + replacement;
			b = str.substr(i + 1);
			str = a + b;
			if(replacement === ""){
				i--;
			}
		}
	}
	return str;
};


function search(query){
	//--key value
	var pattern =/^([^\w\d]+)([\w\d]+)/; //SEARCH PATTERN
	var formattedQuery = pattern.exec(query);
	if (formattedQuery == null){
		destination = searchsquare.links[Object.keys(searchsquare.links)[0]][Object.keys(searchsquare.links[Object.keys(searchsquare.links)[0]])[0]]
		window.location = destination.url + query.replaceChars(" ", destination.space);
	} else {
		formattedQuery.push(formattedQuery.input.replace(formattedQuery[0]+ " ", ""))
	}
	//FORMATTED QUERY// ["--key", "--", "key", "Value"]
	if(typeof searchsquare == 'undefined'){
		configmenuInit(undefined);
	}else if (formattedQuery[0] == "-help"){
		popup(popupDiv, HelpText); 					//display help text
	}else if (formattedQuery[0] == "-config"){
		configmenuInit(undefined); 					//open config menu
	}else if (formattedQuery[0] === ""){
		popup(popupDiv, HelpText);
	}else{ //search
		dest = searchsquare.links[formattedQuery[1]][formattedQuery[2]]
		if(dest){
			window.location = dest.url + formattedQuery[3].replaceChars(" ", dest.space)
		}
	}
}

window.onresize = function(){
	fixJitter(container);
};


var focusedSquare = -1;
var focusedLink = 0;

function globalKeyListener(e){
	if (e.charCode == 96 && e.ctrlKey && typeof configmenu !== "undefined"){
		location.reload(); //Change back when able to properly use
		return;
	}else if(typeof configmenu !== "undefined" ||
	   searchsquare.searchinput == document.activeElement){
		return;
	} 

	var key = e.keyCode;
	if(key == 9){
		// tab
		searchsquare.squareElement.style.height = "337px";
		searchsquare.squareElement.style.borderWidth = data.style.border_width_hovered;
		searchsquare.searchinput.focus();
	}else if(e.charCode == 96 && e.ctrlKey){
		if(!$('#Config-Menu').elements[0]) configmenuInit(undefined);			
	}else if(key == 37){
		// left arrow
		if(focusedSquare > 0){
			normalSquares[focusedSquare].unfocus(focusedLink);
			normalSquares[focusedSquare].contract();
			focusedSquare--;
			focusedLink = 0;
			normalSquares[focusedSquare].expand();
			normalSquares[focusedSquare].focus(focusedLink);
		}
	}else if(key == 38 && focusedSquare >= 0){
		// up arrow
		if(focusedLink > 0){
			normalSquares[focusedSquare].unfocus(focusedLink);
			focusedLink--;
			normalSquares[focusedSquare].focus(focusedLink);
		}
	}else if(key == 39){
		// right arrow
		if(focusedSquare < normalSquares.length - 1){
			if(focusedSquare >= 0){
				normalSquares[focusedSquare].unfocus(focusedLink);
				normalSquares[focusedSquare].contract();
			}
			focusedSquare++;
			focusedLink = 0;
			normalSquares[focusedSquare].expand();
			normalSquares[focusedSquare].focus(focusedLink);
		}
	}else if(key == 40 && focusedSquare >= 0){
		// down arrow
		if(focusedLink < normalSquares[focusedSquare].links.length - 1){
			normalSquares[focusedSquare].unfocus(focusedLink);
			focusedLink++;
			normalSquares[focusedSquare].focus(focusedLink);
		}
	}else if(key == 13){
		// enter
		window.location = normalSquares[focusedSquare].links[focusedLink].url;
	}

	if([9,37,38,39,40].indexOf(key) > -1){
		e.preventDefault();
	}
}



function main(){
	visibility = false;
	container = document.getElementById("container");
	fixJitter(container);
	popupDiv = document.getElementById("popup");

	document.addEventListener("keypress", globalKeyListener);
	if(data.bool.allowVersionCheck){
		var ver = version();
		if(ver){
			var verMsg = "<a href='https://github.com/scrxtchy/startpage/" +
						 "releases'>A new version is available: " + ver +
						 "</a>";

			popup(popupDiv, verMsg);
		}
	}

	// generate helptext for static options
	var prefix = data.squares[data.squares.length - 1].prefix;
	HelpText = "<table><tr><td>" + prefix +
			   "help</td><td>: Shows this help message</td></tr><tr><td>" +
			   prefix + "config</td><td>: Opens the config menu</td></tr></table>";

	// generate helptext for custom options
	var searchsquareOptions = data.squares[data.squares.length - 1].options;
	if(searchsquareOptions){
		HelpText += "<br><table>";
		for(var i=0; i < searchsquareOptions.length; i++){
			// remove scheme, path and everything after path from URL
			var url = searchsquareOptions[i].url.replace(/https?:\/\//, "")
												.replace(/\/.*/, "");
			HelpText += "<tr><td>" + prefix + searchsquareOptions[i].opt +
						"</td><td>: " + url + "</td></tr>";
		}
		HelpText += "</table>";
	}
}


document.addEventListener("DOMContentLoaded", function(event){
	configmenuInit(main);
});
