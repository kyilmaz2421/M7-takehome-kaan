import React from "react";

interface Column<T> {
  header: string;
  key: keyof T | string;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  className = "",
}: TableProps<T>) => {
  return (
    <div className={`table-wrapper ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} style={{ width: column.width }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={`${index}-${String(column.key)}`}>
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .custom-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
          color: white;
          border: 1px solid white;
        }

        .custom-table th {
          background: #34495e;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid white;
          color: white;
        }

        .custom-table td {
          padding: 1rem;
          border: 1px solid white;
          background: #2c3e50;
        }

        .custom-table tr:last-child td {
          border-bottom: 1px solid white;
        }
      `}</style>
    </div>
  );
};

export default Table;
