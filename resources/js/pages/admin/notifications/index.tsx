import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Plus, Search, Filter, Bell, AlertTriangle, Info, CheckCircle, AlertCircle, Settings, Trash2, Eye, MoreHorizontal, Grid3X3, List, Edit, Check, User, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    user?: User;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface NotificationStats {
    total: number;
    unread: number;
    alerts: number;
}

interface Props {
    notificationData?: {
        data: Notification[];
    } & PaginationMeta;
    stats?: NotificationStats;
    filters?: {
        type?: string | null;
        is_read?: boolean | null;
        user_id?: number | null;
        search?: string | null;
        sort?: string;
        direction?: string;
    };
}

const typeConfig = {
    info: { icon: Info, label: 'Info', color: 'bg-blue-500' },
    success: { icon: CheckCircle, label: 'Success', color: 'bg-green-500' },
    warning: { icon: AlertTriangle, label: 'Warning', color: 'bg-yellow-500' },
    alert: { icon: AlertCircle, label: 'Alert', color: 'bg-red-500' },
    safety_alert: { icon: AlertTriangle, label: 'Safety Alert', color: 'bg-red-600' },
    maintenance: { icon: Settings, label: 'Maintenance', color: 'bg-gray-500' },
};

export default function NotificationIndex({ notificationData, stats, filters }: Props) {
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Safe filters with defaults
    const safeFilters = {
        type: filters?.type || '',
        is_read: filters?.is_read,
        user_id: filters?.user_id,
        search: filters?.search || '',
        sort: filters?.sort || 'created_at',
        direction: filters?.direction || 'desc'
    };

    // Safe meta data with defaults
    const meta = notificationData || {
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
    };

    // Safe notifications data
    const currentNotifications = notificationData?.data || [];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/' },
        { title: 'Notifications', href: notifications.index().url }
    ];

    const handleSelectNotification = (notificationId: number, checked: boolean) => {
        if (checked) {
            setSelectedNotifications([...selectedNotifications, notificationId]);
        } else {
            setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedNotifications(currentNotifications.map(n => n.id));
        } else {
            setSelectedNotifications([]);
        }
    };

    const handleBulkDelete = () => {
        if (selectedNotifications.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) {
            // Use individual delete calls since bulk delete might not be implemented
            selectedNotifications.forEach(id => {
                router.delete(notifications.destroy(id.toString()).url);
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(notifications.index().url, { ...safeFilters, search: searchTerm }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...safeFilters, [key]: value } as any;
        // Remove empty values
        Object.keys(newFilters).forEach(k => {
            if (newFilters[k] === '' || newFilters[k] === undefined || newFilters[k] === null) {
                delete newFilters[k];
            }
        });
        
        router.get(notifications.index().url, newFilters, { 
            preserveState: true,
            replace: true 
        });
    };

    const handleSort = (field: string) => {
        const direction = safeFilters.sort === field && safeFilters.direction === 'asc' ? 'desc' : 'asc';
        router.get(notifications.index().url, { ...safeFilters, sort: field, direction }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handleMarkAsRead = (notificationId: number) => {
        router.post(notifications.markAsRead(notificationId.toString()).url);
    };

    const getTypeIcon = (type: string) => {
        const config = typeConfig[type as keyof typeof typeConfig];
        if (!config) return Info;
        return config.icon;
    };

    const getTypeBadge = (type: string) => {
        const config = typeConfig[type as keyof typeof typeConfig];
        if (!config) return <Badge variant="secondary">{type}</Badge>;
        
        return (
            <Badge variant="secondary" className="gap-1">
                <div className={`w-2 h-2 rounded-full ${config.color}`} />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                            <p className="text-muted-foreground">
                                Manage and monitor system notifications
                            </p>
                        </div>
                        <Link href={notifications.create().url}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Notification
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                            <Bell className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unread</CardTitle>
                            <AlertCircle className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats?.unread || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats?.alerts || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Notifications</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filters
                                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                </Button>
                                {selectedNotifications.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete ({selectedNotifications.length})
                                    </Button>
                                )}
                                
                                {/* View mode toggle */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <Button
                                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('table')}
                                        className="text-xs"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="text-xs"
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search notifications..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit">Search</Button>
                        </form>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="grid gap-4 pt-4 border-t md:grid-cols-4">
                                <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <Select value={safeFilters.type || 'all'} onValueChange={(value) => handleFilterChange('type', value === 'all' ? '' : value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All types</SelectItem>
                                            {Object.entries(typeConfig).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>
                                                    {config.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Select 
                                        value={safeFilters.is_read === undefined || safeFilters.is_read === null ? 'all' : safeFilters.is_read.toString()} 
                                        onValueChange={(value) => handleFilterChange('is_read', value === 'all' ? undefined : value === 'true')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="false">Unread</SelectItem>
                                            <SelectItem value="true">Read</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.get(notifications.index().url)}
                                        className="w-full"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {currentNotifications.length === 0 ? (
                            <div className="text-center text-gray-500">Brak powiadomień do wyświetlenia</div>
                        ) : viewMode === 'table' ? (
                            /* Table View */
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedNotifications.length === currentNotifications.length}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('type')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Type
                                                {safeFilters.sort === 'type' && (
                                                    safeFilters.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('title')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Title
                                                {safeFilters.sort === 'title' && (
                                                    safeFilters.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('is_read')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Status
                                                {safeFilters.sort === 'is_read' && (
                                                    safeFilters.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('created_at')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Created
                                                {safeFilters.sort === 'created_at' && (
                                                    safeFilters.direction === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentNotifications.map((notification) => (
                                        <TableRow key={notification.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedNotifications.includes(notification.id)}
                                                    onCheckedChange={(checked) => handleSelectNotification(notification.id, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {getTypeBadge(notification.type)}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{notification.title}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {notification.message}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {notification.user ? (
                                                    <div>
                                                        <div className="font-medium">{notification.user.name}</div>
                                                        <div className="text-sm text-gray-500">{notification.user.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Global</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={notification.is_read ? 'secondary' : 'destructive'}>
                                                    {notification.is_read ? 'Read' : 'Unread'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{formatDate(notification.created_at)}</div>
                                                    {notification.read_at && (
                                                        <div className="text-xs text-gray-500">
                                                            Read: {formatDate(notification.read_at)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(notifications.show(notification.id.toString()).url)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(notifications.edit(notification.id.toString()).url)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {!notification.is_read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.delete(notifications.destroy(notification.id.toString()).url)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            /* Grid View */
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {currentNotifications.map((notification) => (
                                    <Card key={notification.id} className={`cursor-pointer hover:shadow-md transition-shadow ${!notification.is_read ? 'border-blue-500' : ''}`}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    {getTypeBadge(notification.type)}
                                                    <Badge variant={notification.is_read ? 'secondary' : 'destructive'} className="text-xs">
                                                        {notification.is_read ? 'Read' : 'Unread'}
                                                    </Badge>
                                                </div>
                                                <Checkbox
                                                    checked={selectedNotifications.includes(notification.id)}
                                                    onCheckedChange={(checked) => handleSelectNotification(notification.id, checked as boolean)}
                                                />
                                            </div>
                                            <CardTitle className="text-lg line-clamp-2">{notification.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-gray-600 line-clamp-3">{notification.message}</p>
                                            
                                            {notification.user && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <User className="h-4 w-4" />
                                                    <span>{notification.user.name}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock className="h-4 w-4" />
                                                <span>{formatDate(notification.created_at)}</span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(notifications.show(notification.id.toString()).url)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(notifications.edit(notification.id.toString()).url)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {!notification.is_read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.delete(notifications.destroy(notification.id.toString()).url)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {meta && meta.last_page > 1 && (
                            <div className="flex items-center justify-between space-x-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(notifications.index().url, { ...safeFilters, page: meta.current_page - 1 })}
                                        disabled={meta.current_page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="text-sm">
                                        Page {meta.current_page} of {meta.last_page}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(notifications.index().url, { ...safeFilters, page: meta.current_page + 1 })}
                                        disabled={meta.current_page >= meta.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}