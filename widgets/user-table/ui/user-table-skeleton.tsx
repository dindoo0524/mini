const COLUMNS = 6;

export function UserTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-600">ID</th>
            <th className="px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="px-4 py-3 font-medium text-gray-600">Email</th>
            <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 font-medium text-gray-600">Created</th>
            <th className="px-4 py-3 font-medium text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-3">
                <div className="h-4 w-6 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-7 w-12 animate-pulse rounded bg-gray-200" />
                  <div className="h-7 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
