import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  MapPin, 
  ArrowLeft, 
  Edit, 
  Users, 
  Package, 
  Briefcase, 
  Activity,
  Globe,
  Building,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
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
  tenant: {
    id: string;
    name: string;
  };
  workers: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      is_active: boolean;
    };
    is_active: boolean;
    created_at: string;
  }>;
  assets: Array<{
    id: string;
    name: string;
    asset_tag: string;
    status: string;
    created_at: string;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    due_date: string | null;
  }>;
  created_at: string;
  updated_at: string;
}

interface Stats {
  workers_count: number;
  active_workers: number;
  assets_count: number;
  jobs_count: number;
  active_jobs: number;
  completed_jobs: number;
}

interface Props {
  location: Location;
  stats: Stats;
}

export default function Show({ location, stats }: Props) {
  const formatLocationAddress = () => {
    const parts = [location.address, location.city, location.state, location.postal_code, location.country];
    return parts.filter(Boolean).join(', ');
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-gray-600';
  };

  const getTypeColor = (type: string | null | undefined) => {
    if (!type) return 'bg-gray-500';
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

  const getJobStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-500';
    const colors = {
      pending: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      on_hold: 'bg-gray-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return 'bg-gray-500';
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <AppLayout>
      <Head title={`Location: ${location.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('tenant.locations.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Locations
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{location.name}</h1>
              <p className="text-muted-foreground">
                Location details and management
              </p>
            </div>
          </div>
          <Link href={route('tenant.locations.edit', location.id)}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Location
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.workers_count}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_workers} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assets_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobs_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.active_jobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed_jobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {location.is_active ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(location.is_active)}`}>
                {location.is_active ? 'Active' : 'Inactive'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Name</h4>
                  <p className="mt-1">{location.name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Type</h4>
                  <Badge className={`mt-1 ${getTypeColor(location.location_type)} text-white`}>
                    {location.location_type ? location.location_type.replace('_', ' ').toUpperCase() : 'N/A'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Sector</h4>
                  <p className="mt-1">
                    {location.sector ? (
                      <Badge variant="outline">{location.sector.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">No sector assigned</span>
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                  <div className="mt-1 flex items-center gap-2">
                    {location.is_active ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={getStatusColor(location.is_active)}>
                      {location.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Address</h4>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p>{formatLocationAddress()}</p>
                </div>
              </div>

              {location.latitude && location.longitude && typeof location.latitude === 'number' && typeof location.longitude === 'number' && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Coordinates</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Created</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{new Date(location.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Last Updated</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{new Date(location.updated_at).toLocaleDateString()}</p>
                  </div>
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
              <Link href={route('tenant.locations.edit', location.id)}>
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Location
                </Button>
              </Link>
              <Link href={route('tenant.workers.index', { location: location.id })}>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  View Workers ({stats.workers_count})
                </Button>
              </Link>
              <Link href={route('tenant.jobs.index', { location: location.id })}>
                <Button className="w-full justify-start" variant="outline">
                  <Briefcase className="mr-2 h-4 w-4" />
                  View Jobs ({stats.jobs_count})
                </Button>
              </Link>
              {location.latitude && location.longitude && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.open(`https://maps.google.com/?q=${location.latitude},${location.longitude}`, '_blank')}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  View on Map
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Related Data Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Related Data</CardTitle>
            <CardDescription>
              Workers, assets, and jobs associated with this location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="workers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="workers">Workers ({location.workers?.length || 0})</TabsTrigger>
                <TabsTrigger value="assets">Assets ({location.assets?.length || 0})</TabsTrigger>
                <TabsTrigger value="jobs">Jobs ({location.jobs?.length || 0})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="workers">
                {location.workers && location.workers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {location.workers?.map((worker) => (
                        <TableRow key={worker.id}>
                          <TableCell className="font-medium">{worker.user?.name || 'N/A'}</TableCell>
                          <TableCell>{worker.user?.email || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={worker.user?.is_active && worker.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                              {worker.user?.is_active && worker.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{worker.created_at ? new Date(worker.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No workers assigned to this location.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="assets">
                {location.assets && location.assets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Asset Tag</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {location.assets?.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.name}</TableCell>
                          <TableCell>{asset.asset_tag}</TableCell>
                          <TableCell>
                            <Badge className={asset.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                              {asset.status ? asset.status.toUpperCase() : 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>{asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No assets assigned to this location.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="jobs">
                {location.jobs && location.jobs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Created Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {location.jobs?.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>
                            <Badge className={`${getJobStatusColor(job.status)} text-white`}>
                              {job.status ? job.status.replace('_', ' ').toUpperCase() : 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getPriorityColor(job.priority)} text-white`}>
                              {job.priority ? job.priority.toUpperCase() : 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {job.due_date ? new Date(job.due_date).toLocaleDateString() : 'No due date'}
                          </TableCell>
                          <TableCell>{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No jobs assigned to this location.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}