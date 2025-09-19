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
    Search, 
    Plus, 
    Download, 
    Eye, 
    Edit, 
    Trash2, 
    MoreHorizontal,
    Filter,
    ArrowUpDown,
    Package,
    TrendingUp,
    Activity,
    AlertTriangle
} from 'lucide-react';
import { Asset, Location, PaginatedData } from '@/types';

interface AssetStats {
    total: number;
    active: number;
    maintenance: number;
    retired: number;
    total_value: number;
}

interface Props {
    assets: PaginatedData<Asset>;
    locations: Location[];
    assetTypes: string[];
    stats: AssetStats;
    filters: {
        search?: string;
        status?: string;
        asset_type?: string;
        location_id?: string;
        sort?: string;
        direction?: string;
    };
}

export default function Index({ assets, locations, assetTypes, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [assetType, setAssetType] = useState(filters.asset_type || 'all');
    const [locationId, setLocationId] = useState(filters.location_id || 'all');

    const handleSearch = () => {
        const params: Record<string, any> = {
            search,
            sort: filters.sort,
            direction: filters.direction,
        };

        if (status !== 'all') params.status = status;
        if (assetType !== 'all') params.asset_type = assetType;
        if (locationId !== 'all') params.location_id = locationId;

        router.get(route('tenant.assets.index'), params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (column: string) => {
        const newDirection = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        const params: Record<string, any> = {
            search,
            sort: column,
            direction: newDirection,
        };

        if (status !== 'all') params.status = status;
        if (assetType !== 'all') params.asset_type = assetType;
        if (locationId !== 'all') params.location_id = locationId;

        router.get(route('tenant.assets.index'), params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status !== 'all') params.append('status', status);
        if (assetType !== 'all') params.append('asset_type', assetType);
        if (locationId !== 'all') params.append('location_id', locationId);

        window.open(`${route('tenant.assets.export')}?${params.toString()}`);
    };

    const handleDelete = (asset: Asset) => {
        if (confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
            router.delete(route('tenant.assets.destroy', asset.id), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: 'default',
            inactive: 'secondary',
            maintenance: 'destructive',
            retired: 'outline'
        } as const;

        const colors = {
            active: 'bg-green-500',
            inactive: 'bg-gray-500', 
            maintenance: 'bg-orange-500',
            retired: 'bg-red-500'
        };

        return (
            <Badge 
                variant={variants[status as keyof typeof variants] || 'secondary'}
                className={status === 'active' ? colors.active : undefined}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getSortIcon = (column: string) => {
        if (filters.sort === column) {
            return filters.direction === 'asc' ? '↑' : '↓';
        }
        return <ArrowUpDown className="h-4 w-4" />;
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Assets Management" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Assets Management</h1>
                        <p className="text-gray-600">Manage your company assets and equipment</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            disabled={assets.data.length === 0}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button asChild>
                            <Link href={route('tenant.assets.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Asset
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Assets</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active</p>
                                <p className="text-2xl font-bold">{stats.active}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Maintenance</p>
                                <p className="text-2xl font-bold">{stats.maintenance}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-red-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Retired</p>
                                <p className="text-2xl font-bold">{stats.retired}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Value</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.total_value)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search assets..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={assetType} onValueChange={setAssetType}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {assetTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={locationId} onValueChange={setLocationId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Locations" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                {locations.map((location) => (
                                    <SelectItem key={location.id} value={location.id.toString()}>
                                        {location.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleSearch}>
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
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
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Name</span>
                                        {getSortIcon('name')}
                                    </div>
                                </TableHead>
                                <TableHead 
                                    className="cursor-pointer"
                                    onClick={() => handleSort('asset_type')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Type</span>
                                        {getSortIcon('asset_type')}
                                    </div>
                                </TableHead>
                                <TableHead>Serial Number</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead 
                                    className="cursor-pointer"
                                    onClick={() => handleSort('current_value')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Value</span>
                                        {getSortIcon('current_value')}
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        <div className="text-gray-500">
                                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p className="text-lg font-medium">No assets found</p>
                                            <p className="text-sm">Add your first asset to get started!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assets.data.map((asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{asset.name}</p>
                                                {asset.description && (
                                                    <p className="text-sm text-gray-500 truncate max-w-xs">
                                                        {asset.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{asset.asset_type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {asset.serial_number || <span className="text-gray-400">-</span>}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(asset.status)}
                                        </TableCell>
                                        <TableCell>
                                            {asset.location?.name || <span className="text-gray-400">Unassigned</span>}
                                        </TableCell>
                                        <TableCell>
                                            {asset.current_assignment?.user?.name || (
                                                <span className="text-gray-400">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(asset.current_value)}
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
                                                            href={route('tenant.assets.show', asset.id)}
                                                            className="flex items-center"
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={route('tenant.assets.edit', asset.id)}
                                                            className="flex items-center"
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(asset)}
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
                {assets.meta && assets.meta.last_page > 1 && (
                    <div className="flex justify-center">
                        <nav className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!assets.links.prev}
                                onClick={() => assets.links.prev && router.visit(assets.links.prev)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {assets.meta.current_page} of {assets.meta.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!assets.links.next}
                                onClick={() => assets.links.next && router.visit(assets.links.next)}
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