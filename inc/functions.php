<?php

# Helper for pretty printing values
function pretty($val)
{
    echo "<pre>";
    print_r($val);
    echo "</pre>";
}

//CURL replacement for file_get_contents() - SSL problems
function file_get_contents_curl($url) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $data = curl_exec($ch);
    curl_close($ch);

    return $data;
}


function file_get_info_curl($url) {
    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, TRUE);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, FALSE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $data =  curl_exec($ch);
    curl_close($ch);

    return $data;
}

function http_parse_headers ($raw_headers) {
    $headers = array(); // $headers = [];

    foreach (explode("\n", $raw_headers) as $i => $h) {
        $h = explode(':', $h, 2);

        if (isset($h[1])) {
            if(!isset($headers[$h[0]])) {
                $headers[$h[0]] = trim($h[1]);
            } else if(is_array($headers[$h[0]])) {
                $tmp = array_merge($headers[$h[0]],array(trim($h[1])));
                $headers[$h[0]] = $tmp;
            } else {
                $tmp = array_merge(array($headers[$h[0]]),array(trim($h[1])));
                $headers[$h[0]] = $tmp;
            }
        }
    }

    return $headers;
}