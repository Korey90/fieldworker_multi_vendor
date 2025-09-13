import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Briefcase, Settings, FileText, MapPin } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const quickActions: QuickAction[] = [
  {
    title: 'Add Worker',
    description: 'Register new field worker',
    icon: Users,
    href: '/workers/create',
    color: 'blue',
  },
  {
    title: 'Create Job',
    description: 'Start new field assignment',
    icon: Briefcase,
    href: '/jobs/create',
    color: 'green',
  },
  {
    title: 'New Form',
    description: 'Build custom form',
    icon: FileText,
    href: '/forms/create',
    color: 'purple',
  },
  {
    title: 'Add Location',
    description: 'Register work site',
    icon: MapPin,
    href: '/locations/create',
    color: 'orange',
  },
];

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30',
  green: 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30',
  orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30',
  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30',
  red: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30',
};

export function QuickActions() {
  const handleAction = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      // In a real app, you'd use router.push or similar
      console.log(`Navigate to: ${action.href}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common tasks to get things done quickly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="ghost"
                className={`h-auto p-4 flex flex-col items-start space-y-2 ${colorMap[action.color]} border-2 border-transparent hover:border-current/20`}
                onClick={() => handleAction(action)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs opacity-70">{action.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
