import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Clock, User, Tag, Eye, EyeOff, Edit, Trash2, AlertTriangle, Info, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import * as notifications from '@/routes/admin/notifications';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'alert' | 'safety_alert' | 'maintenance';
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    updated_at: string;
    data: any;
    user: User;
}

interface NotificationShowProps {
    notification: Notification;
}

const typeConfig = {
    info: { label: 'Info', icon: Info, color: 'bg-blue-500', variant: 'default' as const },
    success: { label: 'Success', icon: CheckCircle, color: 'bg-green-500', variant: 'default' as const },
    warning: { label: 'Warning', icon: AlertCircle, color: 'bg-yellow-500', variant: 'default' as const },
    alert: { label: 'Alert', icon: AlertTriangle, color: 'bg-red-500', variant: 'destructive' as const },
    safety_alert: { label: 'Safety Alert', icon: AlertTriangle, color: 'bg-red-600', variant: 'destructive' as const },
    maintenance: { label: 'Maintenance', icon: Settings, color: 'bg-gray-500', variant: 'secondary' as const },
};

export default function NotificationShow({ notification }: NotificationShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Notifications', href: notifications.index().url },
        { title: notification.title, href: notifications.show(notification.id.toString()).url },
    ];

    const typeInfo = typeConfig[notification.type] || typeConfig.info;
    const Icon = typeInfo.icon;

    const handleMarkAsRead = () => {
        router.post(notifications.markAsRead(notification.id.toString()).url);
    };

    const handleMarkAsUnread = () => {
        router.post(notifications.markAsUnread(notification.id.toString()).url);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this notification?')) {
            router.delete(notifications.destroy(notification.id.toString()).url, {
                onSuccess: () => {
                    router.get(notifications.index().url);
                }
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getTypeBadge = () => {
        return (
            <Badge variant={typeInfo.variant} className="gap-1">
                <div className={`w-2 h-2 rounded-full ${typeInfo.color}`} />
                {typeInfo.label}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Notification: ${notification.title}`} />
            
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
                                <h1 className="text-3xl font-bold tracking-tight">Notification Details</h1>
                                <p className="text-muted-foreground">
                                    View and manage notification information
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {notification.is_read ? (
                                <Button variant="outline" onClick={handleMarkAsUnread}>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Mark as Unread
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={handleMarkAsRead}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Mark as Read
                                </Button>
                            )}
                            <Link href={notifications.edit(notification.id.toString()).url}>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Notification Content */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon className={`h-6 w-6 ${notification.type === 'alert' || notification.type === 'safety_alert' ? 'text-red-500' : 'text-muted-foreground'}`} />
                                        <div>
                                            <CardTitle className="text-xl">{notification.title}</CardTitle>
                                            <CardDescription>
                                                {getTypeBadge()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={notification.is_read ? 'secondary' : 'default'}>
                                        {notification.is_read ? 'Read' : 'Unread'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-2">Message</h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {notification.message}
                                        </p>
                                    </div>
                                    
                                    {notification.data && Object.keys(notification.data).length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-2">Additional Data</h3>
                                            <div className="bg-muted rounded-md p-3">
                                                <pre className="text-sm text-muted-foreground overflow-x-auto">
                                                    {JSON.stringify(notification.data, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Notification Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">{notification.user.name}</div>
                                        <div className="text-sm text-muted-foreground">{notification.user.email}</div>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="flex items-center gap-3">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Type</div>
                                        <div className="font-medium">{typeInfo.label}</div>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Created</div>
                                        <div className="font-medium">{formatDate(notification.created_at)}</div>
                                    </div>
                                </div>
                                
                                {notification.is_read && notification.read_at && (
                                    <>
                                        <Separator />
                                        <div className="flex items-center gap-3">
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm text-muted-foreground">Read at</div>
                                                <div className="font-medium">{formatDate(notification.read_at)}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                <Separator />
                                
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Last Updated</div>
                                        <div className="font-medium">{formatDate(notification.updated_at)}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={notifications.index().url} className="w-full">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to List
                                    </Button>
                                </Link>
                                <Link href={notifications.edit(notification.id.toString()).url} className="w-full">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Notification
                                    </Button>
                                </Link>
                                <Link href={notifications.create().url} className="w-full">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Icon className="mr-2 h-4 w-4" />
                                        Create New
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}