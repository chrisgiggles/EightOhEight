<?php

include_once('../db_connect.php');
include_once('../functions.php');

if ( isset($_POST['submit_login']) ) {

    $email = $_POST['email'];
    $password = $_POST['password'];
    $msg = $error = '';

    if ( !filter_var($email, FILTER_VALIDATE_EMAIL) ) {
        $error .= '<li>The provided E-mail is not valid.</li>';
    }

    if ( empty($password) ) {
        $error .= '<li>The provided password is not valid.</li>';
    }

    if ( !$error ) {
        try {
            $query = 'select * from user where email = :email';
            $ps = $db->prepare($query);
            $ps->bindValue("email", $email);
            $ps->execute();

            $res = $ps->fetch(PDO::FETCH_ASSOC);

            if ( password_verify($password, $res['password']) ) {
                session_start();
                $_SESSION["username"] = $res['username'];
                header('Location: home.php');
            }
        }
        catch( Exception $e ) {
            echo $e->getMessage();
        }
    }

    if ( $error ) {
        $msg = "<ul>$error</ul>";
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

        #login-form {
            position: absolute;
            top: 50%;
            left: 50%;
            margin-top: -125px;
            margin-left: -150px;

            width: 300px;
            height: 250px;
            padding: 45px 30px 30px;
            background: #2C2E39;
            border-radius: 4px;
            border: 1px solid #333545;
            box-shadow: 0 0 20px rgba(0,0,0,0.4);
        }

        #login-form ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        #login-form input {
            width: 100%;
            margin-bottom: 15px;
            border-radius: 2px;
            border: none;
            color: black;
        }

        #login-form input[type="submit"] {
            background: #3875ED;
            color: white;
            border: 1px solid #4175ff;
        }
    </style>
</head>
<body>
    <form id="login-form" action="#" method="post">
        <ul>
            <li><input type="text" name="email" value="" placeholder="E-mail address"></li>
            <li><input type="password" name="password" value="" placeholder="Password"></li>
            <li><input type="submit" name="submit_login" value="Login"></li>
        </ul>
        <?php
        if (isset($msg)) {
            echo $msg;
        }
        ?>
    </form>
</body>
</html>
