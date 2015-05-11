//<a href="#" id="facebookShareLink">share</a>
$("#facebookShareLink").on("click",function(){
    var newwindow = window.open("http://www.facebook.com/sharer.php?s=100" + "&p[url]=" + encodeURIComponent('http://www.soundcloud.com'), 'pop', 'width=600, height=400, scrollbars=no');
    if (window.focus) {newwindow.focus()}
    return false;
});

//TODO: Implement
