import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Plus, Search, Filter, Grid, List, Users, Package, Briefcase, Activity, MoreHorizontal, Edit, Eye, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  location_type: string;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  sector?: {
    id: string;
    name: string;
  } | null;
  workers_count?: number;
  assets_count?: number;
  jobs_count?: number;
  created_at: string;
  updated_at: string;
}

interface Sector {
  id: string;
  name: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  types: Record<string, number>;
}

interface Filters {
  search: string | null;
  type: string | null;
  sector: string | null;
  status: string | null;
  per_page: number;
}

interface Props {
  locations: {
    data: Location[];
    links?: any[];
    meta?: {
      total?: number;
      current_page?: number;
      last_page?: number;
      per_page?: number;
    };
  };
  sectors: Sector[];
  locationTypes: string[];
  stats: Stats;
  filters: Filters;
}

export default function Index({ locations, sectors, locationTypes, stats, filters }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || '__all__');
  const [selectedSector, setSelectedSector] = useState(filters.sector || '__all__');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '__all__');
  const [perPage, setPerPage] = useState(filters.per_page || 10);

  const handleSearch = () => {
    router.get(route('tenant.locations.index'), {
      search: searchTerm,
      type: selectedType === '__all__' ? '' : selectedType,
      sector: selectedSector === '__all__' ? '' : selectedSector,
      status: selectedStatus === '__all__' ? '' : selectedStatus,
      per_page: perPage,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedType('__all__');
    setSelectedSector('__all__');
    setSelectedStatus('__all__');
    setPerPage(10);
    router.get(route('tenant.locations.index'));
  };

  const handleDelete = (locationId: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      router.delete(route('tenant.locations.destroy', locationId));
    }
  };

  const formatLocationAddress = (location: Location) => {
    const parts = [location.address, location.city, location.state, location.postal_code, location.country];
    return parts.filter(Boolean).join(', ');
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      office: 'bg-blue-500',
      warehouse: 'bg-purple-500',
      retail_store: 'bg-green-500',
      factory: 'bg-orange-500',
      service_center: 'bg-cyan-500',
      remote_site: 'bg-yellow-500',
      construction_site: 'bg-red-500',
      other: 'bg-gray-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <AppLayout>
      <Head title="Locations" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
            <p className="text-muted-foreground">
              Manage your organization's locations and facilities
            </p>
          </div>
          <Link href={route('tenant.locations.create')}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Locations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Location Types</CardTitle>
              <Grid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.types).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-8"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Types</SelectItem>
                  {locationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  Search
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
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
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Locations ({locations.meta?.total || locations.data.length})</CardTitle>
            <CardDescription>
              A list of all locations in your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </Button>
              </div>
            </div>

            {viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Workers</TableHead>
                    <TableHead>Assets</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.data.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{location.name}</div>
                          {location.latitude && location.longitude && typeof location.latitude === 'number' && typeof location.longitude === 'number' && (
                            <div className="text-sm text-muted-foreground">
                              📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getTypeColor(location.location_type)} text-white`}>
                          {location.location_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {formatLocationAddress(location)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {location.sector ? (
                          <Badge variant="outline">{location.sector.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">No sector</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(location.is_active)} text-white`}>
                          {location.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {location.workers_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          {location.assets_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          {location.jobs_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={route('tenant.locations.show', location.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={route('tenant.locations.edit', location.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(location.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.data.map((location) => (
                  <Card key={location.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{location.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getTypeColor(location.location_type)} text-white text-xs`}>
                              {location.location_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={`${getStatusColor(location.is_active)} text-white text-xs`}>
                              {location.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={route('tenant.locations.show', location.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={route('tenant.locations.edit', location.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(location.id)}
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
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          {formatLocationAddress(location)}
                        </div>
                        {location.sector && (
                          <div className="text-sm">
                            <span className="font-medium">Sector:</span> {location.sector.name}
                          </div>
                        )}
                        {location.latitude && location.longitude && typeof location.latitude === 'number' && typeof location.longitude === 'number' && (
                          <div className="text-sm text-muted-foreground">
                            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </div>
                        )}
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>👥 {location.workers_count || 0} workers</span>
                          <span>📦 {location.assets_count || 0} assets</span>
                          <span>💼 {location.jobs_count || 0} jobs</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}