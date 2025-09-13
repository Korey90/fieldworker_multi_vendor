import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon } from 'lucide-react';

interface SkillCreateProps {
    categories: string[];
    skillTypes: string[];
}

export default function SkillCreate({ categories, skillTypes }: SkillCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        category: '',
        skill_type: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.skills.store'));
    };

    return (
        <AppLayout>
            <Head title="Admin - Create Skill" />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href={route('admin.skills.index')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back to Skills
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold">Create New Skill</h1>
                    <p className="text-gray-600">Add a new skill to the system</p>
                </div>

                {/* Form */}
                <div className="max-w-2xl">
                    <Card className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <Label htmlFor="name">Skill Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                    placeholder="e.g., Welding, JavaScript, Customer Service"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    className={errors.description ? 'border-red-500' : ''}
                                    placeholder="Describe the skill and its requirements..."
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <div className="flex gap-2">
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className={`flex-1 border rounded px-3 py-2 ${errors.category ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Select or type new category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    type="text"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className={`mt-2 ${errors.category ? 'border-red-500' : ''}`}
                                    placeholder="Or type a new category"
                                />
                                {errors.category && (
                                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Examples: Technical, Soft Skills, Safety, Communication
                                </p>
                            </div>

                            {/* Skill Type */}
                            <div>
                                <Label htmlFor="skill_type">Skill Type *</Label>
                                <div className="flex gap-2">
                                    <select
                                        id="skill_type"
                                        value={data.skill_type}
                                        onChange={(e) => setData('skill_type', e.target.value)}
                                        className={`flex-1 border rounded px-3 py-2 ${errors.skill_type ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Select or type new type</option>
                                        {skillTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    type="text"
                                    value={data.skill_type}
                                    onChange={(e) => setData('skill_type', e.target.value)}
                                    className={`mt-2 ${errors.skill_type ? 'border-red-500' : ''}`}
                                    placeholder="Or type a new skill type"
                                />
                                {errors.skill_type && (
                                    <p className="text-red-500 text-sm mt-1">{errors.skill_type}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Examples: Core, Specialized, Certification Required, Optional
                                </p>
                            </div>

                            {/* Status */}
                            <div>
                                <Label htmlFor="is_active">Status</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="is_active" className="text-sm">
                                        Active (skill can be assigned to workers)
                                    </label>
                                </div>
                                {errors.is_active && (
                                    <p className="text-red-500 text-sm mt-1">{errors.is_active}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t">
                                <Link href={route('admin.skills.index')}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Skill'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Guidelines */}
                <Card className="p-6 mt-6 max-w-2xl">
                    <h3 className="font-semibold mb-3">📋 Skill Creation Guidelines</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div>• <strong>Name:</strong> Use clear, descriptive names that workers will understand</div>
                        <div>• <strong>Category:</strong> Group related skills together (Technical, Safety, Communication, etc.)</div>
                        <div>• <strong>Type:</strong> Specify if skill is core requirement, specialized, or optional</div>
                        <div>• <strong>Description:</strong> Include requirements, proficiency levels, or certifications needed</div>
                        <div>• <strong>Status:</strong> Only active skills can be assigned to workers</div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}