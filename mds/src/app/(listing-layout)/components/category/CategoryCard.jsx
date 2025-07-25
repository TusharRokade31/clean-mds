import React from 'react';
import { Link } from 'next/link';
import { 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const CategoryCard = ({ category, onEdit, onDelete, isDeleting }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {category.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            Slug: {category.slug}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
            title="Edit category"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full disabled:opacity-50"
            title="Delete category"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <ClockIcon className="w-4 h-4 mr-2" />
          Version: {category.currentVersion}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4 mr-2" />
          Created: {formatDate(category.createdAt)}
        </div>

        {category.updatedAt !== category.createdAt && (
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Updated: {formatDate(category.updatedAt)}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          to={`/dashboard/blogs?category=${category.slug}`}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <DocumentTextIcon className="w-4 h-4 mr-1" />
          View blogs in this category
        </Link>
      </div>
    </div>
  );
};

export default CategoryCard;