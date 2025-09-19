import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    ArrowLeft, 
    Search, 
    Plus, 
    Download, 
    Eye, 
    Edit, 
    Trash2, 
    MoreHorizontal,
    Filter,
    ArrowUpDown
} from 'lucide-react';
import { Form, FormResponse, PaginatedData } from '@/types';

interface Props {
    form: Form;
    responses: PaginatedData<FormResponse>;
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        direction?: string;
    };
}

export default function Index({ form, responses, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = () => {
        const statusValue = status === 'all' ? '' : status;
        router.get(route('tenant.form-responses.index', form.id), {
            search,
            status: statusValue,
            sort: filters.sort,
            direction: filters.direction,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (column: string) => {
        const newDirection = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('tenant.form-responses.index', form.id), {
            ...filters,
            sort: column,
            direction: newDirection,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = () => {
        window.open(route('tenant.form-responses.export', form.id));
    };

    const handleDelete = (response: FormResponse) => {
        if (confirm('Are you sure you want to delete this response?')) {
            router.delete(route('tenant.form-responses.destroy', [form.id, response.id]), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (response: FormResponse) => {
        if (response.is_submitted) {
            return <Badge variant="default">Submitted</Badge>;
        }
        return <Badge variant="secondary">Draft</Badge>;
    };

    const getSortIcon = (column: string) => {
        if (filters.sort === column) {
            return filters.direction === 'asc' ? '↑' : '↓';
        }
        return <ArrowUpDown className="h-4 w-4" />;
    };

    return (
        <AppLayout>
            <Head title={`${form.name} - Responses`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('tenant.forms.index'))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Forms
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{form.name}</h1>
                            <p className="text-gray-600">Form Responses</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            disabled={responses.data.length === 0}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button asChild>
                            <Link href={route('tenant.form-responses.create', form.id)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Fill Form
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Form Info */}
                <div className="bg-white p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Form Type</p>
                            <p className="text-sm">{form.type}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Responses</p>
                            <p className="text-sm">{responses.data.length}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Submitted</p>
                            <p className="text-sm">
                                {responses.data.filter(r => r.is_submitted).length}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Drafts</p>
                            <p className="text-sm">
                                {responses.data.filter(r => !r.is_submitted).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search by user name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-48">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSearch}>
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead 
                                    className="cursor-pointer"
                                    onClick={() => handleSort('created_at')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Date</span>
                                        {getSortIcon('created_at')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="cursor-pointer"
                                    onClick={() => handleSort('user_id')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>User</span>
                                        {getSortIcon('user_id')}
                                    </div>
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead 
                                    className="cursor-pointer"
                                    onClick={() => handleSort('submitted_at')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Submitted</span>
                                        {getSortIcon('submitted_at')}
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {responses.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <div className="text-gray-500">
                                            <p className="text-lg font-medium">No responses found</p>
                                            <p className="text-sm">Be the first to fill out this form!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                responses.data.map((response) => (
                                    <TableRow key={response.id}>
                                        <TableCell>
                                            {new Date(response.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{response.user?.name}</p>
                                                <p className="text-sm text-gray-500">{response.user?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(response)}
                                        </TableCell>
                                        <TableCell>
                                            {response.submitted_at ? (
                                                new Date(response.submitted_at).toLocaleDateString()
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={route('tenant.form-responses.show', [form.id, response.id])}
                                                            className="flex items-center"
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {!response.is_submitted && (
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={route('tenant.form-responses.edit', [form.id, response.id])}
                                                                className="flex items-center"
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(response)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {responses.meta && responses.meta.last_page > 1 && (
                    <div className="flex justify-center">
                        <nav className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!responses.links.prev}
                                onClick={() => responses.links.prev && router.visit(responses.links.prev)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {responses.meta.current_page} of {responses.meta.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!responses.links.next}
                                onClick={() => responses.links.next && router.visit(responses.links.next)}
                            >
                                Next
                            </Button>
                        </nav>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}