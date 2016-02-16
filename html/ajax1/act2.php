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
		http_response_code(200);
		echo "post OK secondario";
	} else 
	{                
	   http_response_code(500);
       echo "Oops! Something went wrong and we couldn't send your message.";
    }
?>
