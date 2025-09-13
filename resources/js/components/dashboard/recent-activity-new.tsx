import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertTriangle, CheckCircle, Clock, User, Wrench } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'job_created' | 'job_completed' | 'job_active' | 'worker_assigned' | 'alert' | 'info' | 'maintenance';
  title: string;
  description: string;
  timestamp: Date | string;
  user?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const activityIcons = {
  job_created: Wrench,
  job_completed: CheckCircle,
  job_active: Clock,
  worker_assigned: User,
  alert: AlertTriangle,
  info: Activity,
  maintenance: Activity,
};

const activityColors = {
  job_created: 'text-blue-600',
  job_completed: 'text-green-600',
  job_active: 'text-orange-600',
  worker_assigned: 'text-purple-600',
  alert: 'text-red-600',
  info: 'text-gray-600',
  maintenance: 'text-yellow-600',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export function RecentActivity({ activities, maxItems = 10 }: RecentActivityProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest updates from your fieldwork operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {displayedActivities.map((activity) => {
              const Icon = activityIcons[activity.type];
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full bg-muted ${activityColors[activity.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {activity.priority && (
                          <Badge 
                            variant="secondary" 
                            className={priorityColors[activity.priority]}
                          >
                            {activity.priority}
                          </Badge>
                        )}
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-muted-foreground mt-1">
                        by {activity.user}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
