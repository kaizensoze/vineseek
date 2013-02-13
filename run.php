<?php

$vineUrl = $_GET['vineurl'];

$vinePageContent = file_get_contents($vineUrl);
$jsonResponse = json_encode( array("html" => rawurlencode($vinePageContent)) );

$callbackFunction = $_GET['callback'];

if ($callbackFunction) {
  header('Content Type: application/x-javascript');
  $jsonpCall = $callbackFunction . '(' . $jsonResponse . ')';
  echo $jsonpCall;
} else {
  header('Content Type: application/json');
  echo $jsonResponse;
}
