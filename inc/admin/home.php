<?php

include_once('../db_connect.php');
include_once('../functions.php');

session_start();

$username = $_SESSION['username'];

if (!$username) {
    header('Location: login.php');
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
        <form id="post-song" action="index.html" method="post">
            <ul>
                <li><label for="artist">Artist</label></li>
                <li><input type="text" name="artist" value=""></li>

                <li><label for="title">Title</label></li>
                <li><input type="text" name="title" value=""></li>

                <li><label for="soundcloud_id">Soundcloud ID</label></li>
                <li><input type="text" name="soundcloud_id" value=""></li>

                <li><label for="genre">Genres</label></li>
                <li><input type="text" name="genre" value=""></li>

                <li><label for="description">Description</label></li>
                <li><textarea name="description" rows="12"></textarea></li>

                <li><input type="submit" name="submit_track" value="Submit"></li>
            </ul>

        </form>
        <a href="logout.php">Log out</a>
    </div>
</body>
</html>
