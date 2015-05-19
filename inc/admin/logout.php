<?php

include_once('../db_connect.php');
include_once('../functions.php');

session_start();
session_unset();

header('Location: login.php');
