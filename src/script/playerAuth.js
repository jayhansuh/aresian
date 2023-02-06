


// Generate a random name from animals and colors
const animals = require('./animals.json');
const colors = require('./colors.json');
export function generateName() {
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const color = colors[Math.floor(Math.random() * colors.length)].name.split(' ').join('_');
    return `${color}_${animal}`;
}

//Cookies
function getCookie (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return null;
}

function isLoggedIn() {
    return (getCookie("player_id") != null);
}

//reset cookie
function resetCookie() {
    //reset player_id
    document.cookie = "player_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    //reset username
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
//resetCookie();

// Check if the player is logged in
if (!isLoggedIn()) {
    //if player is not logged in, generate a random player id and username
    var player_id = Math.floor(Math.random() * 1000000);
    document.cookie = "player_id=" + player_id;
    var username = generateName();
    document.cookie = "username=" + username;
}
else{
    //if player is logged in, get the player id and username
    var player_id = getCookie("player_id");
    var username = getCookie("username");
    console.log("player_id: " + player_id);
    console.log("username: " + username);
}

// hello to player by popup window
function helloPlayer() {
    var hello = document.getElementById("hello");
    hello.innerHTML = "<span>Hello, " + username + "!</span>"
    hello.innerHTML += "<span>You are player " + player_id + ".</span>"
    hello.innerHTML += "<span>If you want to change your username, please click on the button below.</span>";
}
helloPlayer();
//window.localStorage.setItem('playerAuth', '{"username":"admin","password":"admin"}');

// hello div onclick function to disappear
function popupDisappear() {
    var popupDiv = document.getElementById("popupDiv");
    popupDiv.style.display = "none";
}
window.popupDisappear = popupDisappear;