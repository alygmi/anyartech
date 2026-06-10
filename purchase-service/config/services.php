<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'mailgun' => [
        'domain'   => env('MAILGUN_DOMAIN'),
        'secret'   => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme'   => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Internal Microservices
    |--------------------------------------------------------------------------
    */

    /**
     * Auth Service — centralized JWT validation
     * Semua service memanggil GET /auth/me ke sini untuk validasi token.
     */
    'auth_service' => [
        'base_url' => env('AUTH_SERVICE_URL', 'http://auth-service:8001'),
        'timeout'  => env('AUTH_SERVICE_TIMEOUT', 5),
    ],

    /**
     * Employee Service (HRIS) — sumber data cabang aktif
     * Purchasing Service memanggil GET /branches ke sini.
     */
    'employee_service' => [
        'base_url'  => env('EMPLOYEE_SERVICE_URL', 'http://employee-service:8002'),
        'timeout'   => env('EMPLOYEE_SERVICE_TIMEOUT', 10),
        // TTL cache branches dalam detik (default 5 menit)
        'cache_ttl' => env('EMPLOYEE_SERVICE_CACHE_TTL', 300),
    ],

];
