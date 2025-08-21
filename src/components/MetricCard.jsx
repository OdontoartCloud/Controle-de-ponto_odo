import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'primary', onClick, clickable = false }) => {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    secondary: 'text-secondary-600 bg-secondary-100',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100'
  };

  return (
    <Card 
      className={`transition-shadow duration-200 ${clickable ? 'cursor-pointer hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">
                {title}
              </p>
            </div>
            {Icon && (
              <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1 break-words">
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 break-words">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;