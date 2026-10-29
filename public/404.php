<?php
declare(strict_types=1);
http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex');
readfile(__DIR__.'/404.html');
