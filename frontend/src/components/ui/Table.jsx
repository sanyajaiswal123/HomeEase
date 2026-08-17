import React from 'react';

const Table = ({ headers, children, className = '' }) => {
  return (
    <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
      <table className={`w-full text-left border-collapse ${className}`}>
        {headers && Array.isArray(headers) && headers.length > 0 && (
          <thead>
            <tr className="bg-gray-50 border-b border-border-light">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        {children}
      </table>
    </div>
  );
};

Table.Header = ({ children, className = '' }) => (
  <thead className={`bg-gray-50 border-b border-border-light ${className}`}>
    {children}
  </thead>
);

Table.Body = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-border-light ${className}`}>{children}</tbody>
);

Table.Row = ({ children, className = '' }) => (
  <tr className={`hover:bg-gray-50/80 transition-colors ${className}`}>{children}</tr>
);

Table.Head = ({ children, className = '' }) => (
  <th className={`px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

Table.Cell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 text-sm font-medium text-gray-900 ${className}`}>{children}</td>
);

export default Table;
