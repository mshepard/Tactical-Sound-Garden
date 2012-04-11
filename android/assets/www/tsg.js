function onBodyLoad()
{		
    document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady()
{
    
    // VARIABLES
    
    var myUsername = "";
    var myPassword = "";
    
    var ServerURL = "http://www.tacticalsoundgarden.net/sandbox/";
    var SoundsDirectoryURL = "http://www.tacticalsoundgarden.net/sandbox/sounds/";
    var LocalSoundsDirectory = "sounds/"
    var LoginURL = "http://www.tacticalsoundgarden.net/sandbox/client_login_mobile.php";
    var LogoutURL = "http://www.tacticalsoundgarden.net/sandbox/client_logout_mobile.php";
    var PlantSoundURL = "http://www.tacticalsoundgarden.net/sandbox/client_plant_mobile.php";
    var PruneSoundURL = "http://www.tacticalsoundgarden.net/sandbox/client_prune_mobile.php";
    var GetMessagesURL = "http://www.tacticalsoundgarden.net/sandbox/client_getmessages_mobile.php";
    var SendMessageURL = "http://www.tacticalsoundgarden.net/sandbox/client_sendmessage_mobile.php";
    var GetSoundsURL = "http://www.tacticalsoundgarden.net/sandbox/client_getsounds_mobile.php";
    
    var gardenSounds = new Array();
    var librarySounds = new Array();
    var activeSounds = new Array();
    var messages = new Array();
    
    var maxSounds = 6;

    var soundCutoffDistance = 100;
    
    /*
    
    var librarySoundFiles = new Array("palme.mp3", "woody.mp3", "gotagua.mp3", "timi.mp3", "passaro.mp3", "pulsos.mp3", "bosaa.mp3", "submersive.mp3", "yulatupe.mp3", "huffs.mp3", "sonya.mp3", "baybee.mp3");
    
    for (i=0; i<librarySoundFiles.length; i++) {
        var sound = new Object();
        sound.soundID = null;
        sound.soundOwner = null;
        var temp = librarySoundFiles[i].split(".");
        sound.soundName = temp[0];
        sound.soundFileName = librarySoundFiles[i];
        sound.soundFileURI = null;
        sound.soundLat = null;
        sound.soundLon = null;
        sound.soundVolume = .5;
        sound.soundInterval = "Loop";
        sound.soundMinDistance = soundMinDistance;
        sound.soundMaxDistance = soundMaxDistance;
        sound.soundPlayDate = null;
        librarySounds.push(sound);
    }
    
    */
    
    var soundIntervals = { "loop":0,"once only":-1,"every 10 seconds":10000,"every 30 seconds":30000,"every minute":60000,"every 5 minutes":300000,"every 30 minutes":1800000,"every hour":3600000 };
                          
    var currentPosition = new Object();
    var lat;
    var lon;

    // PAGE FUNCTIONS

    $('#loginForm').submit(function() {
                           $('#prompt').html('Connecting....');
                           myUsername = $('[name=username]').val();
                           myPassword = $('[name=password]').val();
                           $.get(LoginURL,{username:myUsername,password:myPassword},
                                 function(data) {
                                 if(data.success) {
                                 initGarden();
                                 } else {
                                 $('#prompt').html(data.message);
                                 }
                                 },'json');
                           
                           return false;
                           });

    $('#logoutBtn').bind("click", function() {
                         $.get(LogoutURL,{username:myUsername} ,
                               function(data) {
                               if(data.success) {
                               $.mobile.changePage( "#loginPage", { transition: "slide", reverse: true } );
                               $('#prompt').html(data.message);
                               } else {
                               alert("Oops. Something went wrong. Please try again.");
                               }
                               },'json');
                         
                         return false;
                         });

    // DYNAMIC PAGE CREATION

    $(document).bind( "pagebeforechange", function( e, data ) {
                     
                        if ( typeof data.toPage === "string" ) {
                     
                            var u = $.mobile.path.parseUrl(data.toPage);

                            if ( u.hash.search("#mainPage") != -1) {
                                createMainPage( u, data.options );
                                e.preventDefault();
                            } else if ( u.hash.search("#menuPage") != -1) {
                                createMenuPage( u, data.options );
                                e.preventDefault();
                            } else if ( u.hash.search("#paramsPage") != -1) {
                                createParamsPage( u, data.options );
                                e.preventDefault();
                            } else if ( u.hash.search("#messagePage") != -1) {
                                createMessagePage( u, data.options );
                                e.preventDefault();
                            }
                        }
                     
                     });
        
    function createMainPage(url, options) {
        
        var $page = $( "#mainPage" );
        
        // get messages
        
        $.get(GetMessagesURL, {username:myUsername}, function(data){
              
              if (data.success) {
              
                if (data.messages.length > 0) {
              
                    messages = data.messages;
              
                    // Get the content area element for the page.
              
                    var $content = $page.children( ":jqmData(role=content)" );
              
                    if (messages.length == 0) {
                        $content.find("p").html("You have no new messages.");
                    } else if (messages.length == 1) {
                        $content.find("p").html("You have 1 new message.");
                    } else {
                        $content.find("p").html("You have "+messages.length+" new messages.");
                    }
              
                    $page.page();
                    options.dataUrl = url.href;
                    $.mobile.changePage( $page, options );
              
                } else {
              
                    var $content = $page.children( ":jqmData(role=content)" );
                    $content.find("p").html("You have no new messages.");
                    $page.page();
                    options.dataUrl = url.href;
                    $.mobile.changePage( $page, options );
                }
              } else {
              
                console.log("Failed to load messages!");
              
                // Get the content area element for the page.
                $content = $page.children( ":jqmData(role=content)" ),
              
                $content.find("p").html("Failed to load new messages.");
              
                $page.page();
                options.dataUrl = url.href;
                $.mobile.changePage( $page, options );
              }
              },'json');
        
    }

    function createMenuPage(url, options) {
        
        var $page = $( "#menuPage" );

        // Get the header for the page.
        var $header = $page.children( ":jqmData(role=header)" );
        
        // Get the content area element for the page.
        var $content = $page.children( ":jqmData(role=content)" );
        
        // The markup we are going to inject into the content area
        var markup = "<ul data-role='listview'>";
        
        if (url.hash.search("plant") != -1) {
            for (var i=0; i < librarySounds.length; i++) {
                markup += "<li><a href=\"#paramsPage?plant="+i+"\">" + librarySounds[i].soundName + "</a></li>";
            }
            markup += "</ul>";
            $header.find( "h1" ).html( "Pick a Sound" );
            
        } else if (url.hash.search("messages") != -1) {
            for ( var i = 0; i < messages.length; i++ ) {
                markup += "<li><a href=\"#messagePage?view="+i+"\">re: " + messages[i].soundName + "</a></li>";
            }
            markup += "</ul>";
            $header.find( "h1" ).html( "Messages" );
        }
        
        $content.html( markup );

        $page.page();
        $content.find( ":jqmData(role=listview)" ).listview();
        options.dataUrl = url.href;
        $.mobile.changePage( $page, options );
    }

    function createParamsPage(url, options) {
        
        var $page = $( "#paramsPage" );
        
        // Get the header for the page.
        var $header = $page.children( ":jqmData(role=header)" );
        
        // Get the content area element for the page.
        var $content = $page.children( ":jqmData(role=content)" );
        
        if (url.hash.search("plant") != -1) {
            
            var t = url.hash.split("=");
            var c = t[1]; // id of current sound
            
            $header.find( "h1" ).html( "Planting " + librarySounds[c].soundName );
            
            var markup = "<form method=\"get\" action=\"#\" id=\"plantForm\">" +
            "<div data-role=\"fieldcontain\">" +
            "<input type=\"hidden\" value=\"" + c + "\" id=\"cItem\" name=\"cItem\" />" +
            "<label for=\"sname\">Sound name:</label>" +
                "<input type=\"text\" name=\"sname\" id=\"sname\" />" +
                "<label for=\"svolume\">Volume:</label>" +
                "<input type=\"range\" name=\"svolume\" id=\"svolume\" value=\"50\" min=\"0\" max=\"100\"  />" +
                "<label for=\"sinterval\" class=\"select\">Interval:</label>" +
                "<select name=\"sinterval\" id=\"sinterval\">";
            
                for (key in soundIntervals) {
                    markup += "<option value=\"" + soundIntervals[key] + "\">" + key + "</option>";
                }
            
            markup += "</select></div><button type=\"submit\" value=\"plant\">submit</button></form>";
        }
        
        if (url.hash.search("prune") != -1) {
            // similar to above
        }
        
        $content.html( markup );

        $page.page();
        
        options.dataUrl = url.href;
        $.mobile.changePage( $page, options );
        
        $('#plantForm').submit(function() {
                               var c = $('#cItem').val();
                               console.log("planting soundID: " + librarySounds[c].soundID);
                                $.get(PlantSoundURL,{
                                    soundID:librarySounds[c].soundID,
                                    soundOwner:myUsername,
                                    soundName:$('#sname').val(),
                                    soundFileName:librarySounds[c].soundFileName, 
                                    soundFileURI:librarySounds[c].soundFileURI,
                                    soundLat:lat,
                                    soundLon:lon,
                                    soundVolume:$('#svolume').val(),
                                    soundInterval:$('#sinterval').val(),
                                    }, function(data) {
                                        console.log(data);
                                        if(data.success) {
                                            console.log("plant successful - soundID: "+data.soundID);
                                            $.mobile.changePage( "#mainPage", { transition: "slide", reverse: true } );
                                        } else {
                                            $.mobile.changePage( "#mainPage", { transition: "slide", reverse: true } );
                                        }
                                     },'json');
                               
                               return false;
                               });

    }

    function createMessagePage(url, options) {
        
        var $page = $( "#messagePage" );
        
        if (url.hash.search("view") != -1) {
            
            var t = url.hash.split("=");
            var c = t[1]; // id of current message
             
            // Get the header for the page.
            var $header = $page.children( ":jqmData(role=header)" );
            
            // Get the content area element for the page.
            var $content = $page.children( ":jqmData(role=content)" );
            
            // The markup we are going to inject into the content
            // area of the page.
            var markup =
            "<p>From: " + messages[c].soundPruner + "</p>" +
            "<p>Message: " + messages[c].messageBody + "</p>";
            
            // Find the h1 element in our header and inject the name of
            // the category into it.
            $header.find( "h1" ).html( "re:"+ messages[c].soundName);
            
            // Inject the category items markup into the content element.
            $content.html( markup );

        }
        $page.page();
        options.dataUrl = url.href;
        $.mobile.changePage( $page, options );
    }

    // INITIALIZE GARDEN

    function initGarden() {
        startLocationService();
        $('#prompt').html('Getting sounds....');
        $.get(GetSoundsURL, {gardenID:1}, function(data){
              if (data.success) {
              gardenSounds = data.gardenSounds;
              librarySounds = data.librarySounds;
              $.mobile.changePage( "#mainPage", { transition: "slide"} );
              } else {
              alert("Failed to load sounds!");
              }
              },'json');
    }

    // LOCATION

    function startLocationService() {
        navigator.geolocation.watchPosition(function(position){
                                                    currentPosition = position;
                                                    lat = position.coords.latitude;
                                                    lon = position.coords.longitude;
                                                    console.log(position);
                                                 }, function(error) {
                                                    console.log("code: " + error.code + "\n" + "message: " + error.message + "\n");
                                                 }, { frequency: 3000, enableHighAccuracy: true });
    }

    //  DATABASE FUNCTIONS

    function getMessages(username) {
        $.get(GetMessagesURL, {username:username}, function(data){
            if (data.success) {
                return data.messages;  
            } else {
                alert("Failed to load messages!");
                return false;
            }
        });
    }

}
/*
function sendMessage(sender, receiver, message, soundID) {
$.get(SendMessageURL, {sender:sender,receiver:receiver,message:message,soundID:soundID}, function(data){
if (data.success) {
return true;
} else {
alert("Failed to send message!");
return false;
}
});
}

function getGardenSounds() {
$.get(GetSoundsURL, {gardenID:1}, function(data){
if (data.success) {
return data.sounds;
} else {
alert("Failed to load sounds!");
return false;
}
});
}

function plantSound(sound){
$.get(PlantSoundURL, {sound:sound}, function(data) {
if (data.success) {
return true;
} else {
alert("Failed to plant sound!");
return false;
}
});
}	

function pruneSound(sound){
$.get(PlantSoundURL, {sound:sound}, function(data) {
if (data.success) {
return true;
} else {
alert("Failed to prune sound!");
return false;
}
});
}

//  LOCATION AND DISTANCE FUNCTIONS

/*
'Latitude: '          + position.coords.latitude    
'Longitude: '         + position.coords.longitude        
'Altitude: '          + position.coords.altitude          
'Accuracy: '          + position.coords.accuracy          
'Altitude Accuracy: ' + position.coords.altitudeAccuracy  
'Heading: '           + position.coords.heading           
'Speed: '             + position.coords.speed           
'Timestamp: '         + new Date(position.timestamp)      
*/
/*
function getLocation() {
navigator.geolocation.getCurrentPosition( function(position){
return position;
}, function(error) {
alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
});
}

function getDistance(lat1, lat2, lon1, lon2) {
var R = 6371000; // m
var d = Math.acos(Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2) * Math.cos(lon2-lon1)) * R; 
return d;
}

//  SOUND FUNCTIONS

function updateGarden() {
var currentPosition = getLocation();
var update = updateActiveSounds(currentPosition.coords.latitude,currentPosition.coords.longitude);
if (update) {
playActiveSounds();
} else {
// error
}
}

function updateActiveSounds(lat, lon)) {
// define soundDistance for each sound
for (i=0; i<gardenSounds.length; i++) {
gardenSounds[i].soundDistance = getDistance(lat, gardenSounds[i].lat, lon, gardenSounds[i].lon);
}
// sort gardenSounds based on soundDistance
gardenSounds.sort(function (a, b) {
return (a.soundDistance - b.soundDistance);
      });

// determine which sounds are currently active and in range  

for (i=0; i<activeSounds.length; i++) {
activeSounds[i].isActive = false;
gardenSounds[i].isActive = false;
}    
for (i=0; i<maxSounds.length; i++) {
for (j=0; j<maxSounds.length; j++) {
if (activeSounds[i] == gardenSounds[j]) {
// sound is within range and currently active
activeSounds[i].isActive = true;
gardenSounds[j].isActive = true;
break;
}
}
}

// update active sounds that have changed

for (i=0; i<activeSounds.length; i++) {
if (activeSounds[i].isActive != true) {
// unload previous sound that is now out of range
PGLowLatencyAudio.unload(activeSounds[i].soundName);
// now find the next closest sound to make active
for (j=0; j<gardenSounds.length; j++) {
if (gardenSounds[j].isActive != true) {
    activeSounds[i] = gardenSounds[j];
    // preloadAudio: function ( id, assetPath, voices, success, fail) {
    PGLowLatencyAudio.preloadAudio(activeSounds[i].soundName, LocalSoundDirectory+activeSounds[i].soundFileName, 1);
    gardenSounds[j].isActive = true;
    activeSounds[i].isActive = true;
    break;
}
}
} else {
// adjust sound volume of existing active sound based on distance (Android only)
}
}
return true;
}

function playActiveSounds() {
for (i=0; i<activeSounds.length; i++) {
switch (sound.soundInterval) {
case 0 :
PGLowLatencyAudio.loop(sound.soundName);
break;
case -1 :
PGLowLatencyAudio.play(activeSounds[i].soundName);
break;
default :
PGLowLatencyAudio.play(activeSounds[i].soundName);
activeSounds[i].myInterval = setInterval(function () {
                                         PGLowLatencyAudio.play(this.soundName)
                                         });
break;
}                                   
}

function stopActiveSounds() {
for (i=0; i<activeSounds.length; i++) {
if (activeSounds[i].myInterval) {
clearInterval(activeSounds[i].myInterval);
}
PGLowLatencyAudio.stop(activeSounds[i].soundName);
}
}
*/