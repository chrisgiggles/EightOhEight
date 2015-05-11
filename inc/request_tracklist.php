<?php

include_once('options.php');
include_once('db_connect.php');
include_once('functions.php');
include_once('template.php');

if ( $_GET['page'] && is_numeric($_GET['page']) ) {
    $page = $_GET['page'];
    $items_per_page = 8;
    $offset = ($page - 1) * $items_per_page;

    //Query database
    try {
        $query = "select * from tracks order by created DESC limit :offset, :items_per_page";
        $ps = $db->prepare($query);
        $ps->bindValue('offset', $offset, PDO::PARAM_INT);
        $ps->bindValue('items_per_page', $items_per_page, PDO::PARAM_INT);
        $ps->execute();
        $data = $ps->fetchAll(PDO::FETCH_ASSOC);

        if ( empty($data) ) {
            //Return null if no results to the ajax request
            echo null;
        }
        else {
            for( $i = 0; $i < sizeof($data); $i++) {
                $url = file_get_contents_curl("https://api.soundcloud.com/tracks/{$data[$i]['soundcloud_id']}.json?consumer_key=" . APIKEY);
                $json_data = json_decode($url, true);
                //Resolve mp3 Location (302 redirect)
                $stream_header = file_get_info_curl( $json_data['stream_url'] . "?consumer_key=" . APIKEY ); //Use get_headers in production?

                $data[$i]['duration'] = $json_data['duration'];
                $data[$i]['stream_url'] = http_parse_headers($stream_header)['Location'];
                $data[$i]['artwork'] = str_replace( 'large', 't300x300', $json_data['artwork_url'] );
                $data[$i]['soundcloud_url'] = $json_data['permalink_url'];
            }
            $template = new Template();
            echo $template->trackList($data);

            try {
                $pg_query = "select count(*) from tracks";
                $pg_ps = $db->query($pg_query);
                $pg_ps->execute();
                $track_count = $pg_ps->fetchColumn();
                echo $template->pagination($track_count, $items_per_page);
            }
            catch(Exception $e) {
                echo $e->getMessage();
            }
        }
    }
    catch(Exception $e) {
        echo $e->getMessage();
    }
}
