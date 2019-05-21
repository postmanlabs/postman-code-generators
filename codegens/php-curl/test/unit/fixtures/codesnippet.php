<?php

$curl = curl_init();

curl_setopt_array($curl, array(
    CURLOPT_URL => "https://9c76407d-5b8d-4b22-99fb-8c47a85d9848.mock.pstmn.io",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 100,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "COPY",
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;
