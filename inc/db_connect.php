<?php 

const DSN = "mysql:host=localhost;dbname=eightoheight";
const USER = "root";
const PASS = "";

//Set utf-8 and error mode
$options = array(
    // any occurring errors will be thrown as PDOException
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    // an SQL command to execute when connecting
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'UTF8'"
);

//Connect to db
try {
	$db = new PDO(DSN, USER, PASS, $options);
}
catch( PDOException $e ) {
	echo $e->getMessage();
}
