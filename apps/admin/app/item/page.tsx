'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { itemTableColumns, itemFormConfig } from '@humanui/entities';

// Mock data - replace with actual API calls
const mockItems = [
  {
    id: '1',
    name: 'Sample Item 1',
    status: 'ACTIVE',
    priority: 'HIGH',
    tags: ['electronics', 'gadgets'],
    createdBy: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Sample Item 2',
    status: 'DRAFT',
    priority: 'MEDIUM',
    tags: ['clothing', 'fashion'],
    createdBy: 'admin',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

// Basic table components (would be replaced with ShadCN components)
const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full border-collapse border border-gray-200">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">
    <tr>{children}</tr>
  </thead>
);

const TableHeaderCell = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b ${className}`}>
    {children}
  </th>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

const TableRow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={`hover:bg-gray-50 ${className}`}>
    {children}
  </tr>
);

const TableCell = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
    {children}
  </td>
);

const Button = ({ children, onClick, variant = 'default', className }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 h-8 px-3",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 h-8 px-3",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 h-8 px-3",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default function ItemListPage() {
  const router = useRouter();
  const [items, setItems] = useState(mockItems);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setItems(items.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      ACTIVE: 'bg-green-100 text-green-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      INACTIVE: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.DRAFT}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      HIGH: 'bg-red-100 text-red-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClasses[priority as keyof typeof priorityClasses] || priorityClasses.MEDIUM}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600 mt-2">Manage your inventory items</p>
        </div>
        <Link href="/item/create">
          <Button>
            Create Item
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Table>
          <TableHeader>
            {itemTableColumns.map((column) => (
              <TableHeaderCell key={column.key}>
                {column.label}
              </TableHeaderCell>
            ))}
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                <TableCell>
                  {item.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No tags</span>
                  )}
                </TableCell>
                <TableCell>{item.createdBy}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                <TableCell>{formatDate(item.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                                         <Button
                       variant="outline"
                       onClick={() => router.push(`/item/${item.id}` as any)}
                     >
                       Edit
                     </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 