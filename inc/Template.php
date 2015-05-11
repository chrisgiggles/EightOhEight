<?php

include_once("db_connect.php");

class Template
{
    public function singleTrack($data)
    {
        $id             = $data['id'];
        $artist         = $data['artist'];
        $title          = $data['title'];
        $date           = $data['created'];
        $description    = nl2br( $data['description'] );
        $genre          = $data['genre'];
        $posted_by      = $data['posted_by'];
        $artwork        = $data['artwork'];
        $soundcloud_url = $data['soundcloud_url'];
        $stream_url     = $data['stream_url'];
        $duration       = $data['duration'];

        $genres = explode(',', $genre);
        $genre_list = '';
        foreach($genres as $genre) {
            $genre_list .= "<li>$genre</li>";
        }

        return "<div id='track-container'>
        <div class='track-list-item single-track'>
            <div class='single-track-left'>
                <a href='#play' class='track-play track-image-container'
                data-streamurl='$stream_url'
                data-id='id_$id'
                data-info='<span><strong>$artist</strong> - $title</span>'
                data-duration='$duration'>
                    <img src='icons/track-play.svg' alt='' class='track-play-icon'>
                    <img src='$artwork' alt='$artist - $title' class='track-image'>
                </a>
                <div class='track-list-links'>
                </div>
                <div class='track-meta'>
                    <ul class='track-genre'>
                    <span>Tags</span>
                    $genre_list
                    </ul>
                    <ul>
                        <li><a href='$soundcloud_url'><img src='icons/soundcloud.svg'>Listen on Soundcloud</a></li>
                        <!--
                        <li><a href='http://www.facebook.com/sharer.php?u=http://localhost/eightoheight/public/#track/$id'><img src='icons/facebook.svg'>Share on Facebook</a></li>
                        -->
                    </ul>
                </div>
            </div>
            <div class='single-track-right'>
                <div class='track-list-info'>
                    <a href='#play' class='track-play'
                    data-streamurl='$stream_url'
                    data-id='id_$id'
                    data-info='<span><strong>$artist</strong> - $title</span>'
                    data-duration='$duration'>
                        <h3>$title<span class='artist'> - $artist</span></h3>
                    </a>
                    <p>$description</p>
                    <span class='date'>Posted on $date</span>
                    <span class='posted'>By $posted_by</span>
                </div>
            </div>
        </div>
    </div>";
    }

    public function trackList($data) {
        $html = "<div id='#track-container'>";
        foreach($data as $track) {
            $id             = $track['id'];
            $artist         = $track['artist'];
            $title          = $track['title'];
            $genres         = $track['genre'];
            $artwork        = $track['artwork'];
            $soundcloud_url = $track['soundcloud_url'];
            $stream_url     = $track['stream_url'];
            $duration       = $track['duration'];

            $genres = explode(',', $genres);
            $genre_list = '';
            foreach($genres as $genre) {
                $genre_list .= "<li>$genre</li>";
            }

            $html .= "
<div class='track-list-item'>
    <a href='#play' class='track-play track-image-container'
    data-streamurl='$stream_url'
    data-id='id_$id'
    data-info='<span><strong>$artist</strong> - $title</span>'
    data-duration='$duration'>
        <img src='icons/track-play.svg' alt='' class='track-play-icon'>
        <img src='$artwork' alt='$artist - $title' class='track-image'>
    </a>
    <div class='track-list-info'>
        <a href='#play' class='track-play'
        data-streamurl='$stream_url'
        data-id='id_$id'
        data-info='<span><strong>$artist</strong> - $title</span>'
        data-duration='$duration'>
            <h3>$title<span class='artist'> - $artist</span></h3>
        </a>
        <ul>
          <li><a href='#track/$id'><img src='icons/info.svg'>Read More</a></li>
          <li><a href='$soundcloud_url'><img src='icons/soundcloud.svg'>Listen on Soundcloud</a></li>
          <!--
          <li><a href='http://www.facebook.com/sharer.php?u=http://localhost/eightoheight/public/#track/$id'><img src='icons/facebook.svg'>Share on Facebook</a></li>
          -->
        </ul>
    </div>
    <div class='track-meta'>
        <ul>
        $genre_list
        </ul>
    </div>
</div>";
        }
        $html .= "</div>";
        return $html;
    }

    public function pagination($track_count, $items_per_page) {
        $pages = ceil( $track_count / $items_per_page );
        $html = "<div class='pagination'>";

        for($i = 1; $i < $pages + 1; $i++) {
            $html .= "<a href='#page/$i' class='button button-default'>$i</a>";
        }

        $html .= "</div>";

        return $html;
    }
}
