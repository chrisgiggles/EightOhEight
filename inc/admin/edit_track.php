<?php

if ( isset($_GET['id']) ) {
    $track = $_GET['id'];


}
else {
    header('Location: index.php');
}

if ( isset($_POST['submit_track']) ) {
    $data = array();

    //Populate our array with info from the form
    $data['artist'] = $_POST['artist'];
    $data['title'] = $_POST['title'];
    $data['soundcloud_id'] = $_POST['soundcloud_id'];
    $data['genre'] = $_POST['genre'];
    $data['description'] = $_POST['description'];

    $url = file_get_contents_curl("https://api.soundcloud.com/tracks/{$data['soundcloud_id']}.json?consumer_key=" . APIKEY);
    $json_data = json_decode($url, true);

    if( isset($json_data['errors']) ) {
        echo "Lol error";
    }
    else {
        //Append additional info from soundcloud to $data array
        $data['duration'] = $json_data['duration'];
        $data['artwork'] = str_replace( 'large', 't500x500', $json_data['artwork_url'] );
        $data['soundcloud_url'] = $json_data['permalink_url'];
        //$data['stream_url'] = http_parse_headers($stream_header)['Location'];

        try {
            $query = 'insert into tracks (artist, title, soundcloud_id, description, genre, posted_by,
                                          created, duration, artwork, soundcloud_url)
                      values (:artist, :title, :soundcloud_id, :description, :genre, :posted_by,
                              NOW(), :duration, :artwork, :soundcloud_url)';

            $ps = $db->prepare($query);
            $ps->bindValue('artist', $data['artist']);
            $ps->bindValue('title', $data['title']);
            $ps->bindValue('soundcloud_id', $data['soundcloud_id']);
            $ps->bindValue('description', $data['description']);
            $ps->bindValue('genre', $data['genre']);
            $ps->bindValue('posted_by', $_SESSION['username']);
            $ps->bindValue('duration', $data['duration']);
            $ps->bindValue('artwork', $data['artwork']);
            $ps->bindValue('soundcloud_url', $data['soundcloud_url']);

            $ps->execute();
        }
        catch(Exception $e) {
            echo $e->getMessage();
        }
    }
}

?>

<div class="admin-container">
    <h3>Logged in as <?php echo $username ?> </h3>
    <form id="post-song" action="#" method="post">
        <ul>
            <li><label for="artist">Artist</label></li>
            <li><input type="text" id="artist" name="artist" value=""></li>

            <li><label for="title">Title</label></li>
            <li><input type="text" id="title" name="title" value=""></li>

            <li><label for="soundcloud_id">Soundcloud ID</label></li>
            <li><input type="text" id="soundcloud_id" name="soundcloud_id" value=""></li>

            <li><label for="genre">Genres</label></li>
            <li><input type="text" id="genre" name="genre" value=""></li>

            <li><label for="description">Description</label></li>
            <li><textarea id="description" name="description" rows="12"></textarea></li>

            <li><input type="submit" name="submit_track" value="Submit"></li>
        </ul>
    </form>
    <a href="logout.php">Log out</a>
</div>
