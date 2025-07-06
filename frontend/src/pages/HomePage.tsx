import React from 'react'
import { Link } from 'react-router-dom'

const teams = [
  {
    name: 'Quality Assurance',
    desc: 'Product testing',
    rating: 5,
    date: '25 Sep, 2024',
    members: [
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/men/33.jpg',
    ],
  },
  {
    name: 'Legal Team',
    desc: 'Legal support',
    rating: 4,
    date: '25 Aug, 2024',
    members: [
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://randomuser.me/api/portraits/women/45.jpg',
    ],
  },
  {
    name: 'Product Management',
    desc: 'Product development & lifecycle',
    rating: 5,
    date: '21 Oct, 2024',
    members: [
      'https://randomuser.me/api/portraits/men/45.jpg',
      'https://randomuser.me/api/portraits/men/46.jpg',
      'https://randomuser.me/api/portraits/women/47.jpg',
      'https://randomuser.me/api/portraits/men/48.jpg',
    ],
  },
  {
    name: 'Finance Team',
    desc: 'Financial planning',
    rating: 5,
    date: '20 Sep, 2024',
    members: [
      'https://randomuser.me/api/portraits/men/49.jpg',
      'https://randomuser.me/api/portraits/men/50.jpg',
      'https://randomuser.me/api/portraits/men/51.jpg',
    ],
  },
  {
    name: 'Logistics Team',
    desc: 'Supply chain',
    rating: 3,
    date: '20 Aug, 2024',
    members: [
      'https://randomuser.me/api/portraits/men/52.jpg',
      'https://randomuser.me/api/portraits/men/53.jpg',
    ],
  },
]

const HomePage: React.FC = () => {
  return (
    <div className="kt-container-fixed py-8">
      {/* Breadcrumb and Title */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-1">Home</div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: 4 Cards in 2x2 grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="card flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">👤</span>
                <span className="font-semibold text-lg">Personal info</span>
              </div>
              <div className="text-gray-500 text-sm mb-4">
                Central hub for users: view data, change settings, see activity logs, manage tasks, get alerts, and more.
              </div>
            </div>
            <a href="#" className="text-blue-600 text-sm font-medium hover:underline">View page &rarr;</a>
          </div>
          {/* Login & Security */}
          <div className="card flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🔒</span>
                <span className="font-semibold text-lg">Login & Security</span>
              </div>
              <div className="text-gray-500 text-sm mb-4">
                Set passwords, enable 2FA, view login logs, update security questions, track account activity for better safety.
              </div>
            </div>
            <a href="#" className="text-blue-600 text-sm font-medium hover:underline">View page &rarr;</a>
          </div>
          {/* Billing & Payments */}
          <div className="card flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">💳</span>
                <span className="font-semibold text-lg">Billing & Payments</span>
              </div>
              <div className="text-gray-500 text-sm mb-4">
                Manage billing info, update payment methods, view transaction history, set up autopay, and track expenses easily.
              </div>
            </div>
            <a href="#" className="text-blue-600 text-sm font-medium hover:underline">View page &rarr;</a>
          </div>
          {/* Members, Teams & Roles */}
          <div className="card flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">👥</span>
                <span className="font-semibold text-lg">Members, Teams & Roles</span>
              </div>
              <div className="text-gray-500 text-sm mb-4">
                Manage members, assign roles, create teams, update permissions, view activity logs, and streamline team collaboration.
              </div>
            </div>
            <a href="#" className="text-blue-600 text-sm font-medium hover:underline">View page &rarr;</a>
          </div>
        </div>
        {/* Right: My Balance Card */}
        <div className="card flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-lg">My Balance</span>
            <button className="text-gray-400 hover:text-gray-600 text-sm">Export</button>
          </div>
          <div className="text-gray-400 text-xs mb-1">Available balance</div>
          <div className="text-3xl font-bold text-gray-900 mb-4">$9,395.72</div>
          {/* Toggle group */}
          <div className="flex space-x-2 mb-4">
            <button className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Today</button>
            <button className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100">Week</button>
            <button className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100">Month</button>
            <button className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100">Year</button>
          </div>
          {/* Chart placeholder */}
          <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400 mb-2">
            {/* Replace with chart */}
            <span>Chart</span>
          </div>
        </div>
        </div>
        
      {/* Second Row: Connect & Report Sharing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Connect Today & Join */}
        <div className="lg:col-span-2 card flex flex-col md:flex-row items-center justify-between p-6">
          <div className="flex items-center mb-4 md:mb-0">
            {/* Avatars */}
            <div className="flex -space-x-2 mr-4">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="A" className="w-8 h-8 rounded-full border-2 border-white" />
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="B" className="w-8 h-8 rounded-full border-2 border-white" />
              <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="C" className="w-8 h-8 rounded-full border-2 border-white" />
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white">+5</div>
            </div>
            <div>
              <div className="font-semibold text-lg mb-1">Connect Today & Join the <span className="text-blue-600">KeenThemes Network</span></div>
              <div className="text-gray-500 text-sm">Enhance your projects with premium themes and templates. Join the KeenThemes community today for top-quality designs and resources.</div>
            </div>
          </div>
          {/* Illustration */}
          <div className="hidden md:block ml-8">
            <div className="w-32 h-24 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-400">[Image]</span>
            </div>
          </div>
          <a href="#" className="text-blue-600 text-sm font-medium hover:underline mt-4 md:mt-0 md:ml-8">Get Started</a>
        </div>
        {/* Report Sharing Settings */}
        <div className="card flex flex-col h-full">
          <span className="font-semibold text-lg mb-2">Report Sharing Settings</span>
          <div className="flex flex-col gap-2">
            <label className="flex items-center cursor-pointer">
              <input type="radio" name="sharing" className="form-radio text-blue-600" defaultChecked />
              <span className="ml-2 text-gray-700">Only invited People</span>
              <span className="ml-2 text-gray-400 text-xs">Invite selected people via email.</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="radio" name="sharing" className="form-radio text-blue-600" />
              <span className="ml-2 text-gray-700">People with the link</span>
              <span className="ml-2 text-gray-400 text-xs">Create a public link for your report.</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="radio" name="sharing" className="form-radio text-blue-600" />
              <span className="ml-2 text-gray-700">Everyone</span>
              <span className="ml-2 text-gray-400 text-xs">Reports will be visible only for everyone.</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input type="radio" name="sharing" className="form-radio text-blue-600" />
              <span className="ml-2 text-gray-700">No one</span>
              <span className="ml-2 text-gray-400 text-xs">Reports will be visible only for you.</span>
            </label>
          </div>
        </div>
      </div>

      {/* Bottom Section: Integrations & Block List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integrations */}
        <div className="lg:col-span-2 card p-0">
          <div className="p-6 pb-2 font-semibold text-lg">Integrations</div>
          <div className="divide-y divide-gray-200">
            {/* Integration Row */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center">
                <span className="text-blue-600 text-2xl mr-3">🌐</span>
                <div>
                  <div className="font-medium">Google web.dev <span className="text-gray-400 text-xs">webdev@webdevmail.com</span></div>
                  <div className="text-gray-500 text-sm">Integrate for enhanced collaboration in web development.</div>
                </div>
              </div>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center">
                <span className="text-yellow-500 text-2xl mr-3">🟡</span>
                <div>
                  <div className="font-medium">Equacoin <span className="text-gray-400 text-xs">equacoin@cryptomail.com</span></div>
                  <div className="text-gray-500 text-sm">Streamline cryptocurrency transactions securely and efficiently.</div>
                </div>
              </div>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center">
                <span className="text-green-500 text-2xl mr-3">🟢</span>
                <div>
                  <div className="font-medium">Evernote <span className="text-gray-400 text-xs">evernote@notexample.com</span></div>
                  <div className="text-gray-500 text-sm">Streamline cryptocurrency transactions securely and efficiently.</div>
                </div>
              </div>
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        {/* Block List */}
        <div className="card flex flex-col h-full">
          <span className="font-semibold text-lg mb-2">Block List</span>
          <div className="text-gray-500 text-sm mb-2">Users on the block list are unable to send chat requests or messages to you anymore, ever, or again</div>
          <div className="flex mb-4">
            <input type="text" placeholder="Block new user" className="input-field mr-2" />
            <button className="btn-primary">Add</button>
          </div>
          {/* Blocked Users */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">E</span>
                <div>
                  <div className="font-medium">Esther Howard</div>
                  <div className="text-xs text-gray-400">6 commits</div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500">Remove</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">T</span>
                <div>
                  <div className="font-medium">Tyler Hero</div>
                  <div className="text-xs text-gray-400">29 commits</div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500">Remove</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">A</span>
          <div>
                  <div className="font-medium">Arlene McCoy</div>
                  <div className="text-xs text-gray-400">34 commits</div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500">Remove</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Teams Table & Manage Data Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        {/* Teams Table */}
        <div className="lg:col-span-2 card p-0 overflow-x-auto">
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <span className="font-semibold text-lg">Teams</span>
            <input type="text" placeholder="Search Teams..." className="input-field w-56" />
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Team <span className="align-middle">&#8597;</span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Last Modified <span className="align-middle">&#8597;</span></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Members <span className="align-middle">&#8597;</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {teams.map((team, idx) => (
                <tr key={team.name}>
                  <td className="px-4 py-3"><input type="checkbox" /></td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm text-gray-900">{team.name}</div>
                    <div className="text-xs text-gray-500">{team.desc}</div>
                  </td>
                  <td className="px-4 py-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < team.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{team.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex -space-x-2">
                      {team.members.map((m, i) => (
                        <img key={i} src={m} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white" />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination and rows per page */}
          <div className="flex items-center justify-between px-6 py-3 bg-white rounded-b-lg border-t border-gray-100 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              Rows per page
              <select className="border border-gray-200 rounded px-2 py-1 text-sm">
                <option>5</option>
                <option>10</option>
                <option>20</option>
              </select>
            </div>
            <div>1 - 5 of 15</div>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-gray-100 text-gray-400">&#8592;</button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-700 font-semibold">1</button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-700">2</button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-700">3</button>
              <button className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-gray-100 text-gray-400">&#8594;</button>
            </div>
          </div>
        </div>
        {/* Manage your Data Card */}
        <div className="card flex flex-col h-full p-0">
          <div className="p-6 border-b border-gray-100 font-semibold text-lg">Manage your Data</div>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between p-6">
              <div>
                <div className="font-medium text-gray-900">Download your data</div>
                <div className="text-gray-400 text-sm">Add an extra layer of security.</div>
              </div>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Start</button>
            </div>
            <div className="flex items-center justify-between p-6">
              <div>
                <div className="font-medium text-gray-900">Delete all of your data</div>
                <div className="text-gray-400 text-sm">Instantly sign out all services.</div>
              </div>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50">Delete</button>
            </div>
            <div className="flex items-center justify-between p-6">
              <div>
                <div className="font-medium text-gray-900">Auto Data Purge</div>
                <div className="text-gray-400 text-sm">Toggle automatic deletion of old data.</div>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
                <span className="ml-2"> </span>
              </label>
            </div>
            <div className="flex items-center justify-between p-6">
          <div>
                <div className="font-medium text-gray-900">Export your data</div>
                <div className="text-gray-400 text-sm">Download a copy of your data</div>
              </div>
              <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                <span className="inline-block align-middle">&#8599;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
  )
}

export default HomePage 