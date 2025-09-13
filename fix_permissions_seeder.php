<?php

// Fix PermissionSeeder to include required fields
$file = 'database/seeders/PermissionSeeder.php';
$content = file_get_contents($file);

// Replace all permission arrays to include required fields
$patterns = [
    "/\['name' => '([^']*)', 'key' => '([^']*)', 'slug' => '([^']*)', 'description' => '([^']*)'\]/" => function($matches) {
        $name = $matches[1];
        $key = $matches[2];
        $slug = $matches[3];
        $description = $matches[4];
        
        // Extract permission group from key (e.g., 'users.view' => 'users')
        $group = explode('.', $key)[0];
        $permissionKey = str_replace('.', '_', $key);
        
        return "['name' => '$name', 'key' => '$key', 'permission_key' => '$permissionKey', 'permission_group' => '$group', 'slug' => '$slug', 'description' => '$description']";
    }
];

foreach ($patterns as $pattern => $replacement) {
    $content = preg_replace_callback($pattern, $replacement, $content);
}

file_put_contents($file, $content);
echo "PermissionSeeder fixed successfully!\n";
