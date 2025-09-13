import React from 'react';
import { MapPin, Users, Clock, AlertTriangle } from 'lucide-react';

interface Location {
    id: string;
    name: string;
    address: string;
    activeWorkers: number;
    activeJobs: number;
    lastActivity: string;
    status: 'active' | 'warning' | 'inactive';
}

interface LocationMapProps {
    locations?: Location[];
}

export function LocationMap({ locations }: LocationMapProps) {
    // Default mock data if no locations provided
    const defaultLocations: Location[] = [
        {
            id: '1',
            name: 'Downtown Office Complex',
            address: '123 Business St, City Center',
            activeWorkers: 8,
            activeJobs: 3,
            lastActivity: '5 minutes ago',
            status: 'active',
        },
        {
            id: '2',
            name: 'Industrial District',
            address: '456 Factory Rd, Industrial Zone',
            activeWorkers: 12,
            activeJobs: 5,
            lastActivity: '12 minutes ago',
            status: 'active',
        },
        {
            id: '3',
            name: 'Residential Area North',
            address: '789 Home Ave, North District',
            activeWorkers: 3,
            activeJobs: 1,
            lastActivity: '45 minutes ago',
            status: 'warning',
        },
        {
            id: '4',
            name: 'Shopping Mall Complex',
            address: '321 Mall Blvd, Shopping District',
            activeWorkers: 0,
            activeJobs: 0,
            lastActivity: '2 hours ago',
            status: 'inactive',
        },
    ];

    const locationData = locations || defaultLocations;

    const getStatusColor = (status: Location['status']) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            case 'warning':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'inactive':
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: Location['status']) => {
        switch (status) {
            case 'active':
                return <Users className="h-4 w-4" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            case 'inactive':
                return <Clock className="h-4 w-4" />;
            default:
                return <MapPin className="h-4 w-4" />;
        }
    };

    return (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Active Locations</h3>
                <p className="text-sm text-muted-foreground">Worker and job distribution across locations</p>
            </div>
            <div className="space-y-4">
                {locationData.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-4 rounded-lg border border-sidebar-border/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${getStatusColor(location.status)}`}>
                                {getStatusIcon(location.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate">{location.name}</h4>
                                <p className="text-xs text-muted-foreground truncate">{location.address}</p>
                                <p className="text-xs text-muted-foreground mt-1">Last activity: {location.lastActivity}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                            <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                    <Users className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs">{location.activeWorkers}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs">{location.activeJobs}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
