<?php
    
$dbname = 'testdb'; // Enter DB Here
$username = 'ut_progetto'; // Enter Username Here
$password = 'Voda1234'; // Enter Password Here
$conn = new PDO("mysql:host=localhost;dbname=$dbname", $username, $password);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
try {
  $result = $conn->query('SELECT datetime , temp FROM testdb.t_temperature;');
  
  $rows = array();
  $table = array();
  $table['cols'] = array(array('label' => 'Datetime', 'type' => 'string'),array('label' => 'Temp', 'type' => 'number'));
    
  foreach($result as $r) {
  $data = array();
  $data[] = array('v' => (string) $r['datetime']); 
  $data[] = array('v' => (int) $r['temp']); 
      
  $rows[] = array('c' => $data);
  
  }
$table['rows'] = $rows;
} catch(PDOException $e) {
    echo 'ERROR: ' . $e->getMessage();
}
try {
  $result2 = $conn->prepare("SELECT datetime,temp from testdb.t_temperature;");
 
  $result2->execute();
} catch(PDOException $e) {
    echo 'ERROR: ' . $e->getMessage();
}
?>
