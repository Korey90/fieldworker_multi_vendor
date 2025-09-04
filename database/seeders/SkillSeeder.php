<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            // Technical skills
            ['name' => 'Electrical Work', 'category' => 'Technical', 'description' => 'Electrical installations and repairs'],
            ['name' => 'Plumbing', 'category' => 'Technical', 'description' => 'Water systems installation and maintenance'],
            ['name' => 'HVAC', 'category' => 'Technical', 'description' => 'Heating, ventilation, and air conditioning'],
            ['name' => 'Welding', 'category' => 'Technical', 'description' => 'Metal joining and fabrication'],
            ['name' => 'Carpentry', 'category' => 'Technical', 'description' => 'Wood construction and repair'],
            ['name' => 'Masonry', 'category' => 'Technical', 'description' => 'Stone and brick work'],
            ['name' => 'Painting', 'category' => 'Technical', 'description' => 'Surface coating and finishing'],
            
            // Safety skills
            ['name' => 'First Aid', 'category' => 'Safety', 'description' => 'Emergency medical response'],
            ['name' => 'Height Safety', 'category' => 'Safety', 'description' => 'Working at heights safely'],
            ['name' => 'Confined Space', 'category' => 'Safety', 'description' => 'Working in confined spaces'],
            ['name' => 'Hazmat Handling', 'category' => 'Safety', 'description' => 'Hazardous materials handling'],
            
            // Equipment operation
            ['name' => 'Forklift Operation', 'category' => 'Equipment', 'description' => 'Operating forklift trucks'],
            ['name' => 'Crane Operation', 'category' => 'Equipment', 'description' => 'Operating lifting equipment'],
            ['name' => 'Excavator Operation', 'category' => 'Equipment', 'description' => 'Operating excavation machinery'],
            ['name' => 'Power Tools', 'category' => 'Equipment', 'description' => 'Using various power tools'],
            
            // IT and Communication
            ['name' => 'Mobile Apps', 'category' => 'Technology', 'description' => 'Using mobile applications'],
            ['name' => 'GPS Navigation', 'category' => 'Technology', 'description' => 'GPS and navigation systems'],
            ['name' => 'Digital Photography', 'category' => 'Technology', 'description' => 'Taking and managing digital photos'],
            ['name' => 'Radio Communication', 'category' => 'Technology', 'description' => 'Two-way radio systems'],
            
            // Soft skills
            ['name' => 'Customer Service', 'category' => 'Communication', 'description' => 'Interacting with customers'],
            ['name' => 'Team Leadership', 'category' => 'Leadership', 'description' => 'Leading work teams'],
            ['name' => 'Problem Solving', 'category' => 'Analytical', 'description' => 'Identifying and solving problems'],
            ['name' => 'Time Management', 'category' => 'Organization', 'description' => 'Managing work schedules'],
        ];

        foreach ($skills as $skill) {
            Skill::create($skill);
        }
    }
}
