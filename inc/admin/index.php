<?php

include_once('../options.php');
include_once('../db_connect.php');
include_once('../functions.php');

session_start();

$logged_in = $username = $_SESSION['username'];

if (!$logged_in) {
    header('Location: login.php');
}

?>

<!doctype html>
<html>
<head>
    <title>EightOhEight Admin</title>
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
    <nav>
        <a href="index.php">Home</a>
        <a href="index.php?p=add_track">Add New Track</a>
        <a href="logout.php">Log out</a>
    </nav>

    <?php
    #Super basic routing controller
    if ( isset($_GET['p']) ) {
        if ( $_GET['p'] == 'add_track' ) {
            include('add_track.php');
        }

        if ( $_GET['p'] == 'edit_track' ) {
            include('edit_track.php');
        }
    }
    else {
        include('list_all.php');
    }
    ?>
</body>
</html>
