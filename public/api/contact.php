<?php
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function respond(int $status, array $data): void { http_response_code($status); echo json_encode($data); exit; }
set_exception_handler(function(Throwable $e): void { error_log('Landscaping inquiry endpoint failure: ' . get_class($e)); respond(503, ['ok'=>false,'message'=>'The inquiry service is temporarily unavailable. Please try again later or email mohfamsolutions@gmail.com.']); });
session_name('mohfam_landscaping');
session_set_cookie_params(['lifetime'=>0,'path'=>'/api/','secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off','httponly'=>true,'samesite'=>'Strict']);
ini_set('session.use_strict_mode', '1');
session_start();
function mailReady(): bool {
    $origin=getenv('LANDSCAPING_ORIGIN') ?: '';
    $sender=getenv('LANDSCAPING_MAIL_FROM') ?: '';
    $host=parse_url($origin,PHP_URL_HOST);
    return getenv('LANDSCAPING_MAIL_ENABLED')==='1'
        && getenv('LANDSCAPING_MAIL_AUTH_REVIEWED')==='1'
        && preg_match('~^https://[a-z0-9.-]+$~D',$origin)===1
        && filter_var($sender,FILTER_VALIDATE_EMAIL)!==false
        && preg_match('/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+$/D',$sender)===1
        && strtolower(substr(strrchr($sender,'@'),1))===strtolower((string)$host);
}
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'GET') {
    if (empty($_SESSION['csrf']) || time() - (int)($_SESSION['issued'] ?? 0) > 7200) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32)); $_SESSION['issued'] = time();
    }
    respond(200,['csrf'=>$_SESSION['csrf'],'mailReady'=>mailReady()]);
}
if ($method !== 'POST') { header('Allow: GET, POST'); respond(405,['ok'=>false,'message'=>'This request method is not supported.']); }
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 16000) respond(413,['ok'=>false,'message'=>'This inquiry is too large. Please shorten your message.']);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$configuredOrigin = getenv('LANDSCAPING_ORIGIN') ?: '';
$allowedOrigins = preg_match('~^https://[a-z0-9.-]+$~D', $configuredOrigin) ? [$configuredOrigin] : [];
if (getenv('LANDSCAPING_LOCAL_TEST') === '1') $allowedOrigins[] = 'http://127.0.0.1:4176';
if (!in_array($origin,$allowedOrigins,true)) respond(403,['ok'=>false,'message'=>'The security check failed. Reload the page and try again.']);
if (!is_string($_POST['csrf'] ?? null) || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'],$_POST['csrf']) || time()-(int)$_SESSION['issued'] > 7200) respond(403,['ok'=>false,'message'=>'Your security session expired. Reload this page before trying again.']);
function field(string $name, int $min, int $max, bool $multiline=false): string {
    $value=$_POST[$name] ?? '';
    if (!is_string($value)) respond(422,['ok'=>false,'message'=>'Please check the form fields and try again.']);
    $value=trim($value);
    if (strlen($value)<$min || strlen($value)>$max || preg_match($multiline?'/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/':'/[\x00-\x1F\x7F]/',$value)) respond(422,['ok'=>false,'message'=>'Please check your ' . $name . ' field and try again.']);
    return $value;
}
$name=field('name',2,100); $email=field('email',3,254); $phone=field('phone',0,40); $location=field('location',2,120); $property=field('property',1,80); $service=field('service',1,80); $message=field('message',20,4000,true);
if (!filter_var($email,FILTER_VALIDATE_EMAIL)) respond(422,['ok'=>false,'message'=>'Please enter a valid email address.']);
$properties=['Private residence','Residential community','Commercial / managed property','Other property'];
$services=['lawn-grounds-care'=>'Lawn & grounds care','garden-planting-care'=>'Garden & planting care','seasonal-cleanup'=>'Seasonal cleanup','irrigation-care'=>'Irrigation care','not-sure'=>'Guidance requested'];
if (!in_array($property,$properties,true) || !isset($services[$service]) || ($_POST['consent'] ?? '')!=='yes') respond(422,['ok'=>false,'message'=>'Please choose valid care and property options and confirm consent.']);
if (!empty($_POST['website']) || time()-(int)$_SESSION['issued'] < 3) respond(422,['ok'=>false,'message'=>'We could not verify this submission. Please wait a few seconds and try again.']);
// The web server, rather than a visitor-supplied forwarded header, owns the network address.
$directory=sys_get_temp_dir().'/mohfam-landscaping-rate';
if (!is_dir($directory) && !mkdir($directory,0700,true) && !is_dir($directory)) throw new RuntimeException('Rate storage unavailable');
$key=hash('sha256',($_SERVER['REMOTE_ADDR'] ?? 'unknown').'|mohfam-landscaping');
$handle=fopen($directory.'/'.$key.'.json','c+'); if (!$handle || !flock($handle,LOCK_EX)) throw new RuntimeException('Rate lock unavailable');
$attempts=json_decode(stream_get_contents($handle),true) ?: []; $attempts=array_values(array_filter($attempts,fn($t)=>is_int($t) && $t > time()-3600));
if (count($attempts)>=5) { flock($handle,LOCK_UN); fclose($handle); header('Retry-After: 3600'); respond(429,['ok'=>false,'message'=>'Too many inquiries have been submitted from this connection. Please try again later or email MohFam directly.']); }
$attempts[]=time(); ftruncate($handle,0); rewind($handle); fwrite($handle,json_encode($attempts)); fflush($handle); flock($handle,LOCK_UN); fclose($handle);
// Production stays closed until a verified hosting/mail configuration is supplied.
if (!mailReady()) respond(503,['ok'=>false,'message'=>'Direct inquiries are not connected yet. Please email mohfamsolutions@gmail.com, or try again later.']);
$id='LAND-' .strtoupper(bin2hex(random_bytes(5)));
$body="MohFam Landscaping inquiry\r\nReference: $id\r\nName: $name\r\nEmail: $email\r\nPhone: $phone\r\nLocation: $location\r\nProperty: $property\r\nCare: {$services[$service]}\r\n\r\nMessage:\r\n$message\r\n\r\nConsent: visitor agreed to inquiry follow-up.\r\n";
$sender=getenv('LANDSCAPING_MAIL_FROM');
$headers=['From'=>'MohFam Landscaping <'.$sender.'>','Reply-To'=>$email,'MIME-Version'=>'1.0','Content-Type'=>'text/plain; charset=UTF-8','Content-Transfer-Encoding'=>'base64'];
// Keep the Linux envelope sender aligned with From; the domain must authorize the relay in SPF.
// This is a server-owned constant, never a visitor-supplied command-line parameter.
$accepted=PHP_OS_FAMILY === 'Windows'
    ? mail('mohfamsolutions@gmail.com','[MohFam Landscaping] Property inquiry '.$id,chunk_split(base64_encode($body)),$headers)
    : mail('mohfamsolutions@gmail.com','[MohFam Landscaping] Property inquiry '.$id,chunk_split(base64_encode($body)),$headers,'-f'.$sender);
if (!$accepted) respond(503,['ok'=>false,'message'=>'The mail server could not accept this inquiry. Please try again later or email MohFam directly.']);
// Acceptance by the mail server is not evidence of inbox receipt.
unset($_SESSION['csrf'],$_SESSION['issued']);
respond(200,['ok'=>true,'message'=>'Your inquiry has been accepted by the mail server. Reference: '.$id.'. If you do not hear back, contact mohfamsolutions@gmail.com.']);

