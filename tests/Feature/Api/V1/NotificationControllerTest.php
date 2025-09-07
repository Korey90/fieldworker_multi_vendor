<?php

namespace Tests\Feature\Api\V1;

use App\Models\Notification;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $tenant;
    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->tenant = Tenant::factory()->active()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
    }

    public function test_can_list_notifications()
    {
        Sanctum::actingAs($this->user);
        
        Notification::factory(3)->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'message',
                        'type',
                        'is_read',
                        'read_at',
                        'data',
                        'created_at',
                        'updated_at'
                    ]
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total'
                ]
            ]);
    }

    public function test_can_show_single_notification()
    {
        $notification = Notification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'is_read' => false
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/notifications/{$notification->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'message',
                    'type',
                    'is_read',
                    'read_at',
                    'data',
                    'created_at',
                    'updated_at'
                ]
            ])
            ->assertJson([
                'data' => [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type
                ]
            ]);

        // Should mark as read when viewed
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => true
        ]);
    }

    public function test_cannot_show_notification_from_different_tenant()
    {
        $otherTenant = Tenant::factory()->create();
        $otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);
        
        $notification = Notification::factory()->create([
            'tenant_id' => $otherTenant->id,
            'user_id' => $otherUser->id
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/notifications/{$notification->id}");

        $response->assertStatus(404);
    }

    public function test_can_create_notification()
    {
        $targetUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        
        $notificationData = [
            'title' => $this->faker->sentence,
            'message' => $this->faker->paragraph,
            'type' => 'urgent',
            'user_id' => $targetUser->id,
            'data' => ['action' => 'view_document']
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/notifications', $notificationData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Notification created successfully',
                'data' => [
                    'title' => $notificationData['title'],
                    'message' => $notificationData['message'],
                    'type' => $notificationData['type']
                ]
            ]);

        $this->assertDatabaseHas('notifications', [
            'title' => $notificationData['title'],
            'message' => $notificationData['message'],
            'type' => $notificationData['type'],
            'user_id' => $targetUser->id,
            'tenant_id' => $this->tenant->id
        ]);
    }

    public function test_can_delete_notification()
    {
        $notification = Notification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/notifications/{$notification->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Notification deleted successfully'
            ]);

        $this->assertDatabaseMissing('notifications', [
            'id' => $notification->id
        ]);
    }

    public function test_cannot_delete_notification_from_different_tenant()
    {
        $otherTenant = Tenant::factory()->create();
        $otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);
        
        $notification = Notification::factory()->create([
            'tenant_id' => $otherTenant->id,
            'user_id' => $otherUser->id
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/notifications/{$notification->id}");

        $response->assertStatus(404);
    }

    public function test_can_mark_notification_as_read()
    {
        $notification = Notification::factory()->unread()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/notifications/{$notification->id}/mark-read");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Notification marked as read'
            ]);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => true
        ]);
    }

    public function test_can_mark_all_notifications_as_read()
    {
        Notification::factory(3)->unread()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->actingAs($this->user)
            ->patchJson('/api/v1/notifications/mark-all-read');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Marked 3 notifications as read'
            ]);

        $this->assertEquals(0, Notification::where('user_id', $this->user->id)
            ->where('is_read', false)->count());
    }

    public function test_can_get_notification_stats()
    {
        Sanctum::actingAs($this->user);
        
        // Create various notifications
        Notification::factory(2)->emergency()->unread()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);
        Notification::factory(3)->urgent()->read()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson('/api/v1/notifications/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total',
                    'unread',
                    'read',
                    'by_type' => [
                        'emergency',
                        'urgent',
                        'warning',
                        'info'
                    ],
                    'recent'
                ]
            ])
            ->assertJson([
                'data' => [
                    'total' => 5,
                    'unread' => 2,
                    'read' => 3,
                    'by_type' => [
                        'emergency' => 2,
                        'urgent' => 3
                    ]
                ]
            ]);
    }

    public function test_can_get_unread_count()
    {
        Sanctum::actingAs($this->user);
        
        Notification::factory(5)->unread()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);
        Notification::factory(2)->read()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->getJson('/api/v1/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJson([
                'unread_count' => 5
            ]);
    }

    public function test_can_bulk_delete_notifications()
    {
        Sanctum::actingAs($this->user);
        
        $notifications = Notification::factory(3)->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);

        $notificationIds = $notifications->pluck('id')->toArray();

        $response = $this->deleteJson('/api/v1/notifications/bulk-delete', [
                'notification_ids' => $notificationIds
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Deleted 3 notifications'
            ]);

        foreach ($notificationIds as $id) {
            $this->assertDatabaseMissing('notifications', ['id' => $id]);
        }
    }

    public function test_validates_required_fields_on_create()
    {
        Sanctum::actingAs($this->user);
        
        $response = $this->postJson('/api/v1/notifications', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'message', 'type', 'user_id']);
    }

    public function test_validates_notification_type()
    {
        $targetUser = User::factory()->create(['tenant_id' => $this->tenant->id]);
        
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/notifications', [
                'title' => 'Test',
                'message' => 'Test message',
                'type' => 'invalid_type',
                'user_id' => $targetUser->id
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_can_filter_notifications_by_type()
    {
        Notification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'type' => 'emergency'
        ]);
        Notification::factory()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'type' => 'info'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/notifications?type=emergency');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(1, $data);
        $this->assertEquals('emergency', $data[0]['type']);
    }

    public function test_can_filter_notifications_by_read_status()
    {
        Notification::factory()->read()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);
        Notification::factory()->unread()->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/notifications?is_read=false');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(1, $data);
        $this->assertFalse($data[0]['is_read']);
    }

    public function test_requires_authentication()
    {
        $response = $this->getJson('/api/v1/notifications');
        $response->assertStatus(401);
    }

    public function test_lists_only_tenant_notifications()
    {
        // Create notifications for current tenant
        Notification::factory(2)->create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id
        ]);

        // Create notifications for other tenant
        $otherTenant = Tenant::factory()->create();
        $otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);
        Notification::factory(3)->create([
            'tenant_id' => $otherTenant->id,
            'user_id' => $otherUser->id
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/notifications');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        // Should only see notifications from own tenant
        $this->assertCount(2, $data);
        foreach ($data as $notification) {
            $this->assertEquals($this->tenant->id, $notification['tenant']['id']);
        }
    }
}
