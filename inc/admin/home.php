<?php

include_once('../options.php');
include_once('../db_connect.php');
include_once('../functions.php');

session_start();

$username = $_SESSION['username'];

if (!$username) {
    header('Location: login.php');
}

if ( isset($_POST['submit_track']) ) {
    $data = array();

    //Populate our array with info from the form
    $data['artist'] = $_POST['artist'];
    $data['title'] = $_POST['title'];
    $data['soundcloud_id'] = $_POST['soundcloud_id'];
    $data['genre'] = $_POST['genre'];
    $data['description'] = $_POST['title'];

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

<!doctype html>
<html>
<head>
    <title>Login</title>
    <link rel="stylesheet" href="../../public/css/style.css" media="screen" title="no title" charset="utf-8">
    <style media="screen">
        body {
            background: #1B1C25;
        }

        .admin-container {
            width: 600px;
            margin: 0 auto;
        }

        form ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        form input,
        form textarea {
            width: 100%;
            margin-bottom: 15px;
            border-radius: 2px;
            border: none;
            color: black;
            padding: 4px;
            font-size: 13px;
        }

        form input[type="submit"] {
            background: #3875ED;
            color: white;
            border: 1px solid #4175ff;
        }
    </style>
</head>
<body>
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
</body>
</html>
