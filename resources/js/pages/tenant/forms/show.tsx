import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  Edit, 
  Eye,
  Users,
  CheckCircle,
  Circle,
  Calendar,
  Clock,
  FileText,
  BarChart3,
  TrendingUp,
  Download
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

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

interface Form {
  id: string;
  name: string;
  type: string;
  schema: FormField[] | FormSchema;
  created_at: string;
  updated_at: string;
}

interface FormResponse {
  id: string;
  response_data: any;
  is_submitted: boolean;
  submitted_at: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  job: {
    id: string;
    title: string;
  } | null;
}

interface ResponseStats {
  total: number;
  submitted: number;
  draft: number;
  this_week: number;
  this_month: number;
}

interface CompletionData {
  date: string;
  total: number;
  submitted: number;
}

interface Props {
  form: Form;
  responseStats: ResponseStats;
  recentResponses: FormResponse[];
  completionData: CompletionData[];
}

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

export default function Show({ form, responseStats, recentResponses, completionData }: Props) {
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

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
      case 'textarea':
        return '📝';
      case 'number':
        return '#️⃣';
      case 'email':
        return '📧';
      case 'phone':
        return '📞';
      case 'date':
      case 'datetime':
        return '📅';
      case 'select':
      case 'radio':
        return '🔽';
      case 'checkbox':
        return '☑️';
      case 'file':
        return '📎';
      default:
        return '❓';
    }
  };

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className="w-full p-2 border rounded"
            placeholder={field.placeholder}
            disabled
            rows={3}
          />
        );
      case 'select':
        return (
          <select className="w-full p-2 border rounded" disabled>
            <option>Select an option...</option>
            {field.options?.filter(option => option && option.trim() !== '').map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.filter(option => option && option.trim() !== '').map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="radio" name={field.id} disabled />
                <label>{option}</label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.filter(option => option && option.trim() !== '').map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="checkbox" disabled />
                <label>{option}</label>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <input
            type={field.type === 'datetime' ? 'datetime-local' : field.type}
            className="w-full p-2 border rounded"
            placeholder={field.placeholder}
            disabled
          />
        );
    }
  };

  const completionRate = responseStats.total > 0 ? 
    Math.round((responseStats.submitted / responseStats.total) * 100) : 0;

  return (
    <AppLayout>
      <Head title={`Form: ${form.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={route('tenant.forms.index')}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Forms
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{form.name}</h1>
              <Badge className={`${getTypeColor(form.type)} text-white`}>
                {form.type ? form.type.charAt(0).toUpperCase() + form.type.slice(1) : 'N/A'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Form details, responses, and analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={route('tenant.form-responses.index', form.id)}>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                View Responses
              </Button>
            </Link>
            <Link href={route('tenant.forms.edit', form.id)}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Form
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseStats.submitted}</div>
              <p className="text-xs text-muted-foreground">
                {completionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Circle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseStats.draft}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseStats.this_week}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseStats.this_month}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Form Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Form Preview</TabsTrigger>
                <TabsTrigger value="responses">Responses ({responseStats.total})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview">
                <div className="space-y-6">
                  {/* Form Info */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Form Type</h4>
                      <Badge className={`mt-1 ${getTypeColor(form.type)} text-white`}>
                        {form.type ? form.type.charAt(0).toUpperCase() + form.type.slice(1) : 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Total Fields</h4>
                      <p className="mt-1 font-medium">{getAllFields(form.schema).length} fields</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Created Date</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p>{form.created_at ? new Date(form.created_at).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields Preview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Form Fields</h3>
                    {hasSchema(form.schema) && form.schema.sections && Array.isArray(form.schema.sections) ? (
                      <div className="space-y-6">
                        {form.schema.sections.map((section: FormSection, sectionIndex: number) => (
                          <div key={sectionIndex} className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-700 border-b pb-2">{section.title}</h4>
                            {section.fields && section.fields.length > 0 ? (
                              <div className="space-y-4">
                                {section.fields.map((field: FormField, fieldIndex: number) => (
                                  <Card key={`${sectionIndex}-${fieldIndex}`} className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">{getFieldTypeIcon(field.type)}</span>
                                        <h5 className="font-medium">{field.label}</h5>
                                        {field.required && (
                                          <Badge variant="destructive" className="text-xs">Required</Badge>
                                        )}
                                      </div>
                                      {renderFieldPreview(field)}
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground text-sm">
                                No fields in this section.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : Array.isArray(form.schema) && form.schema.length > 0 ? (
                      <div className="space-y-4">
                        {form.schema.map((field: FormField, index: number) => (
                          <Card key={field.id || index} className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getFieldTypeIcon(field.type)}</span>
                                <h4 className="font-medium">{field.label}</h4>
                                {field.required && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                              </div>
                              {renderFieldPreview(field)}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No fields configured for this form.
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="responses">
                {recentResponses && recentResponses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentResponses.map((response) => (
                        <TableRow key={response.id}>
                          <TableCell>
                            {response.user ? (
                              <div>
                                <div className="font-medium">{response.user.name}</div>
                                <div className="text-sm text-muted-foreground">{response.user.email}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No user</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {response.job ? (
                              <div className="font-medium">{response.job.title}</div>
                            ) : (
                              <span className="text-muted-foreground">No job</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={response.is_submitted ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                              {response.is_submitted ? 'Submitted' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {response.submitted_at ? 
                              new Date(response.submitted_at).toLocaleDateString() : 
                              'Not submitted'
                            }
                          </TableCell>
                          <TableCell>
                            {response.created_at ? new Date(response.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Link href={route('tenant.form-responses.show', [form.id, response.id])}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                    <p>When users submit this form, their responses will appear here.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  {/* Response Rate Chart Area */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Response Trends (Last 30 Days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {completionData && completionData.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Completion Rate</h4>
                              <div className="text-2xl font-bold">{completionRate}%</div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Average Daily Responses</h4>
                              <div className="text-2xl font-bold">
                                {Math.round(completionData.reduce((acc, curr) => acc + curr.total, 0) / completionData.length)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Daily Breakdown</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {completionData.map((day, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{day.submitted}/{day.total}</Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {day.total > 0 ? Math.round((day.submitted / day.total) * 100) : 0}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No analytics data</h3>
                          <p>Analytics will be available once responses are submitted.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Form Field Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Field Analysis</CardTitle>
                      <CardDescription>Overview of form field configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Fields</h4>
                            <div className="text-2xl font-bold">{getAllFields(form.schema).length}</div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Required Fields</h4>
                            <div className="text-2xl font-bold">
                              {getAllFields(form.schema).filter(field => field.required).length}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Optional Fields</h4>
                            <div className="text-2xl font-bold">
                              {getAllFields(form.schema).filter(field => !field.required).length}
                            </div>
                          </div>
                        </div>

                        {getAllFields(form.schema).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Field Types</h4>
                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                              {Object.entries(
                                getAllFields(form.schema).reduce((acc: any, field: FormField) => {
                                  acc[field.type] = (acc[field.type] || 0) + 1;
                                  return acc;
                                }, {})
                              ).map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <span className="text-sm capitalize">{type}</span>
                                  <Badge variant="outline">{count as number}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}