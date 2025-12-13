import React from 'react';

// Table component
export function Table({ children, className = '' }) {
  return (
    <div className="rounded-md border bg-white">
      <table className={`w-full caption-bottom text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

// Table Header
export function TableHeader({ children, className = '' }) {
  return (
    <thead className={`bg-gray-50 text-gray-900 ${className}`}>
      {children}
    </thead>
  );
}

// Table Body
export function TableBody({ children, className = '' }) {
  return (
    <tbody className={`bg-white ${className}`}>
      {children}
    </tbody>
  );
}

// Table Row
export function TableRow({ children, className = '', onClick, ...props }) {
  const baseClasses = "border-b transition-colors hover:bg-gray-50";
  const clickableClasses = onClick ? "cursor-pointer" : "";
  const classes = `${baseClasses} ${clickableClasses} ${className}`;

  return (
    <tr
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
}

// Table Head (for header cells)
export function TableHead({ children, className = '' }) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-gray-500 ${className}`}
    >
      {children}
    </th>
  );
}

// Table Cell (for body cells)
export function TableCell({ children, className = '' }) {
  return (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>
      {children}
    </td>
  );
}

// Table Caption
export function TableCaption({ children, className = '' }) {
  return (
    <caption className={`mt-4 text-sm text-gray-500 ${className}`}>
      {children}
    </caption>
  );
}