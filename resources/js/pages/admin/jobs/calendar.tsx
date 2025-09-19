import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    ArrowLeft,
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    MoreHorizontal,
    MapPin,
    Clock,
    Users,
    Eye
} from 'lucide-react';
import { type BreadcrumbItem, type Job } from '@/types';

interface JobCalendarProps {
    jobs: Job[];
    startDate: string;
    endDate: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Jobs', href: '/admin/jobs' },
    { title: 'Calendar View', href: '/admin/jobs/calendar' },
];

export default function JobCalendar({ jobs, startDate, endDate }: JobCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date(startDate));

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
        
        const newStartDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1).toISOString();
        const newEndDate = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).toISOString();
        
        router.get('/admin/jobs/calendar', {
            start: newStartDate,
            end: newEndDate,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startCalendar = new Date(firstDay);
        startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());
        
        const days = [];
        const currentDay = new Date(startCalendar);
        
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            days.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        return days;
    };

    const getJobsForDate = (date: Date) => {
        return jobs.filter(job => {
            if (!job.scheduled_at) return false;
            const jobDate = new Date(job.scheduled_at);
            return jobDate.toDateString() === date.toDateString();
        });
    };

    const isToday = (date: Date) => {
        return date.toDateString() === new Date().toDateString();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500';
            case 'in_progress':
                return 'bg-blue-500';
            case 'completed':
                return 'bg-green-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calendarDays = getCalendarDays();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jobs Calendar" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                {/* Header */}
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/jobs">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Jobs List
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Jobs Calendar</h1>
                            <p className="text-muted-foreground">
                                View scheduled jobs in calendar format
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/admin/jobs">
                            <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                Table View
                            </Button>
                        </Link>
                        <Link href="/admin/jobs/kanban">
                            <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                Kanban
                            </Button>
                        </Link>
                        <Link href="/admin/jobs/create">
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Job
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Calendar Navigation */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-2">
                                <CalendarIcon className="h-5 w-5" />
                                <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                            </CardTitle>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigateMonth('prev')}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentDate(new Date())}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigateMonth('next')}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Day Headers */}
                            {dayNames.map((day) => (
                                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar Days */}
                            {calendarDays.map((date, index) => {
                                const dayJobs = getJobsForDate(date);
                                const isCurrentMonthDay = isCurrentMonth(date);
                                const isTodayDate = isToday(date);

                                return (
                                    <div
                                        key={index}
                                        className={`min-h-24 p-1 border rounded-lg ${
                                            isCurrentMonthDay 
                                                ? 'bg-background border-border' 
                                                : 'bg-muted/50 border-muted text-muted-foreground'
                                        } ${
                                            isTodayDate 
                                                ? 'ring-2 ring-blue-500 ring-offset-2' 
                                                : ''
                                        }`}
                                    >
                                        <div className={`text-sm font-medium mb-1 ${
                                            isTodayDate ? 'text-blue-600' : ''
                                        }`}>
                                            {date.getDate()}
                                        </div>
                                        
                                        <div className="space-y-1">
                                            {dayJobs.slice(0, 3).map((job) => (
                                                <Link
                                                    key={job.id}
                                                    href={`/admin/jobs/${job.id}`}
                                                    className="block"
                                                >
                                                    <div className={`text-xs p-1 rounded text-white truncate hover:opacity-80 ${getStatusColor(job.status)}`}>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-2 w-2" />
                                                            <span>{formatTime(job.scheduled_at!)}</span>
                                                        </div>
                                                        <div className="truncate font-medium">
                                                            {job.title}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                            
                                            {dayJobs.length > 3 && (
                                                <div className="text-xs text-muted-foreground text-center">
                                                    +{dayJobs.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Jobs Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                                <div>
                                    <p className="text-sm font-medium">Pending</p>
                                    <p className="text-xs text-muted-foreground">
                                        {jobs.filter(j => j.status === 'pending').length} jobs
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded bg-blue-500"></div>
                                <div>
                                    <p className="text-sm font-medium">In Progress</p>
                                    <p className="text-xs text-muted-foreground">
                                        {jobs.filter(j => j.status === 'in_progress').length} jobs
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded bg-green-500"></div>
                                <div>
                                    <p className="text-sm font-medium">Completed</p>
                                    <p className="text-xs text-muted-foreground">
                                        {jobs.filter(j => j.status === 'completed').length} jobs
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded bg-red-500"></div>
                                <div>
                                    <p className="text-sm font-medium">Cancelled</p>
                                    <p className="text-xs text-muted-foreground">
                                        {jobs.filter(j => j.status === 'cancelled').length} jobs
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Jobs List */}
                {jobs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Jobs This Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {jobs
                                    .filter(job => job.scheduled_at && new Date(job.scheduled_at) > new Date())
                                    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
                                    .slice(0, 5)
                                    .map((job) => (
                                        <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-3 h-3 rounded ${getStatusColor(job.status)}`}></div>
                                                <div>
                                                    <h4 className="font-medium">{job.title}</h4>
                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center space-x-1">
                                                            <CalendarIcon className="h-3 w-3" />
                                                            <span>
                                                                {new Date(job.scheduled_at!).toLocaleDateString('pl-PL')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatTime(job.scheduled_at!)}</span>
                                                        </div>
                                                        {job.location && (
                                                            <div className="flex items-center space-x-1">
                                                                <MapPin className="h-3 w-3" />
                                                                <span>{job.location.name}</span>
                                                            </div>
                                                        )}
                                                        {job.assignments && job.assignments.length > 0 && (
                                                            <div className="flex items-center space-x-1">
                                                                <Users className="h-3 w-3" />
                                                                <span>{job.assignments.length} workers</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/admin/jobs/${job.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                    
                                {jobs.filter(job => job.scheduled_at && new Date(job.scheduled_at) > new Date()).length === 0 && (
                                    <div className="text-center py-8">
                                        <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No upcoming jobs</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Schedule some jobs to see them appear in the calendar.
                                        </p>
                                        <Link href="/admin/jobs/create">
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Schedule Job
                                            </Button>
                                        </Link>
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