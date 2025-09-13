import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorMap = {
  blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
  green: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
  orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
  red: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
  purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
};

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {trend && (
            <span className={`flex items-center ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
          )}
          {description && <span>{description}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
