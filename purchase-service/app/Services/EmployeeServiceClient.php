<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmployeeServiceClient
{
    private string $baseUrl;

    private int $timeout;

    private int $cacheTtl;

    public function __construct()
    {
        $this->baseUrl  = rtrim(config('services.employee_service.base_url'), '/');
        $this->timeout  = config('services.employee_service.timeout', 10);
        $this->cacheTtl = config('services.employee_service.cache_ttl', 300);
    }

    /**
     * Ambil semua cabang aktif dari Employee Service.
     */
    public function getActiveBranches(?string $token = null): array
    {
        $cacheKey = 'employee_service:branches:active';

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($token) {
            return $this->fetchBranches(['is_active' => 1], $token);
        });
    }

    /**
     * Ambil detail satu cabang by ID.
     */
    public function getBranchById(int $branchId, ?string $token = null): ?array
    {
        $cacheKey = "employee_service:branch:{$branchId}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($branchId, $token) {
            try {
                $response = Http::timeout($this->timeout)
                    ->withHeaders($this->headers($token))
                    ->get("{$this->baseUrl}/branches/{$branchId}");

                if ($response->successful()) {
                    $data = $response->json();

                    return $data['data'] ?? $data;
                }

                Log::warning('[EmployeeServiceClient] getBranchById failed', [
                    'branch_id' => $branchId,
                    'status'    => $response->status(),
                ]);

                return null;
            } catch (\Throwable $e) {
                Log::error('[EmployeeServiceClient] getBranchById exception', [
                    'branch_id' => $branchId,
                    'error'     => $e->getMessage(),
                ]);

                return null;
            }
        });
    }

    /**
     * Alias untuk controller — lempar exception jika cabang tidak ditemukan.
     */
    public function getBranch(int $branchId, ?string $token = null): array
    {
        $branch = $this->getBranchById($branchId, $token);

        if (!$branch) {
            throw new \RuntimeException('Branch not found or Employee Service unavailable.');
        }

        return $branch;
    }

    public function invalidateBranchCache(?int $branchId = null): void
    {
        if ($branchId) {
            Cache::forget("employee_service:branch:{$branchId}");
        }
        Cache::forget('employee_service:branches:active');
    }

    private function fetchBranches(array $params = [], ?string $token = null): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders($this->headers($token))
                ->get("{$this->baseUrl}/branches", $params);

            if ($response->successful()) {
                $data = $response->json();

                return $data['data'] ?? $data;
            }

            Log::warning('[EmployeeServiceClient] fetchBranches failed', [
                'status' => $response->status(),
                'params' => $params,
            ]);

            return [];
        } catch (\Throwable $e) {
            Log::error('[EmployeeServiceClient] fetchBranches exception', [
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    private function headers(?string $token = null): array
    {
        $headers = ['Accept' => 'application/json'];

        $token ??= request()->bearerToken();
        if ($token) {
            $headers['Authorization'] = "Bearer {$token}";
        }

        return $headers;
    }
}
