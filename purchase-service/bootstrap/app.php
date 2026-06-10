<?php

use App\Http\Middleware\AuthenticateFromAuthService;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\HandleCors;
use App\Providers\AuthorizationServiceProvider;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors as FrameworkHandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withProviders([
        AuthorizationServiceProvider::class,
    ])
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->prepend(HandleCors::class);
        $middleware->remove(FrameworkHandleCors::class);
        $middleware->alias([
            'auth.jwt' => AuthenticateFromAuthService::class,
            'role'     => CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
