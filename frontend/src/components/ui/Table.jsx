import React from 'react';

const Table = ({ headers, children, className = '' }) => {
  return (
    <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
      <table className={`w-full text-left border-collapse ${className}`}>
        <thead>
          <tr className="bg-gray-900/50 border-b border-gray-700">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
