<?php
$con = mysql_connect("localhost","ut_wattmon","BuaBwUpttwSTd5tq");

if (!$con) {
  die('Could not connect: ' . mysql_error());
}

mysql_select_db("wattmon", $con);

$sth = mysql_query("SELECT `Voltage`,`Power`,`ActiveApparentPower`,`ReactiveApparentPower` FROM `t_consumi` WHERE 1 LIMIT 500");
$rows = array();
$rows['name'] = 'potenza_attiva';
while($r = mysql_fetch_array($sth)) {
    $rows['data_misura'][] = $r['data_misura'];
	$rows['Power'][] = $r['Power'];
	$rows['Voltage'][] = $r['Voltage'];
	$rows['ActiveApparentPower'][] = $r['ActiveApparentPower'];
	$rows['ReactiveApparentPower'][] = $r['ReactiveApparentPower'];
}
/*
$sth = mysql_query("SELECT overhead FROM projections_sample");
$rows1 = array();
$rows1['name'] = 'Overhead';
while($rr = mysql_fetch_assoc($sth)) {
    $rows1['data'][] = $rr['overhead'];
}
*/

$result = array();
array_push($result,$rows);
//array_push($result,$rows1);

print json_encode($result, JSON_NUMERIC_CHECK);

mysql_close($con);
?>