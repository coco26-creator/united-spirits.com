<?php
declare(strict_types=1);

/**
 * United Spirits HK distributor/supplier lead endpoint.
 * Required environment variables:
 * KLAVIYO_PRIVATE_API_KEY, KLAVIYO_DISTRIBUTOR_LIST_ID,
 * KLAVIYO_SUPPLIER_LIST_ID, NOTIFICATION_EMAIL, MAIL_FROM.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $payload): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function envValue(string $key): string {
    $value = getenv($key);
    return is_string($value) ? trim($value) : '';
}

function postKlaviyo(string $path, array $payload, string $apiKey): array {
    if (!function_exists('curl_init')) {
        throw new RuntimeException('The server is missing the PHP cURL extension.');
    }
    $ch = curl_init('https://a.klaviyo.com/api/' . ltrim($path, '/'));
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_HTTPHEADER => [
            'Authorization: Klaviyo-API-Key ' . $apiKey,
            'accept: application/vnd.api+json',
            'content-type: application/vnd.api+json',
            'revision: 2026-07-15',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    if ($body === false) {
        throw new RuntimeException('Klaviyo request failed: ' . $error);
    }
    $decoded = json_decode($body, true);
    if ($status < 200 || $status >= 300) {
        error_log('USC Klaviyo API error: HTTP ' . $status . ' ' . substr((string)$body, 0, 800));
        throw new RuntimeException('Klaviyo could not save this enquiry (HTTP ' . $status . ').');
    }
    return is_array($decoded) ? $decoded : [];
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['https://www.unitedspiritshk.com', 'https://unitedspiritshk.com'];
if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    respond(403, ['ok' => false, 'message' => 'Request origin is not allowed.']);
}
$contentType = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
if (strpos($contentType, 'application/json') === false) {
    respond(415, ['ok' => false, 'message' => 'Unsupported request format.']);
}

$raw = file_get_contents('php://input');
if (!is_string($raw) || strlen($raw) > 20000) {
    respond(413, ['ok' => false, 'message' => 'Submission is too large.']);
}
$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'message' => 'Please check the form and try again.']);
}

// Honeypot: silently accept bot submissions without processing them.
if (!empty($data['website'])) {
    respond(200, ['ok' => true, 'message' => 'Thank you. Your enquiry has been received.']);
}

$type = isset($data['type']) && is_string($data['type']) ? $data['type'] : '';
if (!in_array($type, ['distributor', 'supplier'], true)) {
    respond(400, ['ok' => false, 'message' => 'Unknown enquiry type.']);
}

$email = isset($data['email']) && is_string($data['email']) ? trim($data['email']) : '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    respond(422, ['ok' => false, 'message' => 'Please enter a valid email address.']);
}
if (($data['contact_consent'] ?? '') !== 'yes') {
    respond(422, ['ok' => false, 'message' => 'Please confirm that we may use these details to respond to your enquiry.']);
}

// Keep the endpoint lightweight against repeated accidental submissions.
session_start();
$now = time();
$last = (int)($_SESSION['usc_lead_last_submit'] ?? 0);
if ($last > 0 && ($now - $last) < 8) {
    session_write_close();
    respond(429, ['ok' => false, 'message' => 'Please wait a few seconds before submitting again.']);
}
$_SESSION['usc_lead_last_submit'] = $now;
session_write_close();

$fields = $type === 'distributor'
    ? [
        'company_name' => 'Company name',
        'country_region' => 'Country/region',
        'distribution_channels' => 'Distribution channels',
        'annual_volume_cases' => 'Annual volume (cases)',
    ]
    : [
        'winery_distillery_name' => 'Winery/distillery name',
        'country' => 'Country',
        'product_type' => 'Product type',
        'production_capacity' => 'Production capacity',
        'certifications' => 'Certifications',
    ];

$clean = ['email' => $email];
foreach ($fields as $key => $label) {
    $value = isset($data[$key]) && is_scalar($data[$key]) ? trim((string)$data[$key]) : '';
    if ($value === '' || strlen($value) > 3000) {
        respond(422, ['ok' => false, 'message' => 'Please complete the required field: ' . $label . '.']);
    }
    $clean[$key] = $value;
}
if ($type === 'distributor' && (!is_numeric($clean['annual_volume_cases']) || (float)$clean['annual_volume_cases'] < 0)) {
    respond(422, ['ok' => false, 'message' => 'Please enter a valid annual case volume.']);
}

$apiKey = envValue('KLAVIYO_PRIVATE_API_KEY');
$listId = envValue($type === 'distributor' ? 'KLAVIYO_DISTRIBUTOR_LIST_ID' : 'KLAVIYO_SUPPLIER_LIST_ID');
$notifyTo = envValue('NOTIFICATION_EMAIL') ?: 'info@unitedspiritshk.com';
$mailFrom = envValue('MAIL_FROM');
if ($apiKey === '' || $listId === '' || $mailFrom === '') {
    error_log('USC lead endpoint is not configured: missing Klaviyo API/list ID or MAIL_FROM environment setting.');
    respond(503, ['ok' => false, 'message' => 'The enquiry service is temporarily unavailable. Please email info@unitedspiritshk.com directly.']);
}
if (!filter_var($notifyTo, FILTER_VALIDATE_EMAIL) || !filter_var($mailFrom, FILTER_VALIDATE_EMAIL)) {
    error_log('USC lead endpoint has invalid notification/sender email configuration.');
    respond(503, ['ok' => false, 'message' => 'The enquiry service is temporarily unavailable. Please email info@unitedspiritshk.com directly.']);
}

$properties = ['lead_type' => $type, 'contact_consent' => true, 'enquiry_source' => 'United Spirits HK website'];
foreach ($fields as $key => $label) {
    $properties[$key] = $clean[$key];
}
try {
    // Create/update a profile, then add it to the configured list. This does not
    // silently subscribe the contact to email marketing.
    $profile = postKlaviyo('profile-import', [
        'data' => [
            'type' => 'profile',
            'attributes' => ['email' => $email],
            'properties' => $properties,
        ],
    ], $apiKey);
    $profileId = $profile['data']['id'] ?? '';
    if (!is_string($profileId) || $profileId === '') {
        throw new RuntimeException('Klaviyo did not return a profile ID.');
    }
    postKlaviyo('lists/' . rawurlencode($listId) . '/relationships/profiles', [
        'data' => [['type' => 'profile', 'id' => $profileId]],
    ], $apiKey);
} catch (Throwable $error) {
    error_log('USC ' . $type . ' lead Klaviyo failure: ' . $error->getMessage());
    respond(502, ['ok' => false, 'message' => 'We could not record your enquiry just now. Please try again or email info@unitedspiritshk.com.']);
}

$subject = 'Website ' . ucfirst($type) . ' Enquiry';
$lines = [
    'A new ' . $type . ' enquiry was submitted on unitedspiritshk.com.',
    '',
    'Contact email: ' . $email,
];
foreach ($fields as $key => $label) {
    $lines[] = $label . ': ' . $clean[$key];
}
$lines[] = '';
$lines[] = 'Consent to respond to this enquiry: Yes';
$headers = [
    'From: United Spirits HK Website <' . $mailFrom . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];
$mailSent = mail($notifyTo, $subject, implode("\r\n", $lines), implode("\r\n", $headers));
if (!$mailSent) {
    error_log('USC ' . $type . ' lead was saved to Klaviyo but PHP mail() failed. Notification recipient: ' . $notifyTo);
    respond(502, ['ok' => false, 'message' => 'Your enquiry was recorded, but our email notification failed. Please email info@unitedspiritshk.com and mention your enquiry.']);
}

respond(200, ['ok' => true, 'message' => 'Thank you. Your enquiry has been sent to our team.']);
