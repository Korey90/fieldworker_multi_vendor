import { FormResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Edit, 
    Trash2, 
    FileText, 
    Users, 
    Calendar, 
    CheckCircle,
    Clock,
    Send,
    MapPin,
    Building,
    User
} from 'lucide-react';

interface Props {
    response: FormResponse;
}

export default function FormResponseShow({ response }: Props) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this response?')) {
            router.delete(`/admin/form-responses/${response.id}`);
        }
    };

    const handleSubmit = () => {
        if (confirm('Are you sure you want to submit this response?')) {
            router.post(`/admin/form-responses/${response.id}/submit`);
        }
    };

    const getStatusColor = (isSubmitted: boolean) => {
        return isSubmitted 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800';
    };

    const getFieldValue = (fieldName: string) => {
        return response.response_data?.[fieldName] || 'No response';
    };

    const renderFieldValue = (fieldType: string, value: any) => {
        if (!value || value === 'No response') {
            return <span className="text-gray-400 italic">No response</span>;
        }

        switch (fieldType) {
            case 'checkbox':
                return value ? (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Yes
                    </Badge>
                ) : (
                    <Badge className="bg-gray-100 text-gray-800">No</Badge>
                );
            case 'date':
            case 'datetime-local':
                return new Date(value).toLocaleDateString();
            case 'textarea':
                return (
                    <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                        {value}
                    </div>
                );
            case 'select':
            case 'radio':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-800">
                        {value}
                    </Badge>
                );
            case 'file':
                return (
                    <Link href={value} className="text-blue-600 hover:underline">
                        View File
                    </Link>
                );
            case 'signature':
                return (
                    <div className="text-sm text-gray-600">
                        Signature captured
                    </div>
                );
            default:
                return <span>{value}</span>;
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'Form Responses', href: '/admin/form-responses' },
                { title: response.form?.name || 'Response', href: `/admin/form-responses/${response.id}` },
            ]}
        >
            <Head title={`Response: ${response.form?.name || 'Unknown Form'}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {response.form?.name || 'Unknown Form'}
                            </h1>
                            <Badge className={getStatusColor(response.is_submitted)}>
                                {response.is_submitted ? (
                                    <><CheckCircle className="h-3 w-3 mr-1" /> Submitted</>
                                ) : (
                                    <><Clock className="h-3 w-3 mr-1" /> Draft</>
                                )}
                            </Badge>
                        </div>
                        <p className="text-gray-600">
                            Response submitted by {response.user?.name || 'Unknown User'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!response.is_submitted && (
                            <>
                                <Button asChild variant="outline">
                                    <Link href={`/admin/form-responses/${response.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button onClick={handleSubmit}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit
                                </Button>
                            </>
                        )}
                        {!response.is_submitted && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Form</p>
                                    <p className="text-lg font-semibold">{response.form?.name}</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">User</p>
                                    <p className="text-lg font-semibold">{response.user?.name}</p>
                                </div>
                                <User className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Created</p>
                                    <p className="text-lg font-semibold">
                                        {new Date(response.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Fields</p>
                                    <p className="text-lg font-semibold">{response.fields_count || 0}</p>
                                </div>
                                <FileText className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Response Data */}
                <div className="space-y-6">
                    {response.form?.schema?.sections?.map((section, sectionIndex) => (
                        <Card key={sectionIndex}>
                            <CardHeader>
                                <CardTitle className="text-lg">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {section.fields.map((field, fieldIndex) => (
                                        <div key={fieldIndex} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Label className="text-sm font-medium text-gray-700">
                                                    {field.label}
                                                </Label>
                                                {field.required && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Required
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs">
                                                    {field.type}
                                                </Badge>
                                            </div>
                                            <div className="mt-2">
                                                {renderFieldValue(field.type, getFieldValue(field.name))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )) || (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Form Schema</h3>
                                <p className="text-gray-500">
                                    This response doesn't have an associated form schema.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Additional Info */}
                {(response.job || response.submitted_at) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {response.job && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Associated Job
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <Link 
                                                href={`/admin/jobs/${response.job.id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {response.job.title || 'View Job'}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                {response.submitted_at && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Submitted At
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>{new Date(response.submitted_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <label className={className}>{children}</label>;
}