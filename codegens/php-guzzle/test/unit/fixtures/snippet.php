<?php
use Psr\Http\Message\ResponseInterface;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;
$client = new Client();
$headers = [
  'Content-Type' => 'application/x-www-form-urlencoded'
];
$body = [
'form_params' => [
  '1' => '\'a\'',
  '2' => '"b"',
  '\'3\'' => 'c',
  '"4"      ' => 'd      ',
  'Special' => '!@#$%&*()^_=`~',
  'more' => ',./\';[]}{":?><|\\\\'
]];
$request = new Request('POST', 'https://postman-echo.com/post', $headers, $body);
$res = $client->send($request);
echo $res->getStatusCode();
