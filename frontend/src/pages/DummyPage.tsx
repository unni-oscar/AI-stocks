import React from 'react';

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
];

type StatusColor = 'blue' | 'red' | 'green';

const statusColor: Record<StatusColor, string> = {
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  green: 'bg-green-100 text-green-700',
};

const DummyPage: React.FC = () => {
  return (
    <div className="max-w-6xl w-full">
      <div className="mt-4 mb-6">
        <h1 className="text-3xl text-gray-900">Team Members</h1>
        <p className="text-gray-500 text-base mt-1">Manage and view your team members.</p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search Users..."
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
              <th className="px-4 py-3">
                <input type="checkbox" />
              </th>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {dummyData.map((user, idx) => (
              <tr key={user.email} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input type="checkbox" />
                </td>
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
        <div>
          Rows per page
          <select className="ml-2 border rounded px-2 py-1">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>
        <div>
          1-10 of 33
          <button className="mx-2">&lt;</button>
          <button className="mx-2 font-bold text-blue-600">1</button>
          <button className="mx-2">2</button>
          <button className="mx-2">3</button>
          <button className="mx-2">4</button>
          <button className="mx-2">&gt;</button>
        </div>
      </div>
      <footer className="flex flex-col md:flex-row items-center justify-between mt-8 text-sm text-gray-400 gap-2 pb-2">
        <div>2025 &copy; <span className="font-medium text-gray-500">Keenthemes Inc.</span></div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Docs</a>
          <a href="#" className="hover:underline">Purchase</a>
          <a href="#" className="hover:underline">FAQ</a>
          <a href="#" className="hover:underline">Support</a>
          <a href="#" className="hover:underline">License</a>
        </div>
      </footer>
    </div>
  );
};

export default DummyPage; 