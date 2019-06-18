<?php
$client = new http\Client;
$request = new http\Client\Request;
$request->setRequestUrl('https://postman-echo.com/post');
$request->setRequestMethod('POST');
$body = new http\Message\Body;
$body->addForm(array(

), array(        array('name' => 'test-file', 'type' => 'file', 'file' => '', 'data' => null)));
$request->setBody($body);
$request->setOptions(array('connecttimeout' => 100));

$client->enqueue($request)->send();
$response = $client->getResponse();
echo $response->getBody();
?>