<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthorizationServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->registerRoleGates();
        $this->registerPurchaseOrderGates();
    }

    private function registerRoleGates(): void
    {
        Gate::define('is-superadmin', fn ($user) =>
            $this->userRole($user) === 'superadmin'
        );

        Gate::define('is-admin-purchasing', fn ($user) =>
            in_array($this->userRole($user), ['admin_purchasing', 'superadmin'], true)
        );

        Gate::define('is-staff-purchasing', fn ($user) =>
            in_array($this->userRole($user), ['staff_purchasing', 'admin_cabang', 'admin_purchasing', 'superadmin'], true)
        );

        Gate::define('is-admin-cabang', fn ($user) =>
            in_array($this->userRole($user), ['admin_cabang', 'superadmin'], true)
        );
    }

    private function registerPurchaseOrderGates(): void
    {
        Gate::define('create-po', fn ($user) =>
            in_array($this->userRole($user), [
                'staff_purchasing',
                'admin_cabang',
                'admin_purchasing',
                'superadmin',
            ], true)
        );

        Gate::define('view-po', function ($user, $po = null) {
            $role = $this->userRole($user);

            if (in_array($role, ['superadmin', 'admin_purchasing'], true)) {
                return true;
            }

            if ($po !== null) {
                return (int) $this->userBranchId($user) === (int) $po->branch_id;
            }

            return in_array($role, ['admin_cabang', 'staff_purchasing'], true);
        });

        Gate::define('edit-po-items', function ($user, $po) {
            $role = $this->userRole($user);

            if ($role === 'superadmin') {
                return true;
            }

            return (int) $this->userBranchId($user) === (int) $po->branch_id
                && in_array($role, ['staff_purchasing', 'admin_cabang'], true);
        });

        Gate::define('submit-po', function ($user, $po) {
            $role = $this->userRole($user);

            if ($role === 'superadmin') {
                return true;
            }

            return (int) $this->userBranchId($user) === (int) $po->branch_id
                && in_array($role, ['staff_purchasing', 'admin_cabang'], true);
        });

        Gate::define('approve-po', fn ($user, $po = null) =>
            in_array($this->userRole($user), ['admin_purchasing', 'superadmin'], true)
        );

        Gate::define('reject-po', fn ($user, $po = null) =>
            in_array($this->userRole($user), ['admin_purchasing', 'superadmin'], true)
        );

        Gate::define('receive-po', function ($user, $po) {
            $role = $this->userRole($user);

            if ($role === 'superadmin') {
                return true;
            }

            return (int) $this->userBranchId($user) === (int) $po->branch_id
                && in_array($role, ['admin_cabang', 'staff_purchasing'], true);
        });

        Gate::define('cancel-po', function ($user, $po) {
            $role = $this->userRole($user);

            if (in_array($role, ['admin_purchasing', 'superadmin'], true)) {
                return true;
            }

            return (int) $this->userBranchId($user) === (int) $po->branch_id
                && in_array($role, ['admin_cabang', 'staff_purchasing'], true);
        });

        Gate::define('manage-vendor', fn ($user) =>
            in_array($this->userRole($user), ['admin_purchasing', 'superadmin'], true)
        );

        Gate::define('view-vendor', fn ($user) =>
            in_array($this->userRole($user), [
                'admin_purchasing',
                'staff_purchasing',
                'admin_cabang',
                'superadmin',
            ], true)
        );

        Gate::define('manage-item', fn ($user) =>
            in_array($this->userRole($user), ['admin_purchasing', 'superadmin'], true)
        );

        Gate::define('view-item', fn ($user) =>
            in_array($this->userRole($user), [
                'admin_purchasing',
                'staff_purchasing',
                'admin_cabang',
                'superadmin',
            ], true)
        );
    }

    /**
     * Auth user dari middleware disimpan sebagai array, bukan Eloquent model.
     */
    private function userRole(mixed $user): ?string
    {
        if (is_array($user)) {
            return $user['role'] ?? null;
        }

        return $user->role ?? null;
    }

    private function userBranchId(mixed $user): ?int
    {
        if (is_array($user)) {
            return isset($user['branch_id']) ? (int) $user['branch_id'] : null;
        }

        return isset($user->branch_id) ? (int) $user->branch_id : null;
    }
}
