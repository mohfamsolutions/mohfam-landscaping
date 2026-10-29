<?php
// Local PHP preview only: never deploy this development router.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($path === '/api/contact.php') { require __DIR__.'/../dist/api/contact.php'; return true; }
if (preg_match('/(?:^|\/)\./', $path) || str_ends_with($path, '.php')) { http_response_code(404); return true; }
$root = realpath(__DIR__.'/../dist');
$target = realpath($root.$path);
if ($target && ($target === $root || str_starts_with($target, $root.DIRECTORY_SEPARATOR))) {
    if (is_file($target)) return false;
    if (is_dir($target) && is_file($target.'/index.html')) {
        if (!str_ends_with($path, '/')) { header('Location: '.$path.'/',true,301); return true; }
        if ($path === '/404/') http_response_code(404);
        header('Content-Type: text/html; charset=utf-8'); readfile($target.'/index.html'); return true;
    }
}
http_response_code(404); header('Content-Type: text/html; charset=utf-8'); readfile($root.'/404.html');
