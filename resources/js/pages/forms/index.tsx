import { Form, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Copy, 
    Trash2, 
    Grid3X3, 
    List,
    Calendar,
    FileText,
    Users
} from 'lucide-react';

interface Props {
    forms: PaginatedData<Form>;
    types: string[];
    filters: {
        search?: string;
        type?: string;
        sort?: string;
        direction?: string;
    };
}

export default function FormsIndex({ forms, types, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/admin/forms', {
            search: value,
            type: selectedType,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleTypeFilter = (value: string) => {
        setSelectedType(value);
        router.get('/admin/forms', {
            search,
            type: value === 'all' ? '' : value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (column: string) => {
        const direction = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get('/admin/forms', {
            ...filters,
            sort: column,
            direction,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (form: Form) => {
        if (confirm('Are you sure you want to delete this form?')) {
            router.delete(`/admin/forms/${form.id}`);
        }
    };

    const handleDuplicate = (form: Form) => {
        router.post(`/admin/forms/${form.id}/duplicate`);
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'job': 'bg-blue-100 text-blue-800',
            'inspection': 'bg-green-100 text-green-800',
            'maintenance': 'bg-yellow-100 text-yellow-800',
            'safety': 'bg-red-100 text-red-800',
            'customer_feedback': 'bg-purple-100 text-purple-800',
            'default': 'bg-gray-100 text-gray-800',
        };
        return colors[type] || colors.default;
    };

    const TableView = () => (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-gray-50/50">
                            <tr>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('name')}
                                >
                                    Name
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('type')}
                                >
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fields
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Responses
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('created_at')}
                                >
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {forms.data.map((form) => (
                                <tr key={form.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">
                                            <Link 
                                                href={`/admin/forms/${form.id}`}
                                                className="hover:underline"
                                            >
                                                {form.name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge className={getTypeColor(form.type)}>
                                            {form.type.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <FileText className="h-4 w-4 mr-1" />
                                            {form.fields_count || 0} fields
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Users className="h-4 w-4 mr-1" />
                                            {form.responses_count || 0} responses
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(form.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/forms/${form.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/forms/${form.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDuplicate(form)}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => handleDelete(form)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );

    const GridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.data.map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">
                                    <Link 
                                        href={`/admin/forms/${form.id}`}
                                        className="hover:underline"
                                    >
                                        {form.name}
                                    </Link>
                                </CardTitle>
                                <Badge className={getTypeColor(form.type)}>
                                    {form.type.replace('_', ' ')}
                                </Badge>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/forms/${form.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/forms/${form.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDuplicate(form)}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={() => handleDelete(form)}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-1" />
                                    {form.fields_count || 0} fields
                                </div>
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {form.responses_count || 0} responses
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                Created {new Date(form.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    const breadcrumbs = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Forms', href: '/admin/forms' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Forms" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Forms</h1>
                        <p className="text-gray-600">
                            Manage dynamic forms and form builder
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/forms/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Form
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search forms..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={selectedType} onValueChange={handleTypeFilter}>
                                <SelectTrigger className="w-48">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    {types.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content */}
                {viewMode === 'table' ? <TableView /> : <GridView />}

                {/* Pagination */}
                {forms.meta && forms.meta.total > forms.meta.per_page && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {forms.meta.from} to {forms.meta.to} of {forms.meta.total} forms
                        </div>
                        <div className="flex items-center gap-2">
                            {forms.links.prev && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={forms.links.prev}>Previous</Link>
                                </Button>
                            )}
                            {forms.links.next && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={forms.links.next}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}