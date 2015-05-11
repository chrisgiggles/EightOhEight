<?php

include_once('options.php');
include_once('db_connect.php');
include_once('functions.php');
include_once('template.php');

if ( isset($_GET['track_id']) && is_numeric($_GET['track_id']) ) {

    $trackID = $_GET['track_id'];

    try {
        $query = "select * from tracks where id = :id and id is not null";
        $ps = $db->prepare($query);
        $ps->bindValue('id', $trackID);
        $ps->execute();
        $data = $ps->fetch(PDO::FETCH_ASSOC);
    }
    catch (Exception $e) {
        echo $e->getMessage();
    }


}
/*
User:
Wants to share a song to his wall on Facebook.

Technical:
This file will contain a script that gets a request with information about the track
that was shared. Then it will populate og:meta tags which Facebooks share.php scraper
can read.

Example output file:
<meta property="og:title" content="The Rock"/>
<meta property="og:type" content="movie"/>
<meta property="og:url" content="http://www.imdb.com/title/tt0117500/"/>
<meta property="og:image" content="http://ia.media-imdb.com/rock.jpg"/>
<meta property="og:site_name" content="IMDb"/>
<meta property="fb:admins" content="USER_ID"/>
<meta property="og:description"
      content="A group of U.S. Marines, under command of
               a renegade general, take over Alcatraz and
               threaten San Francisco Bay with biological
               weapons."/>
*/

?>

<!DOCTYPE html>
<html>
    <head>
        <title>Share Song</title>
        <meta property="og:title" content="<?php echo $data['artist'] - $data['title'] ?>">
        <meta property="og:type" content="music">
        <meta property="og:url" content="http://localhost/eightoheight/#track/<?php echo $trackID ?>">
        <meta property="og:image" content="">
        <meta property="og:site_name" content="EightOhEight">
        <meta property="og:description" content="<?php echo nl2br($data['description']) ?>">
    </head>
    <body>
        <?php
            pretty($data);
        ?>
    </body>
</html>
