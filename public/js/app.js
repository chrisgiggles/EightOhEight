(function($, window) {
    'use strict';

    soundManager.setup({
        url:                    "/swf/",            // Flash fallback folder
        flashVersion:           9,                  // Flash Version...
        useFlashBlock:          false,              // If flash is blocked by browser, make swf visible
        useHighPerformance:     true,               // Keep Flash container in viewable area, better performance.
        wmode:                  "transparent",      // Overrides useHighPerformance?
        flashPollingInterval:   20,                 // 20ms polling for events in Flash
        html5PollingInterval:   20                  // 20ms polling for events in JS
    });

    //ROUTING ENGINE
    var App = function( container, sidebar ) {

        var global = {
            container: container,
            sidebar: sidebar,
            xhr: null
        };

        function render(hashString) {
            //Explode hash url
            var hash = hashString.split("/");
            var page = hash[0];

            //Map of pages
            var route = {
                //These functions make requests to a PHP file which generate templates
                '': renderIndex,
                '#track': renderSingleTrack,
                '#page': renderTrackList,
                '#artist': renderArtists,
                '#genre': renderGenres,
                '#about': renderAbout,
                '#credits': renderCredits

            };

            if(route[page]) {
                //Abort any running requests
                if (global.xhr) {
                    global.xhr.abort();
                    global.xhr = null;
                }
                window.scrollTo(0, 0); //Make sure we scroll to the top
                route[page](hash);
            }
            else {
                renderError("This URL does not exist.");
            }

            //console.log(hash);
        }

        function renderSingleTrack(hash) {
            var requestValue = hash[1];

            if(hash[1]) {
                global.sidebar.find(".active").removeClass('active');

                global.xhr = $.get("../inc/request_singletrack.php", "track_id=" + requestValue, function(data) {
                    if(!data) {
                        renderError("This track does not exist.");
                        renderIndex();
                    }
                    else {
                        global.container.html(data);
                    }
                });
            }
            else {
                renderError("This track does not exist.");
                renderIndex();
            }
        }

        function renderTrackList(hash) {
            var requestValue = hash[1];
            if(hash[1]) {
                global.sidebar.find(".active").removeClass('active');
                global.sidebar.find('a[data-page="all"]').addClass("active");

                global.xhr = $.get("../inc/request_tracklist.php", "page=" + requestValue, function(data) {
                    if(!data) {
                        renderError("This page does not exist.");
                        renderIndex();
                    }
                    else {
                        global.container.html(data);
                    }
                });
            }
            else {
                renderIndex();
            }
        }

        function renderAbout() {
            global.sidebar.find(".active").removeClass('active');
            global.sidebar.find('a[data-page="about"]').addClass("active");

            global.xhr = $.get("../inc/request_about.php", "", function(data) {
                if(!data) {
                    renderError("Something went wrong.");

                }
                else {
                    global.container.html(data);
                }
            });
        }

        function renderArtists() {
            global.sidebar.find(".active").removeClass('active');
            global.sidebar.find('a[data-page="artist"]').addClass("active");

            global.xhr = $.get("../inc/request_about.php", "", function(data) {
                if(!data) {
                    renderError("Something went wrong.");

                }
                else {
                    global.container.html(data);
                }
            });
        }

        function renderGenres() {
            global.sidebar.find(".active").removeClass('active');
            global.sidebar.find('a[data-page="genre"]').addClass("active");

            global.xhr = $.get("../inc/request_about.php", "", function(data) {
                if(!data) {
                    renderError("Something went wrong.");

                }
                else {
                    global.container.html(data);
                }
            });
        }

        function renderCredits() {
            global.sidebar.find(".active").removeClass('active');
            global.sidebar.find('a[data-page="credits"]').addClass("active");

            global.xhr = $.get("../inc/request_about.php", "", function(data) {
                if(!data) {
                    renderError("Something went wrong.");

                }
                else {
                    global.container.html(data);
                }
            });
        }

        function renderIndex() {
            renderTrackList(['page', 1]);
        }

        function renderError(string) {
            alert(string); //For now
        }

        return {
            render: render
        };
    };

    //PLAYER
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
            if ( !id ) {
                return;
            }
            else if ( id === global.currentTrackId ) {
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

    //Expose App to global scope
    window.App = App;
    window.Player = Player;

})(jQuery, window);

var Main = (function() {
    'use strict';

    function appEvents() {
        //Start App
        var app = new App( $("#main"), $("#sidebar") );

        $(window).on('hashchange', function() {
            app.render(window.location.hash);
        });
    }

    function playerEvents() {
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
    }

    function loader() {

        var $main = $("#main");
        var $modal = $(".modal");

        $(document).on({
            ajaxStart: function() {
                $modal.show();
                $main.addClass("loading");
            },
            ajaxStop: function() {
                $modal.fadeOut('fast');
                $main.removeClass("loading");
            }
        });
    }

    function init() {
        appEvents();
        soundManager.onready(function() {
            playerEvents();
        });
        loader();
        $(window).trigger('hashchange'); //Needs to be manually triggered on first page load
    }

    return {
        init: init
    };
})();

Main.init();
