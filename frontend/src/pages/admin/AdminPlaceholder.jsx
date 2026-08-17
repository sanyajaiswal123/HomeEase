import React from 'react';
import { Construction } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';

export const AdminPlaceholder = ({ title, description }) => {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full py-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-outfit tracking-tight">
          {title}
        </h1>
        <p className="text-text-secondary font-medium text-base mt-1">
          {description || 'This module is part of the Admin Panel foundation.'}
        </p>
      </div>

      <div className="bg-white border border-border-light rounded-[24px] p-8 shadow-soft">
        <EmptyState
          title={`${title} Module`}
          description="This section is currently under development and will be available in future releases."
          icon={<Construction size={48} className="text-primary/40" />}
        />
      </div>
    </div>
  );
};

export default AdminPlaceholder;
