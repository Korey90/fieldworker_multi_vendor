import { Form, FormResponse } from '@/types';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Edit, 
    Copy, 
    Trash2, 
    FileText, 
    Users, 
    Calendar, 
    Eye,
    BarChart3,
    Clock,
    CheckCircle,
    AlertCircle,
    Settings
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
    form: Form;
    recentResponses: FormResponse[];
    stats: {
        total_responses: number;
        submitted_responses: number;
        draft_responses: number;
        recent_responses: number;
    };
}

export default function FormShow({ form, recentResponses, stats }: Props) {
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

    const getFieldTypeIcon = (type: string) => {
        const icons: Record<string, any> = {
            'text': FileText,
            'textarea': FileText,
            'number': BarChart3,
            'email': FileText,
            'date': Calendar,
            'datetime-local': Calendar,
            'select': Settings,
            'checkbox': CheckCircle,
            'radio': Settings,
            'file': FileText,
            'signature': Edit,
        };
        const Icon = icons[type] || FileText;
        return <Icon className="h-4 w-4" />;
    };

    const FormSchemaVisualization = () => (
        <div className="space-y-6">
            {form.schema?.sections?.map((section, sectionIndex) => (
                <Card key={sectionIndex}>
                    <CardHeader>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {section.fields.map((field, fieldIndex) => (
                                <div 
                                    key={fieldIndex}
                                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getFieldTypeIcon(field.type)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {field.label}
                                                </h4>
                                                {field.required && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Required
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Field name: {field.name}
                                            </p>
                                            {field.options && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1">Options:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {field.options.map((option, optionIndex) => (
                                                            <Badge 
                                                                key={optionIndex}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {option}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Badge variant="outline" className="text-xs">
                                            {field.type}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
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
                { title: 'Forms', href: '/admin/forms' },
                { title: form.name, href: `/admin/forms/${form.id}` },
            ]}
        >
            <Head title={`Form: ${form.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-semibold text-gray-900">{form.name}</h1>
                            <Badge className={getTypeColor(form.type)}>
                                {form.type.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-gray-600">
                            Created on {new Date(form.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/forms/${form.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="outline">
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Responses</p>
                                    <p className="text-2xl font-bold">{stats.total_responses}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Submitted</p>
                                    <p className="text-2xl font-bold">{stats.submitted_responses}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                                    <p className="text-2xl font-bold">{stats.draft_responses}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                                    <p className="text-2xl font-bold">{stats.recent_responses}</p>
                                </div>
                                <Clock className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="schema" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="schema">Form Schema</TabsTrigger>
                        <TabsTrigger value="responses">Recent Responses</TabsTrigger>
                    </TabsList>

                    <TabsContent value="schema">
                        <FormSchemaVisualization />
                    </TabsContent>

                    <TabsContent value="responses">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Recent Responses</CardTitle>
                                        <CardDescription>
                                            Latest form submissions
                                        </CardDescription>
                                    </div>
                                    <Button asChild>
                                        <Link href="/admin/form-responses">
                                            View All Responses
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentResponses.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentResponses.map((response) => (
                                            <div 
                                                key={response.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        {response.is_submitted ? (
                                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                                        ) : (
                                                            <Clock className="h-5 w-5 text-yellow-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {response.user?.name || 'Unknown User'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {response.is_submitted ? 'Submitted' : 'Draft'} • {' '}
                                                            {new Date(response.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/admin/form-responses/${response.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No responses yet</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Once users start filling out this form, their responses will appear here.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}