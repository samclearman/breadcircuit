<?php
if($_REQUEST['qucs'] || $_REQUEST['spice']) {
  if ($_REQUEST['qucs']) {
    $data = $_REQUEST['qucs'] . "\n";
    $command = 'qucsator';
  } else if ($_REQUEST['spice']){
    $data = $_REQUEST['spice'];
    $command = 'qucsconv -if spice -of qucs | qucsator';
  } 
  $qucsator = proc_open($command, array(array('pipe', 'r'),array('pipe','w'),array('pipe','w')), $pipes);
  fwrite($pipes[0],  $data);
  fclose($pipes[0]);
  $analysis = stream_get_contents($pipes[1]);
  $err = stream_get_contents($pipes[2]);
  
  if (proc_close($qucsator) == 0) {
    $result = $analysis;
  } else {
    $result =  $err;
  }
  
  if ($_REQUEST['callback']) {
      header('Content-type: text/javascript');
      echo($_REQUEST['callback'] . "({'result':'" . json_encode($result) . "'})");
  } else {
      header('Content-type: text/plain');
      echo $result;
  }

} else { ?>

<style>
textarea{
    display: block;
    width: 100%;
    height: 200px;
}
</style>
<form action="" method="post">
Upload a qucs netlist:<br />
<textarea name="qucs"></textarea><br />
Or a spice netlist:<br />
<textarea name="spice"></textarea>
<input type="text" name="callback"></input>
<input type="submit"></input>
</form>
<?php } ?>
