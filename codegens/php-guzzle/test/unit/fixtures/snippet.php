<?php
use Psr\Http\Message\ResponseInterface;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;
$client = new Client();
$headers = [
  'my-sample-header' => 'Lorem ipsum dolor sit amet',
  'testing' => '\'singlequotes\'',
  'TEST' => '"doublequotes"'
];
$request = new Request('GET', 'https://postman-echo.com/headers', $headers);
$promise = $client->sendAsync($request);
$promise->then(
  function (ResponseInterface $res) {
    echo $res->getStatusCode();
  },
  function (RequestException $e) {
    echo $e->getMessage();
    echo $e->getRequest()->getMethod();
  }
);
