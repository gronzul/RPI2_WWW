<?php
$con = mysql_connect("localhost","ut_wattmon","BuaBwUpttwSTd5tq");
if (!$con) {
  die('Could not connect: ' . mysql_error());
}

mysql_select_db("wattmon", $con);

$sth = mysql_query("select data_misura, Power from t_consumi order by id_consumo asc LIMIT 500");
//$rows = array();
//$rows['name'] = 'potenza_attiva';


while ($row = mysql_fetch_array($result)) {
   extract $row;
   $datetime *= 1000; // convert from Unix timestamp to JavaScript time
   $data[] = "[$datetime, $value]";
}
?>
var chart = new Highcharts.Chart({
      chart: {
         renderTo: 'container'
      },
      series: [{
         data: [<?php echo join($data, ',') ?>]
      }]
});