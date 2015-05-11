
(function( $, window ) {
    "use strict";

    var Player = function( playerControls, trackContainer ) {
        var global = {
            currentTrackId: "",
            currentTrackName: "<span><strong>EightOhEight Player</strong></span>",
            volume: 100,
            duration: "0:00",
        };

        var dom = {
            playerControls:         playerControls,
            togglePlaybackButton:   playerControls.find("#toggle-playback"),
            progressSlider:         playerControls.find("#progress-slider"),
            songTitle:              playerControls.find(".player-songtitle"),
            playerPosition:         playerControls.find("#player-position"),
            playerDuration:         playerControls.find("#player-duration"),
        };

        function createSound( id, url ) {
            return soundManager.createSound({
                id: id,
                url: url,

                //Functions that update on SoundManager events

                whileplaying: function() {
                    //Update progress-bar width from 0 - 100%. Ex: (200 / 1000) * 100 = 20%
                    var playPosition = ( Math.floor(this.position) / Math.floor(this.durationEstimate) * 100).toFixed(2);
                    dom.progressSlider.slider( "option", { value: playPosition } );

                    //Update player time position
                    dom.playerPosition.html( parseTime( this.position ) );
                },
                whileloading: function() {
                    //Is there something wrong with the code or is SoundCloud CDN too fast?
                    //Update loading class on #progress-slider
                    if(this.bytesLoaded < this.bytesTotal) {
                        console.log("LOADING");
                        dom.progressSlider.addClass( "loading" );
                    }
                    else {
                        console.log("FINISHED LOADING");
                        dom.progressSlider.removeClass( "loading" );
                    }
                },
                onplay: function() {
                    global.currentTrackId = soundManager.soundIDs[0]; //Set global id, more semantic
                    dom.togglePlaybackButton.addClass("playing");
                    dom.playerControls.attr("data-loaded", this.id);

                    dom.playerDuration.html( global.duration );
                },
                onresume: function() {
                    dom.togglePlaybackButton.addClass("playing");
                },
                onpause: function() {
                    dom.togglePlaybackButton.removeClass("playing");
                },
                onstop: function() {
                    dom.togglePlaybackButton.removeClass("playing");
                    dom.progressSlider.slider("option", "value", 0);
                    dom.progressSlider.removeClass( "loading" );
                },
                onfinish: function() {
                    dom.togglePlaybackButton.removeClass("playing");
                    dom.progressSlider.slider("option", "value", 0);
                    //nextTrack();
                    dom.playerPosition.html( "0:00" );
                }
            });
        }

        //Functions for page player implementation

        function togglePlayback( id ) {
            //Check if trackID was passed in - otherwise assign from global
            id = id || global.currentTrackId;

            //Toggle or play
            if ( id === global.currentTrackId ) {
                soundManager.getSoundById( id ).togglePause();
            }
            else {
                soundManager.destroySound(global.currentTrackId); //Free up memory? Don't know how much it matters
                soundManager.setVolume( id, global.volume ).play(); //SM's setVolume returns the sound, can be chained
            }
        }

        //Remove? Can't think of anywhere this is used
        function stopPlayback( id ) {
            soundManager.destroySound( id );
            dom.progressSlider.css( "width", 0 );
        }

        function setTrackPosition( event ) {
            var offset = event.target.getBoundingClientRect();
            var x = event.clientX - offset.left;
            var xWidth = event.target.clientWidth;
            var track = soundManager.getSoundById( soundManager.soundIDs[0] );
            track.setPosition( ( x / xWidth ) * track.duration );
        }

        function setVolume( num ) {
            global.volume = num;
            soundManager.getSoundById( global.currentTrackId ).setVolume( global.volume );
        }

        function setTrackInfo( name ) {
            //Is this too roundabout a way of setting the player info?
            name = name || global.currentTrackName;
            dom.songTitle.html( name );
        }

        function setDuration( ms ) {
            global.duration = parseTime( ms );
        }

        function parseTime( ms ) {
            var time = new Date(ms);
            var seconds = time.getSeconds() < 10 ? ""+ "0" +time.getSeconds() : time.getSeconds();
            return time.getMinutes() + ":" + seconds;
        }

        return {
            createSound:       createSound,
            togglePlayback:    togglePlayback,
            setTrackPosition:  setTrackPosition,
            setVolume:         setVolume,
            setTrackInfo:      setTrackInfo,
            setDuration:       setDuration,

            global:            global,
            dom:               dom,
        };
    };

    soundManager.setup({
        url:                    "/swf/",            // Flash fallback folder
        flashVersion:           9,                  // Flash Version...
        useFlashBlock:          false,              // If flash is blocked by browser, make swf visible
        useHighPerformance:     true,               // Keep Flash container in viewable area, better performance.
        wmode:                  "transparent",      // Overrides useHighPerformance?
        flashPollingInterval:   20,                 // 20ms polling for events in Flash
        html5PollingInterval:   20                  // 20ms polling for events in JS
    });

    soundManager.onready(function() {

        var player = new Player( $("#player") );

        $(document).ready(function() {
            player.setTrackInfo();
        });

        $(document).ajaxComplete(function() {
            //This checks if active track exists on the page and adds the active styles
            //Look for the data-id attribute
            //var current = player.dom.trackContainer.find("[data-id='" + soundManager.soundIDs[0] + "']");
            var current = $("#main").find("[data-id='" + soundManager.soundIDs[0] + "']");
            //check if obj is not empty
            if (current) {
                current.addClass("track-active");
            }

            var main = $("#main");

            //Load up a track on first page visit or reload
            if (!player.global.currentTrackId) {
                var current = main.find(".track-list-item").first().addClass("track-active");
                var track = current.find(".track-play");
                console.log(track);
                player.setTrackInfo( track.data("info") );
                player.setDuration( track.data("duration") );
                player.createSound( track.data("id"), track.data("streamurl") );
                player.togglePlayback( track.data("id") );
                player.togglePlayback( track.data("id") ); //Pause it, stupid hack
            }
        });

        $("body").on( "click", ".track-play", function(e) {
            e.preventDefault();

            var self = $(this);
            var parent = self.parents(".track-list-item");

            //Put this in togglePlay fn() ? or gui actions belong in here?
            //player.dom.trackContainer.find(".track-active").removeClass("track-active");
            $("#main").find(".track-active").removeClass("track-active");
            parent.addClass("track-active");

            //Update song title info in player control bar
            player.setTrackInfo( self.data("info") );
            player.setDuration( self.data("duration") );

            player.createSound( self.data("id"), self.data("streamurl") );
            player.togglePlayback( self.data("id") );
        });

        var mute = false;

        $("#player").on( "click", ".player-mute", function(e) {
            e.preventDefault();
            var self = $(this);
            if (mute === false) {
                player.setVolume(0);
                self.addClass("muted");
                mute = true;
            }
            else {
                player.setVolume( $("#volume-slider").slider("value") );
                self.removeClass("muted");
                mute = false;
            }
        });

        $("#player").on( "click", "#toggle-playback", function(e) {
            e.preventDefault();
            player.togglePlayback( $("#player").attr("data-loaded") );
        });

        $("#volume-slider").slider({
            max: 100,
            value: 100,
            range: "min",
            animate: false,
            orientation: "vertical",
            change: function(e, ui) {
                //Update icon
                var volIcon = $(".player-mute");

                if (ui.value > 70) {
                    volIcon.addClass("volume-high")
                        .removeClass("volume-medium volume-low muted");
                }
                else if (ui.value > 35) {
                    volIcon.addClass("volume-medium")
                        .removeClass("volume-high volume-low muted");
                }
                else if (ui.value > 1) {
                    volIcon.addClass("volume-low")
                        .removeClass("volume-medium volume-high muted");
                }
                else {
                    volIcon.addClass("muted")
                        .removeClass("volume-high volume-medium volume-low");
                }

                //set volume
                player.setVolume( ui.value ); // Volume Control
            }
        });

        $("#progress-slider").slider({
            max: 100,
            range: "min",
            animate: false,
            value: 0,
            orientation: "horizontal",
            step: 0.1,
            slide: function(e, ui) {
                player.setTrackPosition(e);
            },
        });
    });

})(jQuery, window);



    /*var Player;

    Player = function( playerControls, trackContainer ){

        var dom = {
            container:          playerControls,
            progressSlider:     playerControls.find( "#progress-slider" ),
            toggleButton:       playerControls.find( "#toggle-playback" ),
            nextButton:         playerControls.find( "#next-track" ),
            prevButton:         playerControls.find( "#prev-track" ),
            stopButton:         playerControls.find( "#stop-playback" ),

            trackContainer:     trackContainer
        };

        var global = {
            volume:                 80,         //Default volume;
            currentlyPlaying:       ""
        };

        //Get tracks
        $.getJSON(url, function( playlist ) {
            //Loop through response object
            for (var i = 0; i < playlist.tracks.length - 1 ; i++) {

                var trackURL = playlist.tracks[i].stream_url;

                //Create the sounds from the playlist
                soundManager.createSound({
                    id:  "id_" + playlist.tracks[i].id,
                    url: trackURL + "?consumer_key=05d66aec9a9be76d0f0c1927b6ad7dff",

                    whileplaying: function() {
                        //Update progress-bar width from 0 - 100%. Ex: (200 / 1000) * 100 = 20%
                        var playPosition = ( Math.floor(this.position) / Math.floor(this.durationEstimate) * 100).toFixed(2);
                        dom.progressSlider.slider( "option", { value: playPosition } );
                    },

                    whileloading: function() {
                        //Update loading class on #progress-slider
                        if(this.bytesLoaded < this.bytesTotal) {
                            dom.progressSlider.addClass( "loading" );
                        }
                        else {
                            dom.progressSlider.removeClass( "loading" );
                        }
                    },

                    onplay: function() {
                        //Added a property to soundManager class.
                        //not good but only reliable way for some weird reason to store the id
                        global.currentlyPlaying = this.id;

                        //Add which track id the loaded data property has to player controls
                        dom.container.attr("data-loaded", this.id);

                        //
                        dom.toggleButton.addClass("playing").html("Pause");
                        //Add playing class to the player view (handle playing class for tracks separately in event handlers)
                    },

                    onpause: function() {
                        dom.toggleButton.removeClass("playing").html("Play");
                    },
                    onresume: function() {
                        dom.toggleButton.addClass("playing").html("Pause");
                    },
                    onstop: function() {
                        dom.toggleButton.removeClass("playing").html("Play");
                        dom.progressSlider.slider("option", "value", 0);
                        dom.progressSlider.removeClass( "loading" );
                    },
                    onfinish: function() {
                        dom.toggleButton.removeClass("playing").html("Play");
                        dom.progressSlider.slider("option", "value", 0);
                        nextTrack();
                    }

                });

                //Build the DOM representation, do it in another loop or leverage that this loop is already running?

                //Create container
                var $main = $( "main" );
                var $trackContainer = $( "<div></div>" )
                    .addClass( "track-container" );
                //Create link
                var trackLink = $( "<a></a>" )
                    .addClass( "track-link" )
                    .attr( "href", "#" )
                    .attr( "data-id", "id_" + playlist.tracks[i].id )
                    .html( playlist.tracks[i].title );

                $trackContainer.append( trackLink );

                //Create image
                var trackImg = $("<img>")
                    .attr( "src", playlist.tracks[i].artwork_url.replace( "large", "t500x500" ));

                $trackContainer.prepend( trackImg );

                //Append to the body
                $main.append( $trackContainer );

                // /Load up the first track in document as default
                // This happens too many times... refactor entire request to deferred
                global.currentlyPlaying = $(".track-container:first").find("a").data("id");

            }

        });

        function togglePlayback( trackID ) {
            //Check if trackID was passed in - otherwise check global
            trackID = trackID || global.currentlyPlaying;

            //Toggle or play
            if ( trackID === global.currentlyPlaying ) {
                soundManager.getSoundById( trackID).togglePause();
            }
            else {
                soundManager.stopAll();
                soundManager.setVolume( trackID, global.volume ).play(); //setVolume returns the sound, can be chained
            }
        }

        function nextTrack() {
            //Find active track-container
            var currTrk = trackContainer.find(".track-active");
            var nextTrk = currTrk.next();

            //Check if last dom element in trackContainer
            if ( trackContainer.children().last().hasClass("track-active") ) {
                console.log("This is the last track");
            } else {
                togglePlayback( nextTrk.find("a").data("id") );

                currTrk.removeClass("track-active");
                nextTrk.addClass("track-active");
            }
        }

        function prevTrack() {
            //Find active track-container
            var currTrk = trackContainer.find(".track-active");
            var prevTrk = currTrk.prev();

            //Check if there is a previous dom element in trackContainer
            if( trackContainer.children().first().hasClass("track-active") ) {
                console.log("This is the first track");
            }
            else {
                player.togglePlayback( prevTrk.find("a").data("id") );

                currTrk.removeClass("track-active");
                prevTrk.addClass("track-active");
            }
        }

        function stopPlayback( ) {
            soundManager.stopAll();

            dom.progressBar.css( "width", 0 );
        }

        function setTrackPosition( event ) {
            var x = event.clientX;
            var xWidth = event.target.clientWidth;
            var track = soundManager.getSoundById( global.currentlyPlaying );
            track.setPosition( ( x / xWidth ) * track.duration );
        }

        function setGlobalVolume( num ) {
            global.volume = num;
            soundManager.getSoundById( global.currentlyPlaying ).setVolume( global.volume );
        }

        return {
            playerControls:     playerControls,
            trackContainer:     trackContainer,

            setTrackPosition:   setTrackPosition,
            togglePlayback:     togglePlayback,
            nextTrack:          nextTrack,
            prevTrack:          prevTrack,
            stopPlayback:       stopPlayback,
            setGlobalVolume:    setGlobalVolume,
            sounds:             soundManager.sounds
        };
    };
    //Expose to global
    window.SCPlayer = Player;
})(jQuery, window);

//Wrap in object later, extract event handlers


soundManager.onready(function() {

    //GUI ACTIONS

    var player = new SCPlayer( $("#player-controls"), $("main-container") );

    player.playerControls.on( "click", "#toggle-playback", function(e) {
        e.preventDefault();
        player.togglePlayback( $("#player-controls").attr("data-loaded") );
    });

    $("body").on( "click", ".track-link", function(e) {
        e.preventDefault();

        var self = $(this);
        var parent = self.parent();


        //Put this in togglePlay fn()
        player.trackContainer.find(".track-active").removeClass("track-active")
        parent.addClass("track-active");

        player.togglePlayback( self.data("id") );
    });

    player.playerControls.on("click", "#next-track", function(e) {
        e.preventDefault();
        player.nextTrack();
    });

    //player.playerControls.on("click", "#prev-track", function(e) {
    //    e.preventDefault();
    //    player.prevTrack();
    //});
    //
    //player.playerControls.on( "click", "#stop-playback", function(e) {
    //    e.preventDefault();
    //    player.stopPlayback();
    //});

    //$("#volume-slider").slider({
    //    max: 100,
    //    value: 80,
    //    range: "min",
    //    animate: true,
    //    orientation: "horizontal",
    //    change: function(e, ui) {
    //        player.setGlobalVolume( ui.value ); // Volume Control
    //    }
    //});
    //
    //$("#progress-slider").slider({
    //    max: 100,
    //    range: "min",
    //    animate: true,
    //    orientation: "horizontal",
    //    step: 0.1,
    //    slide: function(e, ui) {
    //        player.setTrackPosition(e);
    //    },
    //});

    //in global, for now
    window.player = player;
});
*/
