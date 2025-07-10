'use client';

import Link from 'next/link';
import { adminEntityRegistry } from '../lib/entity-registry';

export function EntityNavigation() {
  const navigationItems = adminEntityRegistry.getNavigationItems();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">HumanUI Admin</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.displayName}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 