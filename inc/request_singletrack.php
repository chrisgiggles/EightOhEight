<?php

include_once('options.php');
include_once('db_connect.php');
include_once('functions.php');
include_once('template.php');

if ( $_GET['track_id'] && is_numeric($_GET['track_id']) ) {
    $trackID = $_GET['track_id'];

    //Query our database
    try {
        $query = "select * from tracks where id = :id and id is not null";
        $ps = $db->prepare($query);
        $ps->bindValue('id', $trackID);
        $ps->execute();
        $data = $ps->fetch(PDO::FETCH_ASSOC);

        if ( empty($data) ) {
            //Return null if no results to the ajax request
            echo null;
        }
        else {
            //Get the API data (extract to own function?)
            $url = file_get_contents_curl("https://api.soundcloud.com/tracks/{$data['soundcloud_id']}.json?consumer_key=" . APIKEY);
            $json_data = json_decode($url, true);
            //Resolve mp3 Location (302 redirect)
            $stream_header = file_get_info_curl( $json_data['stream_url'] . "?consumer_key=" . APIKEY ); //Use get_headers in production?

            //Append to $data array
            $data['duration'] = $json_data['duration'];
            $data['artwork'] = str_replace( 'large', 't500x500', $json_data['artwork_url'] );
            $data['soundcloud_url'] = $json_data['permalink_url'];
            $data['stream_url'] = http_parse_headers($stream_header)['Location'];
            
            $template = new Template();
            echo $template->singleTrack($data);
        }
    }
    catch(Exception $e) {
        echo $e->getMessage();
    }
}
