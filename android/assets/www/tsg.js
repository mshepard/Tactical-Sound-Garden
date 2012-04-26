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
    var activeSounds = new Object();
    var messages = new Array();
    
    var previewSound = null;
    
    var maxSounds = 3;

    var soundCutoffDistance = 100;
    
    var soundIntervals = { "loop":0,"once only":-1,"every 10 seconds":10000,"every 30 seconds":30000,"every minute":60000,"every 5 minutes":300000,"every 30 minutes":1800000,"every hour":3600000 };
                          
    var currentPosition; //= new Object();
    var lat = 37.42200;
    var lon = -122.084095;
    var position = {coords: {latitude: lat, longitude: lon}};
    
    var gardenIsActive = false;

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
    					 stopActiveSounds();
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
              
                    var newMessages = data.messages;
                    for (var i=0; i<newMessages.length; i++) {
                        messages.push(newMessages[i]);
                    }
                    // Get the content area element for the page.
              
                    var $content = $page.children( ":jqmData(role=content)" );
                    
                    var markup = "";
                    
                    /*
                    if (newMessages.length == 0) {
                        $content.find("p").html("You have no new messages.");
                    } else if (newMessages.length == 1) {
                        $content.find("p").html("You have 1 new message.");
                    } else {
                        $content.find("p").html("You have "+newMessages.length+" new messages.");
                    }
                    */
                    
                    if (newMessages.length == 0) {
                        markup += "<p>You have no new messages.</p>";
                    } else if (newMessages.length == 1) {
                        markup += "<p>You have 1 new message.</p>";
                    } else {
                        markup += "<p>You have "+newMessages.length+" new messages.";
                    }
                    
                    markup += "<ul data-role='listview'>" +
                        "<li><a href=\"#menuPage?action=plant\">Plant a Sound</a></li>" +
                        "<li><a href=\"#menuPage?action=prune\">Prune a Sound</a></li>" +
                        "<li><a href=\"#menuPage?action=messages\">View Messages<span class=\"ui-li-count\">" + messages.length + "</span></a>";
                    
                    $content.html( markup );
                    
                    $page.page();
                    
                    $content.find( ":jqmData(role=listview)" ).listview();
                                    
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
                var item = "item"+i;
                markup += "<li><a id=\"" + item + "\" href=\"#\">" + librarySounds[i].soundName + "</a><a href=\"#paramsPage?plant="+i+"\"></a></li>";
            }
            markup += "</ul>";
            $header.find( "h1" ).html( "Plant a Sound" );
            
        } else if (url.hash.search("prune") != -1) {
            for (var lable in activeSounds) {
                markup += "<li><a id=\"" + lable + "\" href=\"#\">" + activeSounds[lable].soundName + "</a><a href=\"#paramsPage?prune="+lable+"\"></a></li>";
            }
            markup += "</ul>";
            $header.find( "h1" ).html( "Prune a Sound" );
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
        
        if (url.hash.search("plant") != -1) {
            for (var i=0; i<librarySounds.length; i++) {
                var soundItem = "#item" + i;
                var mySoundFileURI = librarySounds[i].soundFileURI;
                console.log("Binding click to " + mySoundFileURI);
                $( soundItem ).bind( "click" , { URI:mySoundFileURI }, playSound);
            }
        } else if (url.hash.search("prune") != -1) {
            for (var lable in activeSounds) {
                var soundItem = "#" + lable;
                var mySoundFileURI = activeSounds[lable].soundFileURI;
                console.log("Binding click for " + soundItem);
                $( soundItem ).bind( "click" , { URI:mySoundFileURI }, playSound);
            }
        }
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
            
            markup += "</select><button type=\"submit\" value=\"plant\">submit</button></form>";
            
        } else if (url.hash.search("prune") != -1) {
            
            var t = url.hash.split("=");
            var lable = t[1]; // soundLable of current sound
            console.log("soundLable: " + lable);
            console.log("Pruning " + activeSounds[lable].soundName);
            $header.find( "h1" ).html( "Pruning " + activeSounds[lable].soundName );
            
            var markup = "<form method=\"get\" action=\"#\" id=\"pruneForm\">" +
            "<input type=\"hidden\" value=\"" + lable + "\" id=\"cItem\" name=\"cItem\" />" +
            "<label for=\"sname\">Sound name:</label>" +
                "<input type=\"text\" name=\"sname\" id=\"sname\" value=\"" + activeSounds[lable].soundName + "\" />" +
                "<label for=\"svolume\">Volume:</label>" +
                "<input type=\"range\" name=\"svolume\" id=\"svolume\" value=\"" + activeSounds[lable].soundVolume + "\" min=\"0\" max=\"100\"  />" +
                "<label for=\"sinterval\" class=\"select\">Interval:</label>" +
                "<select name=\"sinterval\" id=\"sinterval\">";
            
                for (key in soundIntervals) {
                    if (soundIntervals[key] == activeSounds[lable].soundInterval) {
                        markup += "<option value=\"" + soundIntervals[key] + "\" selected=\"selected\" \">" + key + "</option>";
                    } else {
                        markup += "<option value=\"" + soundIntervals[key] + "\">" + key + "</option>";
                    }
                }
            
            markup += "</select>"+
                        "<label for=\"message\">Message:</label>"+
                        "<textarea name=\"messageBody\" id=\"messageBody\"></textarea>"+
                        "<button type=\"submit\" value=\"prune\">submit</button></form>";
        }
        
        $content.html( markup );
        $page.page();
        $content.find( "input[type='range']" ).slider();  
        $content.find( "input[type='text']" ).textinput();
        $content.find( "select" ).selectmenu();
        $content.find( "[type='submit']" ).button(); 
        
        options.dataUrl = url.href;
        $.mobile.changePage( $page, options );
        
        if (url.hash.search("plant") != -1) {
            $('#plantForm').submit(function() {
                               var c = $('#cItem').val();
                               console.log("planting " + $('#sname').val() + ", soundID: " + librarySounds[c].soundID);
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
                                            console.log("plant successful - instanceID: "+data.instanceID);
                                            getGardenSounds();
                                            $.mobile.changePage( "#mainPage", { transition: "slide", reverse: true } );
                                        } else {
                                            console.log("planting failed");
                                            $.mobile.changePage( "#mainPage", { transition: "slide", reverse: true } );
                                        }
                                     },'json');
                               
                               return false;
                               });
        } else if (url.hash.search("prune") != -1) {
            $('#pruneForm').submit(function() {
                               var lable = $('#cItem').val();
                               console.log("lable: " + lable);
                               console.log("pruning instanceID: " + activeSounds[lable].instanceID);
                                $.get(PruneSoundURL,{
                                    instanceID:activeSounds[lable].instanceID,
                                    soundID:activeSounds[lable].soundID,
                                    soundName:$('#sname').val(),
                                    soundOwner:activeSounds[lable].soundOwner,
                                    soundPruner:myUsername,
                                    soundVolume:$('#svolume').val(),
                                    soundInterval:$('#sinterval').val(),
                                    messageBody:$('#messageBody').val()
                                    }, function(data) {
                                        console.log(data);
                                        if(data.success) {
                                            console.log("prune successful - instanceID: "+data.instanceID);
                                            var sound = activeSounds[lable];
                                            if(sound.myInterval) {
                                                console.log('-> clearing interval for '+ lable);
                                                clearInterval(sound.myInterval);
                                            }
                                            console.log('-> deleting '+ lable);
                                            delete activeSounds[lable];
                                            PGLowLatencyAudio.stop('instance'+sound.instanceID);
   	    	                                PGLowLatencyAudio.unload('instance'+sound.instanceID);
                                            getGardenSounds();
                                            $.mobile.changePage( "#mainPage", { transition: "slide", reverse: true } );
                                        } else {
                                            console.log("pruning failed");
                                            $.mobile.changePage( "#mainPage", { transition: "slide", reverse: true } );
                                        }
                                     },'json');
                               
                               return false;
                               });
        }

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
        /*      	
              mockupLocationService(lat,lon);
              setTimeout(function() {console.log('#############################');mockupLocationService(lat,lon+0.0006);},50000);
              setTimeout(function() {console.log('#############################');mockupLocationService(lat,lon+0.001);},70000);
              setTimeout(function() {console.log('#############################');mockupLocationService(lat,lon+0.002);},90000);
              //console.log('############################# done');
              setTimeout(function() {stopActiveSounds();}, 180000);
        */
        getGardenSounds();
        $.mobile.changePage( "#mainPage", { transition: "slide" } );    
    }
    
    function getGardenSounds() {
        $('#prompt').html('Getting sounds....');
        $.get(GetSoundsURL, {gardenID:1}, function(data){
              if (data.success) {
                gardenSounds = data.gardenSounds;
                librarySounds = data.librarySounds;        
                startSoundGarden(position);
              } else {
                console.log("!!!Failed to load sounds!!!");
              }
              },'json');
    }

    // LOCATION

    function startLocationService() {
        navigator.geolocation.watchPosition(handleLocation, function(error) {
                                                    console.log("code: " + error.code + "\n" + "message: " + error.message + "\n");
                                                }, { frequency: 3000, enableHighAccuracy: true });
    }
    
    function mockupLocationService(lat, lon) {
    	var position = {coords: {latitude: lat, longitude: lon}};
    	handleLocation(position);
    }
    
    function handleLocation(position) {
    	
 		  currentPosition = position;
          lat = position.coords.latitude;
          lon = position.coords.longitude;
 
          console.log(lat+' '+lon);
          gardenIsActive = false;
          startSoundGarden(position);

    }
 
    /*
     *  iterates over sounds in sound gardern. If it is not loaded, loads it first and then plays it
     *  if it is already loaded or being played, just sets the volume etc.
     */
    
    function startSoundGarden(position) {
        
        if(gardenSounds!=null && gardenSounds.length>0) {
            for(var i =0;i<gardenSounds.length;i++) {
                var sound = gardenSounds[i];
                sound.distance = calculateDistance(lat, lon, sound.soundLat, sound.soundLon,"K");
            }
            gardenSounds.sort(sortfunction);
            for (var i=0; i<gardenSounds.length; i++) {
            	console.log(gardenSounds[i].soundName + ", distance = " + gardenSounds[i].distance);
            }
            
            for (var i=0; i<gardenSounds.length; i++) {
        
                var sound = gardenSounds[i];
                var soundLable = 'instance'+sound.instanceID;
                
      		  	if(sound.distance<soundCutoffDistance) { // 
       		  		console.log("* " + soundLable+" is IN RANGE and is a new sound? "+(activeSounds[soundLable]==null));
      		  		if(activeSounds[soundLable]==null ) {  // sound is not loaded
                        console.log("-> LOADING " + sound.soundFileURI);
                        PGLowLatencyAudio.preloadAudio(soundLable, "http://"+sound.soundFileURI,3,
	        		  				activeSoundLoaded(soundLable,sound,sound.distance)
	        			  	, function() {console.log("!!! LOADING FAILED ");});
      		  		}
      		  		else { // sound is already loaded 
      		  				// either the interval is set or sound is already playing... nothing to do?!
      		  				// except setting the volume 
                        var volume = (soundCutoffDistance-sound.distance)/soundCutoffDistance;
      		    		console.log("-> Setting new volume for " + soundLable + " to " + volume);
      		    		PGLowLatencyAudio.changeVolume(soundLable,volume);
      		  		}
                    
      		  	} else {  // sound is not active
       		  		console.log(soundLable + " is OUT OF RANGE and is not in activeSounds? "+ (activeSounds[soundLable]==null));
      		  		if(activeSounds[soundLable]==null) {  // sound is not loaded
       		  			console.log(soundLable+" is OUT OF RANGE and not loaded or soundlable is null");
      		  		} else { // sound is already loaded (needs to be cleared)
      		  			console.log("-> REMOVING "+soundLable+" FROM activeSounds");
      		  			clearInterval(activeSounds[soundLable].myInterval);
      		  			delete activeSounds[soundLable];
      		  			PGLowLatencyAudio.unload(soundLable);
      		  		}
      		  	}
      	    }
        }
    }

    var activeSoundLoaded = function(soundLable,sound,distance) {
    	return function(status) {

    		var volume = (100-distance)/100;

    		var count = 0;
            
	  		activeSounds[soundLable] = sound;
	  		var volume = (soundCutoffDistance-distance)/soundCutoffDistance;

            console.log("-> Added "+ soundLable + ": " + sound.soundName + " to activeSounds");
            console.log("-> Setting volume for " + soundLable + " to " + volume);
            
    		PGLowLatencyAudio.changeVolume(soundLable,volume);

            console.log("-> Setting interval to " + sound.soundInterval);
            
    		switch (sound.soundInterval) {
    		case '0' :
    			console.log("soundInterval: loop");
    			PGLowLatencyAudio.loop(soundLable);
    			break;
    		case '-1' :
    			console.log("soundInterval: play once");
    			PGLowLatencyAudio.play(soundLable);
    			break;
    		default :
    			var interval = !isNaN(sound.soundInterval) ? sound.soundInterval : 6000;
                console.log("soundInterval: "+ interval);
    			sound.myInterval = setInterval(function() {
    					PGLowLatencyAudio.play(soundLable); 
    					},interval);
    			break;
    		} 
    	};
    };
    
    function playSound(event) {
        console.log("-> Playing " + event.data.URI);
        if (previewSound != null) {
            PGLowLatencyAudio.stop(previewSound);
            PGLowLatencyAudio.unload(previewSound);
        }
        previewSound = "previewSound";
        console.log("-> Set previewSound to " + previewSound);
  		PGLowLatencyAudio.preloadAudio(previewSound, "http://"+event.data.URI,1
	  	, function() {PGLowLatencyAudio.play(previewSound);}
	  	, function() {console.log('loading failed ');});
    	
    }
    
    function stopSound(sound) {
    	PGLowLatencyAudio.stop(previewSound);
    	PGLowLatencyAudio.unload(previewSound);
        delete previewSound;
    }
    
    function stopActiveSounds() {
       	
    	console.log("-> STOP ALL SOUNDS");
    	for(var lable in activeSounds) {
    		var sound = activeSounds[lable];
    		if(sound.myInterval) {
    			console.log('clearing interval for '+ lable);
    			clearInterval(sound.myInterval);
    		}
    		delete activeSounds[lable];
   	    	PGLowLatencyAudio.stop('instance'+sound.instanceID);
   	    	PGLowLatencyAudio.unload('instance'+sound.instanceID);
    	}
  
    }
    
    function calculateDistance(lat1, lon1, lat2, lon2, unit)
    {
            var radlat1 = Math.PI * lat1/180
            var radlat2 = Math.PI * lat2/180
            var radlon1 = Math.PI * lon1/180
            var radlon2 = Math.PI * lon2/180
            var theta = lon1-lon2
            var radtheta = Math.PI * theta/180

            var dist = Math.sin(radlat1) *
            Math.sin(radlat2) +
            Math.cos(radlat1) *
            Math.cos(radlat2) *
            Math.cos(radtheta);

            dist = Math.acos(dist)
            dist = dist * 180/Math.PI
            dist = dist * 60 * 1.1515
            if (unit=="K") { dist = dist * 1.609344 }
            if (unit=="N") { dist = dist * 0.8684 }
            return dist*1000;
    }
     
    function sortfunction(a, b){
        return (a - b) //causes an array to be sorted numerically and ascending
    }

}
