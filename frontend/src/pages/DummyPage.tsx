import React, { useState, useMemo } from 'react';

const dummyData = [
  {
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    name: 'Jessica Evans',
    email: 'jessica.evans@gmail.com',
    role: 'Designer',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'Poland', flag: '🇵🇱' },
    activity: 'Today, 13:45',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    name: 'Sophia Lee',
    email: 'sophia.lee@gmail.com',
    role: 'HR',
    status: { label: 'On Leave', color: 'red' },
    location: { country: 'South Korea', flag: '🇰🇷' },
    activity: 'Week ago',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    name: 'Daniel Wilson',
    email: 'daniel.wilson@gmail.com',
    role: 'CTO',
    status: { label: 'In Office', color: 'green' },
    location: { country: 'Japan', flag: '🇯🇵' },
    activity: 'Yesterday, 17:45',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    name: 'Jacob Jones',
    email: 'jacob.jones@gmail.com',
    role: 'Analyst',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'Ukraine', flag: '🇺🇦' },
    activity: '',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    name: 'Olivia Martinez',
    email: 'olivia.martinez@gmail.com',
    role: 'Product Manager',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'Italy', flag: '🇮🇹' },
    activity: 'Current session',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    name: 'Michael Brown',
    email: 'michael.brown@gmail.com',
    role: 'QA Engineer',
    status: { label: 'In Office', color: 'green' },
    location: { country: 'Germany', flag: '🇩🇪' },
    activity: 'Today, 09:45',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
    name: 'Emily Johnson',
    email: 'emily.johnson@gmail.com',
    role: 'Developer',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'France', flag: '🇫🇷' },
    activity: 'Today, 10:12',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
    name: 'John Smith',
    email: 'john.smith@gmail.com',
    role: 'Designer',
    status: { label: 'On Leave', color: 'red' },
    location: { country: 'Australia', flag: '🇦🇺' },
    activity: 'Yesterday, 14:23',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/9.jpg',
    name: 'Leslie Alexander',
    email: 'leslie.alexander@gmail.com',
    role: 'Super Admin',
    status: { label: 'In Office', color: 'green' },
    location: { country: 'India', flag: '🇮🇳' },
    activity: 'Month ago',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    name: 'Robert Fox',
    email: 'robert.fox@gmail.com',
    role: 'Developer',
    status: { label: 'In Office', color: 'green' },
    location: { country: 'USA', flag: '🇺🇸' },
    activity: 'Today, 15:02',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
    name: 'Sarah Chen',
    email: 'sarah.chen@gmail.com',
    role: 'UX Designer',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'Canada', flag: '🇨🇦' },
    activity: 'Today, 11:30',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    name: 'David Kim',
    email: 'david.kim@gmail.com',
    role: 'Backend Developer',
    status: { label: 'In Office', color: 'green' },
    location: { country: 'Singapore', flag: '🇸🇬' },
    activity: 'Yesterday, 16:20',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/13.jpg',
    name: 'Maria Garcia',
    email: 'maria.garcia@gmail.com',
    role: 'Marketing Manager',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'Spain', flag: '🇪🇸' },
    activity: 'Today, 08:15',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/14.jpg',
    name: 'Alex Thompson',
    email: 'alex.thompson@gmail.com',
    role: 'Frontend Developer',
    status: { label: 'In Office', color: 'green' },
    location: { country: 'UK', flag: '🇬🇧' },
    activity: 'Current session',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
    name: 'Lisa Wang',
    email: 'lisa.wang@gmail.com',
    role: 'Data Scientist',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'China', flag: '🇨🇳' },
    activity: 'Today, 12:45',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/16.jpg',
    name: 'James Rodriguez',
    email: 'james.rodriguez@gmail.com',
    role: 'DevOps Engineer',
    status: { label: 'On Leave', color: 'red' },
    location: { country: 'Brazil', flag: '🇧🇷' },
    activity: 'Week ago',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    name: 'Anna Kowalski',
    email: 'anna.kowalski@gmail.com',
    role: 'Business Analyst',
    status: { label: 'In Office', color: 'green' },
    location: { country: 'Poland', flag: '🇵🇱' },
    activity: 'Today, 09:30',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/18.jpg',
    name: 'Carlos Silva',
    email: 'carlos.silva@gmail.com',
    role: 'Mobile Developer',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'Portugal', flag: '🇵🇹' },
    activity: 'Yesterday, 18:00',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/19.jpg',
    name: 'Nina Patel',
    email: 'nina.patel@gmail.com',
    role: 'Product Owner',
    status: { label: 'In Office', color: 'green' },
    location: { country: 'India', flag: '🇮🇳' },
    activity: 'Today, 14:20',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/20.jpg',
    name: 'Tom Anderson',
    email: 'tom.anderson@gmail.com',
    role: 'System Architect',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'Netherlands', flag: '🇳🇱' },
    activity: 'Today, 10:45',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
    name: 'Emma Wilson',
    email: 'emma.wilson@gmail.com',
    role: 'Content Strategist',
    status: { label: 'In Office', color: 'green' },
    location: { country: 'Ireland', flag: '🇮🇪' },
    activity: 'Current session',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    name: 'Lucas Berg',
    email: 'lucas.berg@gmail.com',
    role: 'Security Engineer',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'Sweden', flag: '🇸🇪' },
    activity: 'Today, 13:15',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
    name: 'Zoe Taylor',
    email: 'zoe.taylor@gmail.com',
    role: 'UI Designer',
    status: { label: 'On Leave', color: 'red' },
    location: { country: 'New Zealand', flag: '🇳🇿' },
    activity: 'Yesterday, 15:30',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/24.jpg',
    name: 'Ryan Murphy',
    email: 'ryan.murphy@gmail.com',
    role: 'QA Lead',
    status: { label: 'In Office', color: 'green' },
    location: { country: 'Australia', flag: '🇦🇺' },
    activity: 'Today, 11:00',
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
    name: 'Isabella Costa',
    email: 'isabella.costa@gmail.com',
    role: 'Scrum Master',
    status: { label: 'Remote', color: 'blue' },
    location: { country: 'Italy', flag: '🇮🇹' },
    activity: 'Today, 16:45',
  },
];

type StatusColor = 'blue' | 'red' | 'green';

const statusColor: Record<StatusColor, string> = {
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  green: 'bg-green-100 text-green-700',
};

const DummyPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    return dummyData.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div>
      <div className="mt-4 mb-6">
        <h1 className="text-3xl text-gray-900">Team Members</h1>
        <p className="text-gray-500 text-base mt-1">Manage and view your team members.</p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search Users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-64 text-sm"
        />
        <button className="border rounded px-3 py-2 text-sm flex items-center gap-2">
          <span>Status</span>
        </button>
        <button className="border rounded px-3 py-2 text-sm flex items-center gap-2">
          <span>Sort Order</span>
        </button>
        <div className="flex-1" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm">
          Filters
        </button>
        <button className="border px-4 py-2 rounded text-sm">Columns</button>
      </div>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((user, idx) => (
              <tr key={user.email} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{user.role}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor[user.status.color as StatusColor]}`}>
                    ● {user.status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center gap-2 align-middle">
                    <span className="text-base" style={{ lineHeight: 1 }}>{user.location.flag}</span>
                    <span>{user.location.country}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{user.activity}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <span className="text-xl">⋮</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          Rows per page
          <select 
            value={itemsPerPage} 
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span>
            {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-gray-100 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded border text-sm ${
                    currentPage === page
                      ? 'border-blue-200 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                {currentPage > 3 && <span className="px-2">...</span>}
                {currentPage > 3 && (
                  <button
                    onClick={() => handlePageChange(currentPage)}
                    className="w-7 h-7 flex items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm"
                  >
                    {currentPage}
                  </button>
                )}
                {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                {currentPage < totalPages - 2 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-700 text-sm"
                  >
                    {totalPages}
                  </button>
                )}
              </>
            )}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-gray-100 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>    
    </div>
  );
};

export default DummyPage; 