import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Skill } from '@/types';
import { SearchIcon, PlusIcon, FilterIcon, GridIcon, ListIcon, EyeIcon, SquarePenIcon, TrashIcon } from 'lucide-react';

interface SkillsIndexProps {
    skills: {
        data: Skill[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: string[];
    skillTypes: string[];
    filters: {
        search?: string;
        category?: string;
        skill_type?: string;
        is_active?: boolean;
    };
}

export default function SkillsIndex({ skills, categories, skillTypes, filters }: SkillsIndexProps) {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilter = (key: string, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        
        // Remove empty filters
        Object.keys(newFilters).forEach(filterKey => {
            const typedKey = filterKey as keyof typeof newFilters;
            if (newFilters[typedKey] === '' || newFilters[typedKey] === null || newFilters[typedKey] === undefined) {
                delete newFilters[typedKey];
            }
        });

        router.get(route('admin.skills.index'), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', localFilters.search);
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('admin.skills.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (skill: Skill) => {
        if (confirm(`Are you sure you want to delete "${skill.name}"?`)) {
            router.delete(route('admin.skills.destroy', skill.id));
        }
    };

    const renderSkillCard = (skill: Skill) => (
        <Card key={skill.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{skill.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Badge variant="secondary">{skill.category}</Badge>
                        <Badge variant="outline">{skill.skill_type}</Badge>
                    </div>
                    {skill.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{skill.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <Link
                        href={route('admin.skills.show', skill.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View details"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('admin.skills.edit', skill.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        title="Edit"
                    >
                        <SquarePenIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(skill)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👥 {skill.workers_count || 0} workers</span>
                    <span>📅 {new Date(skill.created_at).toLocaleDateString()}</span>
                </div>
                <Badge variant={skill.is_active ? "default" : "destructive"}>
                    {skill.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </div>
        </Card>
    );

    const renderSkillRow = (skill: Skill) => (
        <tr key={skill.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">
                <div>
                    <div className="font-medium">{skill.name}</div>
                    {skill.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                            {skill.description}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <Badge variant="secondary">{skill.category}</Badge>
            </td>
            <td className="px-6 py-4">
                <Badge variant="outline">{skill.skill_type}</Badge>
            </td>
            <td className="px-6 py-4 text-center">
                {skill.workers_count || 0}
            </td>
            <td className="px-6 py-4">
                <Badge variant={skill.is_active ? "default" : "destructive"}>
                    {skill.is_active ? 'Active' : 'Inactive'}
                </Badge>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Link
                        href={route('admin.skills.show', skill.id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View details"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('admin.skills.edit', skill.id)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        title="Edit"
                    >
                        <SquarePenIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(skill)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <AppLayout>
            <Head title="Admin - Skills Management" />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Skills Management</h1>
                            <p className="text-gray-600">Manage skills and competencies</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                                >
                                    <ListIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                                >
                                    <GridIcon className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <Link href={route('admin.skills.create')}>
                                <Button className="flex items-center gap-2">
                                    <PlusIcon className="h-4 w-4" />
                                    Add New Skill
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Search skills..."
                                    value={localFilters.search || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                />
                                <Button type="submit" variant="outline" size="sm">
                                    <SearchIcon className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>

                        <div>
                            <select
                                value={localFilters.category || ''}
                                onChange={(e) => handleFilter('category', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={localFilters.skill_type || ''}
                                onChange={(e) => handleFilter('skill_type', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Types</option>
                                {skillTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={localFilters.is_active !== undefined ? localFilters.is_active.toString() : ''}
                                onChange={(e) => handleFilter('is_active', e.target.value === 'true')}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>

                        <div className="flex justify-end">
                            <Button variant="outline" onClick={clearFilters}>
                                <FilterIcon className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{skills.total}</div>
                        <div className="text-sm text-gray-600">Total Skills</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-green-600">{categories.length}</div>
                        <div className="text-sm text-gray-600">Categories</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-purple-600">{skillTypes.length}</div>
                        <div className="text-sm text-gray-600">Skill Types</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                            {skills.data.filter(s => s.is_active).length}
                        </div>
                        <div className="text-sm text-gray-600">Active Skills</div>
                    </Card>
                </div>

                {/* Content */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {skills.data.map(renderSkillCard)}
                    </div>
                ) : (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Skill
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Workers
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {skills.data.map(renderSkillRow)}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Pagination */}
                {skills.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {((skills.current_page - 1) * skills.per_page) + 1} to{' '}
                            {Math.min(skills.current_page * skills.per_page, skills.total)} of{' '}
                            {skills.total} results
                        </div>
                        <div className="flex items-center gap-2">
                            {skills.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => router.get(route('admin.skills.index'), 
                                        { ...filters, page: skills.current_page - 1 })}
                                >
                                    Previous
                                </Button>
                            )}
                            {skills.current_page < skills.last_page && (
                                <Button
                                    variant="outline"
                                    onClick={() => router.get(route('admin.skills.index'), 
                                        { ...filters, page: skills.current_page + 1 })}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* No results */}
                {skills.data.length === 0 && (
                    <Card className="p-8 text-center">
                        <div className="text-gray-500 mb-4">
                            <div className="text-4xl mb-2">🔧</div>
                            <h3 className="text-lg font-medium mb-2">No skills found</h3>
                            <p>Try adjusting your filters or create a new skill.</p>
                        </div>
                        <Link href={route('admin.skills.create')}>
                            <Button>Add First Skill</Button>
                        </Link>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}