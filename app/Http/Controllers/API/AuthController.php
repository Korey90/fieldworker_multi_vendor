<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\TenantRegisterRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Role;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.'
            ], 401);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is not active'
            ], 403);
        }

        // Revoke old tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth-token', ['*'], now()->addDays(7))->plainTextToken;

        // Create audit log
        AuditLog::create([
            'user_id' => $user->id,
            'tenant_id' => $user->tenant_id,
            'action' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Login successful',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
            'token_type' => 'Bearer',
            'expires_in' => 7 * 24 * 60 * 60, // 7 days in seconds
        ]);
    }

    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            // Create tenant first
            $tenant = Tenant::create([
                'name' => $validated['tenant_name'],
                'domain' => Str::slug($validated['tenant_name'], '-') . '.localhost',
                'database_name' => 'tenant_' . Str::random(10),
                'status' => 'active',
            ]);

            // Create user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'tenant_id' => $tenant->id,
                'email_verified_at' => now(), // Auto-verify for simplicity
                'status' => 'active',
            ]);

            // Assign admin role to the first user of tenant
            $user->assignRole('admin');

            // Create token
            $token = $user->createToken('auth-token', ['*'], now()->addDays(7))->plainTextToken;

            // Create audit log
            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'register',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => [
                    'tenant_created' => $tenant->name,
                ],
            ]);

            return response()->json([
                'message' => 'Registration successful',
                'user' => new UserResource($user->load('tenant')),
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'domain' => $tenant->domain,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 7 * 24 * 60 * 60,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => 'Unable to create account. Please try again.',
            ], 422);
        }
    }

    /**
     * Register a new user in an existing tenant
     */
    public function registerInTenant(TenantRegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            // Find the tenant by slug
            $tenant = Tenant::where('slug', $validated['tenant_slug'])->firstOrFail();

            // Create user in existing tenant
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'] ?? null,
                'tenant_id' => $tenant->id,
                'email_verified_at' => now(), // Auto-verify for simplicity
                'is_active' => true,
            ]);

            // Assign default worker role
            $workerRole = Role::where('tenant_id', $tenant->id)
                             ->where('slug', 'worker')
                             ->first();
            if ($workerRole) {
                $user->roles()->attach($workerRole->id);
            }

            // Create token
            $token = $user->createToken('auth-token', ['*'], now()->addDays(7))->plainTextToken;

            // Create audit log
            AuditLog::create([
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
                'action' => 'register_in_tenant',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => [
                    'tenant_slug' => $tenant->slug,
                    'tenant_name' => $tenant->name,
                ],
            ]);

            return response()->json([
                'message' => 'Registration successful',
                'data' => [
                    'user' => new UserResource($user->load('tenant')),
                    'token' => $token,
                ],
                'token_type' => 'Bearer',
                'expires_in' => 7 * 24 * 60 * 60,
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Registration in tenant error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'tenant_slug' => $validated['tenant_slug'] ?? 'unknown'
            ]);
            return response()->json([
                'message' => 'Registration failed',
                'error' => 'Unable to create account. Please try again.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 422);
        }
    }

    /**
     * Logout user and revoke token
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        // Delete current token
        $request->user()->currentAccessToken()->delete();

        // Create audit log
        if ($user) {
            AuditLog::create([
                'user_id' => $user->id,
                'tenant_id' => $user->tenant_id,
                'action' => 'logout',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load(['tenant', 'roles', 'permissions']))
        ]);
    }

    /**
     * Get user profile
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'tenant', 
            'roles.permissions',
            'worker.skills',
            'worker.certifications',
            'notifications' => function ($query) {
                $query->where('is_read', false)->latest()->limit(5);
            }
        ]);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'tenant' => [
                    'id' => $user->tenant->id,
                    'name' => $user->tenant->name,
                    'slug' => $user->tenant->slug ?? null,
                    'status' => $user->tenant->status,
                ],
                'roles' => $user->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'slug' => $role->slug,
                        'permissions' => $role->permissions->pluck('slug'),
                    ];
                }),
                'worker' => $user->worker ? [
                    'id' => $user->worker->id,
                    'employee_number' => $user->worker->employee_number,
                    'hire_date' => $user->worker->hire_date,
                    'status' => $user->worker->status,
                    'skills' => $user->worker->skills->pluck('name'),
                    'certifications' => $user->worker->certifications->map(function ($cert) {
                        return [
                            'name' => $cert->name,
                            'expires_at' => $cert->expires_at,
                        ];
                    }),
                ] : null,
                'unread_notifications_count' => $user->notifications->count(),
            ]
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        // Delete current token
        $request->user()->currentAccessToken()->delete();

        // Create new token
        $token = $user->createToken('auth-token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'message' => 'Token refreshed',
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => 7 * 24 * 60 * 60,
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        // Revoke all tokens except current
        $currentTokenId = $request->user()->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        // Create audit log
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'password_changed',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Update profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        $oldValues = $user->only(['name', 'phone']);
        $user->update($validated);

        // Create audit log
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'profile_updated',
            'old_values' => $oldValues,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => new UserResource($user->fresh())
        ]);
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->validated());

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Password reset link sent to your email'
            ]);
        }

        return response()->json([
            'message' => 'Unable to send password reset link'
        ], 422);
    }

    /**
     * Reset password
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->validated(),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Revoke all tokens
                $user->tokens()->delete();

                event(new PasswordReset($user));

                // Create audit log
                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'password_reset',
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password reset successfully'
            ]);
        }

        return response()->json([
            'message' => 'Invalid or expired reset token'
        ], 422);
    }

    /**
     * Verify email
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'id' => 'required|integer',
            'hash' => 'required|string',
        ]);

        $user = User::findOrFail($request->id);

        if (!hash_equals((string) $request->hash, sha1($user->getEmailForVerification()))) {
            return response()->json([
                'message' => 'Invalid verification link'
            ], 422);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified'
            ]);
        }

        $user->markEmailAsVerified();

        // Create audit log
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'email_verified',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Email verified successfully'
        ]);
    }
}
