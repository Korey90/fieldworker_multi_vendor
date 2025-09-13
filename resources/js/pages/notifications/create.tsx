import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, AlertTriangle, Info, CheckCircle, AlertCircle, Settings, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as notifications from '@/routes/admin/notifications';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface NotificationCreateProps {
    users: User[];
    types: Record<string, string>;
}

const typeConfig = {
    info: { icon: Info, color: 'text-blue-500', description: 'General information message' },
    success: { icon: CheckCircle, color: 'text-green-500', description: 'Success confirmation message' },
    warning: { icon: AlertCircle, color: 'text-yellow-500', description: 'Warning or caution message' },
    alert: { icon: AlertTriangle, color: 'text-red-500', description: 'Important alert requiring attention' },
    safety_alert: { icon: AlertTriangle, color: 'text-red-600', description: 'Critical safety alert' },
    maintenance: { icon: Settings, color: 'text-gray-500', description: 'System maintenance notification' },
};

export default function NotificationCreate({ users, types }: NotificationCreateProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Notifications', href: notifications.index().url },
        { title: 'Create Notification', href: notifications.create().url },
    ];

    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        type: '',
        title: '',
        message: '',
        data: {} as Record<string, any>,
    });

    const [additionalData, setAdditionalData] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let parsedData = {};
        if (additionalData.trim()) {
            try {
                parsedData = JSON.parse(additionalData);
            } catch (error) {
                // If JSON is invalid, store as plain text
                parsedData = { note: additionalData };
            }
        }

        // Update form data with parsed JSON
        setData('data', parsedData);
        
        post(notifications.store().url);
    };

    const selectedTypeConfig = data.type ? typeConfig[data.type as keyof typeof typeConfig] : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Notification" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={notifications.index().url}>
                                <Button variant="outline" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Create Notification</h1>
                                <p className="text-muted-foreground">
                                    Send a new notification to a user
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notification Details</CardTitle>
                                    <CardDescription>
                                        Enter the basic information for the notification.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Enter notification title..."
                                            className={errors.title ? 'border-red-500' : ''}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-500">{errors.title}</p>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message *</Label>
                                        <Textarea
                                            id="message"
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder="Enter notification message..."
                                            rows={6}
                                            className={errors.message ? 'border-red-500' : ''}
                                        />
                                        {errors.message && (
                                            <p className="text-sm text-red-500">{errors.message}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Maximum 1000 characters
                                        </p>
                                    </div>

                                    {/* Additional Data */}
                                    <div className="space-y-2">
                                        <Label htmlFor="data">Additional Data (JSON)</Label>
                                        <Textarea
                                            id="data"
                                            value={additionalData}
                                            onChange={(e) => setAdditionalData(e.target.value)}
                                            placeholder='{"key": "value", "action_url": "/some/path"}'
                                            rows={4}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Optional JSON data for the notification. If invalid JSON, will be stored as plain text.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Settings */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                    <CardDescription>
                                        Configure notification settings.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* User Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="user_id">Recipient *</Label>
                                        <Select value={data.user_id} onValueChange={(value) => setData('user_id', value)}>
                                            <SelectTrigger className={errors.user_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select user..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.user_id && (
                                            <p className="text-sm text-red-500">{errors.user_id}</p>
                                        )}
                                    </div>

                                    {/* Type Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type *</Label>
                                        <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                            <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(types).map(([key, label]) => {
                                                    const config = typeConfig[key as keyof typeof typeConfig];
                                                    const Icon = config?.icon || Info;
                                                    return (
                                                        <SelectItem key={key} value={key}>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className={`h-4 w-4 ${config?.color || 'text-muted-foreground'}`} />
                                                                {label}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && (
                                            <p className="text-sm text-red-500">{errors.type}</p>
                                        )}
                                        
                                        {selectedTypeConfig && (
                                            <Alert>
                                                <selectedTypeConfig.icon className={`h-4 w-4 ${selectedTypeConfig.color}`} />
                                                <AlertDescription>
                                                    {selectedTypeConfig.description}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Creating...' : 'Create Notification'}
                                    </Button>
                                    
                                    <Link href={notifications.index().url} className="w-full">
                                        <Button type="button" variant="outline" className="w-full">
                                            Cancel
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Preview */}
                            {data.title && data.message && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Preview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border rounded-lg p-4 space-y-2">
                                            <div className="flex items-center gap-2">
                                                {selectedTypeConfig && (
                                                    <selectedTypeConfig.icon className={`h-4 w-4 ${selectedTypeConfig.color}`} />
                                                )}
                                                <div className="font-medium">{data.title}</div>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {data.message}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}