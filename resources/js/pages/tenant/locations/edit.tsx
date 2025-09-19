import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  sector_id: string | null;
}

interface Sector {
  id: string;
  name: string;
}

interface Props {
  location: Location;
  sectors: Sector[];
  locationTypes: string[];
}

export default function Edit({ location, sectors, locationTypes }: Props) {
  const { data, setData, put, processing, errors, reset } = useForm({
    name: location.name || '',
    address: location.address || '',
    city: location.city || '',
    state: location.state || '',
    postal_code: location.postal_code || '',
    country: location.country || 'Poland',
    location_type: location.location_type || '',
    sector_id: location.sector_id || '__none__',
    latitude: location.latitude ? location.latitude.toString() : '',
    longitude: location.longitude ? location.longitude.toString() : '',
    is_active: location.is_active !== undefined ? location.is_active : true,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    // Set the normalized data before submitting
    setData({
      ...data,
      latitude: data.latitude ? parseFloat(data.latitude).toString() : '',
      longitude: data.longitude ? parseFloat(data.longitude).toString() : '',
      // Normalize special value for no sector
      sector_id: data.sector_id === "__none__" ? '' : data.sector_id,
    });

    put(route('tenant.locations.update', location.id), {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout>
      <Head title={`Edit Location: ${location.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={route('tenant.locations.show', location.id)}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Location
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Location</h1>
            <p className="text-muted-foreground">
              Update the details for {location.name}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
            <CardDescription>
              Update the details for this location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., Main Office, Warehouse A"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <Alert className="border-red-500">
                      <AlertDescription>{errors.name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_type">Location Type *</Label>
                  <Select
                    value={data.location_type}
                    onValueChange={(value) => setData('location_type', value)}
                  >
                    <SelectTrigger className={errors.location_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location_type && (
                    <Alert className="border-red-500">
                      <AlertDescription>{errors.location_type}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Textarea
                    id="address"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder="Enter full street address"
                    rows={2}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <Alert className="border-red-500">
                      <AlertDescription>{errors.address}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={data.city}
                      onChange={(e) => setData('city', e.target.value)}
                      placeholder="e.g., Warsaw"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <Alert className="border-red-500">
                        <AlertDescription>{errors.city}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      type="text"
                      value={data.state}
                      onChange={(e) => setData('state', e.target.value)}
                      placeholder="e.g., Masovian"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                      <Alert className="border-red-500">
                        <AlertDescription>{errors.state}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      type="text"
                      value={data.postal_code}
                      onChange={(e) => setData('postal_code', e.target.value)}
                      placeholder="e.g., 00-001"
                      className={errors.postal_code ? 'border-red-500' : ''}
                    />
                    {errors.postal_code && (
                      <Alert className="border-red-500">
                        <AlertDescription>{errors.postal_code}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      type="text"
                      value={data.country}
                      onChange={(e) => setData('country', e.target.value)}
                      placeholder="e.g., Poland"
                      className={errors.country ? 'border-red-500' : ''}
                    />
                    {errors.country && (
                      <Alert className="border-red-500">
                        <AlertDescription>{errors.country}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sector_id">Sector</Label>
                    <Select
                      value={data.sector_id}
                      onValueChange={(value) => setData('sector_id', value)}
                    >
                      <SelectTrigger className={errors.sector_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select sector (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No sector</SelectItem>
                        {sectors.map((sector) => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sector_id && (
                      <Alert className="border-red-500">
                        <AlertDescription>{errors.sector_id}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={data.latitude}
                      onChange={(e) => setData('latitude', e.target.value)}
                      placeholder="e.g., 52.237049"
                      className={errors.latitude ? 'border-red-500' : ''}
                    />
                    {errors.latitude && (
                      <Alert className="border-red-500">
                        <AlertDescription>{errors.latitude}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={data.longitude}
                      onChange={(e) => setData('longitude', e.target.value)}
                      placeholder="e.g., 21.017532"
                      className={errors.longitude ? 'border-red-500' : ''}
                    />
                    {errors.longitude && (
                      <Alert className="border-red-500">
                        <AlertDescription>{errors.longitude}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status</h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_active">
                    Active location
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Inactive locations will not be available for assignment to workers or jobs.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <Link href={route('tenant.locations.show', location.id)}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Updating...' : 'Update Location'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}