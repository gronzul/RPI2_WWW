<?php
    header('Access-Control-Allow-Origin: *');
    $ip = file_get_contents('https://api.ipify.org');
    echo  $ip;
?>
