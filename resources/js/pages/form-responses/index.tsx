import { FormResponse, Form, User, PaginatedData } from '@/types';
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
import { 
    Plus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2, 
    Grid3X3, 
    List,
    Calendar,
    FileText,
    Users,
    CheckCircle,
    Clock,
    Download,
    Send
} from 'lucide-react';

interface Props {
    responses: PaginatedData<FormResponse>;
    forms: Form[];
    users: User[];
    filters: {
        search?: string;
        form_id?: string;
        user_id?: string;
        is_submitted?: boolean;
        sort?: string;
        direction?: string;
    };
}

export default function FormResponsesIndex({ responses, forms, users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedForm, setSelectedForm] = useState(filters.form_id || '');
    const [selectedUser, setSelectedUser] = useState(filters.user_id || '');
    const [submissionStatus, setSubmissionStatus] = useState(
        filters.is_submitted !== undefined ? String(filters.is_submitted) : ''
    );
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/admin/form-responses', {
            search: value,
            form_id: selectedForm,
            user_id: selectedUser,
            is_submitted: submissionStatus,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFormFilter = (value: string) => {
        setSelectedForm(value);
        router.get('/admin/form-responses', {
            search,
            form_id: value === 'all' ? '' : value,
            user_id: selectedUser,
            is_submitted: submissionStatus,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleUserFilter = (value: string) => {
        setSelectedUser(value);
        router.get('/admin/form-responses', {
            search,
            form_id: selectedForm,
            user_id: value === 'all' ? '' : value,
            is_submitted: submissionStatus,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (value: string) => {
        setSubmissionStatus(value);
        router.get('/admin/form-responses', {
            search,
            form_id: selectedForm,
            user_id: selectedUser,
            is_submitted: value === 'all' ? '' : value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (column: string) => {
        const direction = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get('/admin/form-responses', {
            ...filters,
            sort: column,
            direction,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (response: FormResponse) => {
        if (confirm('Are you sure you want to delete this response?')) {
            router.delete(`/admin/form-responses/${response.id}`);
        }
    };

    const handleSubmit = (response: FormResponse) => {
        if (confirm('Are you sure you want to submit this response?')) {
            router.post(`/admin/form-responses/${response.id}/submit`);
        }
    };

    const getStatusColor = (isSubmitted: boolean) => {
        return isSubmitted 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800';
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
                                    onClick={() => handleSort('form')}
                                >
                                    Form
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('user')}
                                >
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fields
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
                            {responses.data.map((response) => (
                                <tr key={response.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">
                                            <Link 
                                                href={`/admin/forms/${response.form?.id}`}
                                                className="hover:underline"
                                            >
                                                {response.form?.name || 'Unknown Form'}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {response.user?.name || 'Unknown User'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge className={getStatusColor(response.is_submitted)}>
                                            {response.is_submitted ? (
                                                <><CheckCircle className="h-3 w-3 mr-1" /> Submitted</>
                                            ) : (
                                                <><Clock className="h-3 w-3 mr-1" /> Draft</>
                                            )}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <FileText className="h-4 w-4 mr-1" />
                                            {response.fields_count || 0} fields
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(response.created_at).toLocaleDateString()}
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
                                                    <Link href={`/admin/form-responses/${response.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                {!response.is_submitted && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/form-responses/${response.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSubmit(response)}>
                                                            <Send className="mr-2 h-4 w-4" />
                                                            Submit
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => handleDelete(response)}
                                                    className="text-red-600 focus:text-red-600"
                                                    disabled={response.is_submitted}
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
            {responses.data.map((response) => (
                <Card key={response.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">
                                    <Link 
                                        href={`/admin/form-responses/${response.id}`}
                                        className="hover:underline"
                                    >
                                        {response.form?.name || 'Unknown Form'}
                                    </Link>
                                </CardTitle>
                                <Badge className={getStatusColor(response.is_submitted)}>
                                    {response.is_submitted ? (
                                        <><CheckCircle className="h-3 w-3 mr-1" /> Submitted</>
                                    ) : (
                                        <><Clock className="h-3 w-3 mr-1" /> Draft</>
                                    )}
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
                                        <Link href={`/admin/form-responses/${response.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Link>
                                    </DropdownMenuItem>
                                    {!response.is_submitted && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/form-responses/${response.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSubmit(response)}>
                                                <Send className="mr-2 h-4 w-4" />
                                                Submit
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={() => handleDelete(response)}
                                        className="text-red-600 focus:text-red-600"
                                        disabled={response.is_submitted}
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
                            <div className="text-sm text-gray-900">
                                <strong>User:</strong> {response.user?.name || 'Unknown'}
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-1" />
                                    {response.fields_count || 0} fields
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {new Date(response.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            {response.submitted_at && (
                                <div className="text-xs text-gray-500">
                                    Submitted: {new Date(response.submitted_at).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Form Responses', href: '/admin/form-responses' },
            ]}
        >
            <Head title="Form Responses" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Form Responses</h1>
                        <p className="text-gray-600">
                            Manage form submissions and data collection
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button asChild>
                            <Link href="/admin/form-responses/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Response
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search responses..."
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={selectedForm} onValueChange={handleFormFilter}>
                                <SelectTrigger className="w-48">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by form" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All forms</SelectItem>
                                    {forms.map((form) => (
                                        <SelectItem key={form.id} value={form.id}>
                                            {form.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedUser} onValueChange={handleUserFilter}>
                                <SelectTrigger className="w-48">
                                    <Users className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by user" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All users</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={submissionStatus} onValueChange={handleStatusFilter}>
                                <SelectTrigger className="w-48">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="true">Submitted</SelectItem>
                                    <SelectItem value="false">Draft</SelectItem>
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
                {responses.meta && responses.meta.total > responses.meta.per_page && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {responses.meta.from} to {responses.meta.to} of {responses.meta.total} responses
                        </div>
                        <div className="flex items-center gap-2">
                            {responses.links.prev && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={responses.links.prev}>Previous</Link>
                                </Button>
                            )}
                            {responses.links.next && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={responses.links.next}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}