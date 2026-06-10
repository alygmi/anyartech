<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Employee;
use App\Models\Position;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Cabang
        $pusat = Branch::firstOrCreate(['code' => 'PST'], [
            'name'      => 'Kantor Pusat',
            'address'   => 'Jl. Sudirman No. 1, Jakarta',
            'parent_id' => null,
            'is_active' => true,
        ]);

        $bandung = Branch::firstOrCreate(['code' => 'BDG-01'], [
            'name'      => 'Cabang Bandung',
            'address'   => 'Jl. Asia Afrika No. 10, Bandung',
            'parent_id' => $pusat->id,
            'is_active' => true,
        ]);

        Branch::firstOrCreate(['code' => 'TSM-01'], [
            'name'      => 'Cabang Tasikmalaya',
            'address'   => 'Jl. HZ. Mustofa No. 5, Tasikmalaya',
            'parent_id' => $bandung->id,
            'is_active' => true,
        ]);

        // Jabatan
        $direktur = Position::firstOrCreate(['code' => 'DIR'], [
            'name'      => 'Direktur',
            'parent_id' => null,
            'is_active' => true,
        ]);

        $manager = Position::firstOrCreate(['code' => 'MGR'], [
            'name'      => 'Manager',
            'parent_id' => $direktur->id,
            'is_active' => true,
        ]);

        Position::firstOrCreate(['code' => 'STF'], [
            'name'      => 'Staff',
            'parent_id' => $manager->id,
            'is_active' => true,
        ]);

        // Sample employee
        Employee::firstOrCreate(['nik' => 'EMP-0001'], [
            'name'          => 'Budi Santoso',
            'email'         => 'budi@anyartech.com',
            'gender'        => 'male',
            'branch_id'     => $pusat->id,
            'position_id'   => $direktur->id,
            'contract_type' => 'permanent',
            'join_date'     => '2020-01-01',
            'is_active'     => true,
        ]);

        $this->command->info('✅ Seeder Employee Service selesai.');
    }
}
