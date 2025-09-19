<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TestowyController extends Controller
{
    public function getAllUserData($id)
    {
        // Get user with all available relations
        $user = User::with([
            'tenant',
            'worker' => [
                'tenant',
                'location',
                'skills',
                'jobAssignments' => ['job', 'worker'],
                'currentJob',
                'certifications'
            ],
            'roles' => ['permissions'],
            'permissions',
            'notifications',
            'auditLogs',
            'formResponses' => ['form', 'job']
        ])->find($id);

        if (!$user) {
            return response()->json([
                'error' => 'User not found'
            ], 404);
        }

        return response()->json([
            'user' => $user,
            'computed_permissions' => $user->getAllPermissions(),
        ]);
    }

    public function showUserProfile($id)
    {
        // Get user with all available relations
        $user = User::with([
            'tenant',
            'worker' => [
                'tenant',
                'location',
                'skills',
                'jobAssignments' => ['job', 'worker'],
                'currentJob',
                'certifications'
            ],
            'roles' => ['permissions'],
            'permissions',
            'notifications',
            'auditLogs',
            'formResponses' => ['form', 'job']
        ])->find($id);

        if (!$user) {
            abort(404, 'User not found');
        }

        $userData = [
            'user' => $user,
            'computed_permissions' => $user->getAllPermissions(),
        ];

        return Inertia::render('UserProfile', [
            'userData' => $userData
        ]);
    }

}
