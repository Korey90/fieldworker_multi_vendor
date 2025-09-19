import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Users,
  CheckCircle,
  Circle,
  Calendar
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Form {
  id: string;
  name: string;
  type: string;
  schema: any[];
  created_at: string;
  updated_at: string;
  responses?: {
    total_responses: number;
    submitted_responses: number;
  }[];
}

interface FormField {
  id?: string;
  name?: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface FormSection {
  title: string;
  fields: FormField[];
}

interface FormSchema {
  sections?: FormSection[];
}

interface Stats {
  total_forms: number;
  total_responses: number;
  submitted_responses: number;
  draft_responses: number;
}

interface Props {
  forms: {
    data: Form[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
    links: {
      first: string;
      last: string;
      prev: string | null;
      next: string | null;
    };
  };
  formTypes: string[];
  stats: Stats;
  filters: {
    search?: string;
    type?: string;
    sort_by?: string;
    sort_direction?: string;
  };
}

export default function Index({ forms, formTypes, stats, filters }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    type: filters.type || '__all__',
    sort_by: filters.sort_by || 'created_at',
    sort_direction: filters.sort_direction || 'desc',
  });

  const handleSearch = () => {
    const searchParams = {
      ...localFilters,
      search: localFilters.search || undefined,
      type: localFilters.type === '__all__' ? undefined : localFilters.type,
    };
    
    router.get(route('tenant.forms.index'), searchParams, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setLocalFilters({
      search: '',
      type: '__all__',
      sort_by: 'created_at',
      sort_direction: 'desc',
    });
    
    router.get(route('tenant.forms.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const getTypeColor = (type: string | null | undefined) => {
    if (!type) return 'bg-gray-500';
    const colors = {
      inspection: 'bg-blue-500',
      maintenance: 'bg-orange-500',
      safety: 'bg-red-500',
      quality: 'bg-green-500',
      feedback: 'bg-purple-500',
      report: 'bg-yellow-500',
      custom: 'bg-gray-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getFormStats = (form: Form) => {
    const response = form.responses?.[0];
    return {
      total: response?.total_responses || 0,
      submitted: response?.submitted_responses || 0,
    };
  };

  const handleDelete = (formId: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      router.delete(route('tenant.forms.destroy', formId));
    }
  };

  // Helper function to check if schema has sections
const hasSchema = (schema: FormField[] | FormSchema): schema is FormSchema => {
  return schema && typeof schema === 'object' && 'sections' in schema;
};

  // Helper function to get all fields from schema
const getAllFields = (schema: FormField[] | FormSchema): FormField[] => {
  if (Array.isArray(schema)) {
    return schema;
  }
  if (hasSchema(schema) && schema.sections) {
    return schema.sections.flatMap(section => section.fields || []);
  }
  return [];
};

  return (
    <AppLayout>
      <Head title="Forms" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
            <p className="text-muted-foreground">
              Create and manage forms for your organization
            </p>
          </div>
          <Link href={route('tenant.forms.create')}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_forms}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_responses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.submitted_responses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Circle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft_responses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search forms..."
                    value={localFilters.search}
                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="w-full md:w-48">
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={localFilters.type}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All types</SelectItem>
                    {formTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-40">
                <label className="text-sm font-medium mb-2 block">Sort by</label>
                <Select
                  value={localFilters.sort_by}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, sort_by: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="updated_at">Updated Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch}>
                  <Filter className="mr-2 h-4 w-4" />
                  Apply
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Toggle & Results */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {forms.data.length} of {forms.meta?.total || 0} forms
          </div>
        </div>

        {/* Forms Grid/Table */}
        {forms.data.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {forms.data.map((form) => {
                const stats = getFormStats(form);
                return (
                  <Card key={form.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{form.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getTypeColor(form.type)} text-white`}>
                              {form.type ? form.type.charAt(0).toUpperCase() + form.type.slice(1) : 'N/A'}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={route('tenant.forms.show', form.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={route('tenant.form-responses.index', form.id)}>
                                <Users className="mr-2 h-4 w-4" />
                                Responses
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={route('tenant.forms.edit', form.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(form.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          {getAllFields(form.schema)?.length || 'no data'} fields
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Responses:</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {stats.submitted}/{stats.total}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Fields</th>
                        <th className="text-left p-4 font-medium">Responses</th>
                        <th className="text-left p-4 font-medium">Created</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms.data.map((form) => {
                        const stats = getFormStats(form);
                        return (
                          <tr key={form.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div className="font-medium">{form.name}</div>
                            </td>
                            <td className="p-4">
                              <Badge className={`${getTypeColor(form.type)} text-white`}>
                                {form.type ? form.type.charAt(0).toUpperCase() + form.type.slice(1) : 'N/A'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="text-muted-foreground">
                                {form.schema?.length || 0} fields
                              </span>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">
                                {stats.submitted}/{stats.total}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="text-muted-foreground">
                                {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={route('tenant.forms.show', form.id)}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={route('tenant.forms.edit', form.id)}>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(form.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              No forms found. <Link href={route('tenant.forms.create')} className="text-primary hover:underline">Create your first form</Link>.
            </AlertDescription>
          </Alert>
        )}

        {/* Pagination */}
        {forms.meta && forms.meta.last_page > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {forms.meta.current_page} of {forms.meta.last_page}
            </div>
            <div className="flex items-center gap-2">
              {forms.links.prev && (
                <Link href={forms.links.prev}>
                  <Button variant="outline" size="sm">Previous</Button>
                </Link>
              )}
              {forms.links.next && (
                <Link href={forms.links.next}>
                  <Button variant="outline" size="sm">Next</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}