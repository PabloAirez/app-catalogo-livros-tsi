<?php

error_log("TEST: Request received");
error_log("REQUEST_URI: " . $_SERVER['REQUEST_URI']);
error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("PATH_INFO: " . ($_SERVER['PATH_INFO'] ?? 'N/A'));

$body = file_get_contents("php://input");
error_log("Body: " . $body);

echo json_encode([
    'uri' => $_SERVER['REQUEST_URI'],
    'method' => $_SERVER['REQUEST_METHOD'],
    'path_info' => $_SERVER['PATH_INFO'] ?? 'N/A',
    'body_length' => strlen($body)
]);
