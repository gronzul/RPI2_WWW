<?php
/*
 * act.php
 * 
 * Copyright 2016 Giuseppe R. <gronzuladm@OTOLS002>
 * 
 * 
 */

    if ($_SERVER["REQUEST_METHOD"] == "POST") 
    {
		
		$hf = trim($_POST["hf"]);
		if ($hf =="1")
		{
			echo "post OK 1";
		}
		
		if ($hf =="2")
		{
			echo "post OK 2";
		}
		
		if ($hf =="3")
		{
			echo "post OK 3";
		}
		http_response_code(200);
	} else 
	{                
	   http_response_code(500);
       echo "Oops! Something went wrong and we couldn't send your message.";
    }
?>
