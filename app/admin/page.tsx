import React from "react"
import {
  Calendar,
  ChevronDown,
  Download,
  Recycle,
  TrendingUp,
  Users,
  ArrowUp,
  ShieldAlert,
  Flag,
  Server,
  Activity,
  Truck,
  AlertTriangle,
  Coins,
  MoreHorizontal,
  Check,
  X
} from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#191c1e] mb-1 tracking-tight">Dashboard</h2>
          <p className="text-[#3e4a3d] text-sm">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month Filter Pill */}
          <div className="flex items-center bg-white border border-[#bdcaba] rounded-full px-4 py-1.5 shadow-sm text-sm font-medium text-[#191c1e] cursor-pointer hover:bg-[#f2f4f7] transition-colors">
            <Calendar className="w-4 h-4 mr-2 text-[#6e7b6c]" />
            This Month
            <ChevronDown className="w-4 h-4 ml-1 text-[#6e7b6c]" />
          </div>
          {/* Export Button */}
          <button className="h-9 px-4 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#374151] hover:bg-[#f2f4f7] flex items-center gap-2 shadow-sm transition-all active:scale-95">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* 2. Stat Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        
        {/* Card 1: HERO */}
        <div className="bg-[#1A3C2E] rounded-xl p-5 relative overflow-hidden transition-all hover:-translate-y-1 shadow-md hover:shadow-lg">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#006b2c] rounded-full opacity-20 blur-xl"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-[#aacfbb] font-medium text-sm">Waste Collected</p>
            <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
              <Recycle className="w-5 h-5 text-white" />
            </div>
          </div>
          <h3 className="text-3xl text-[#B6FF00] font-bold mb-2 relative z-10 tracking-tight">12,540 kg</h3>
          <div className="flex items-center gap-2 relative z-10">
            <span className="inline-flex items-center bg-[#B6FF00]/20 text-[#B6FF00] text-xs font-semibold px-2 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.2%
            </span>
            <span className="text-xs text-[#c5ebd7]">vs last month</span>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="bg-white rounded-xl p-5 border border-[#bdcaba] shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[#3e4a3d] font-medium text-sm">Active Users</p>
            <div className="bg-[#006b2c]/10 p-1.5 rounded-lg text-[#006b2c]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl text-[#191c1e] font-semibold mb-2">3,842</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center text-[#006b2c] text-xs font-semibold">
              <ArrowUp className="w-3 h-3 mr-0.5" />
              +3.3%
            </span>
            <span className="text-xs text-[#6e7b6c]">vs last month</span>
          </div>
        </div>

        {/* Card 3: KYC Pending */}
        <div className="bg-white rounded-xl p-5 border border-[#bdcaba] shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[#3e4a3d] font-medium text-sm">KYC Pending</p>
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl text-[#191c1e] font-semibold mb-2">28</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-600 font-medium">Requires review</span>
          </div>
        </div>

        {/* Card 4: Flagged Posts */}
        <div className="bg-white rounded-xl p-5 border border-[#bdcaba] shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[#3e4a3d] font-medium text-sm">Flagged Posts</p>
            <div className="bg-red-100 p-1.5 rounded-lg text-red-600">
              <Flag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl text-[#191c1e] font-semibold mb-2">6</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded">
              2 urgent
            </span>
            <span className="text-xs text-[#6e7b6c]">Action needed</span>
          </div>
        </div>
      </div>

      {/* 3. Platform Health Strip */}
      <div className="w-full bg-[#1A3C2E] rounded-xl p-4 mb-6 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 border border-[#2c4d3e] shadow-sm">
        <div className="flex items-center gap-2 border-r border-[#2c4d3e] pr-4 py-1">
          <Server className="w-4 h-4 text-[#bdcaba]" />
          <span className="text-[#bdcaba] text-sm">Uptime:</span>
          <span className="text-[#B6FF00] font-semibold text-sm">99.8%</span>
        </div>
        <div className="flex items-center gap-2 border-r border-[#2c4d3e] pr-4 py-1">
          <Activity className="w-4 h-4 text-[#bdcaba]" />
          <span className="text-[#bdcaba] text-sm">API Latency:</span>
          <span className="text-[#B6FF00] font-semibold text-sm">312ms</span>
        </div>
        <div className="flex items-center gap-2 border-r border-[#2c4d3e] pr-4 py-1">
          <Truck className="w-4 h-4 text-[#bdcaba]" />
          <span className="text-[#bdcaba] text-sm">Active Collectors:</span>
          <span className="text-[#B6FF00] font-semibold text-sm">184</span>
        </div>
        <div className="flex items-center gap-2 border-r border-[#2c4d3e] pr-4 py-1">
          <AlertTriangle className="w-4 h-4 text-[#bdcaba]" />
          <span className="text-[#bdcaba] text-sm">Failed Jobs:</span>
          <span className="text-red-400 font-semibold text-sm">3</span>
        </div>
        <div className="flex items-center gap-2 py-1">
          <Coins className="w-4 h-4 text-[#bdcaba]" />
          <span className="text-[#bdcaba] text-sm">Pending Withdrawals:</span>
          <span className="text-amber-400 font-semibold text-sm">12</span>
        </div>
      </div>

      {/* 4. Main Grid (2fr 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2fr) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Chart Widget (Pure CSS Implementation based on HTML) */}
          <div className="bg-white rounded-xl border border-[#bdcaba] shadow-sm p-5 flex flex-col hover:-translate-y-0.5 transition-transform duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-semibold text-[#191c1e]">Waste Collection Volume</h3>
              <div className="flex bg-[#f2f4f7] rounded-lg p-1 border border-[#bdcaba]">
                <button className="px-3 py-1 text-xs font-medium rounded bg-white shadow-sm text-[#191c1e]">Monthly</button>
                <button className="px-3 py-1 text-xs font-medium rounded text-[#3e4a3d] hover:text-[#191c1e]">Yearly</button>
              </div>
            </div>
            
            <div className="relative flex-1 min-h-[260px] flex items-end gap-2 pt-8">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-[#6e7b6c] pr-2 w-10 border-r border-[#bdcaba]/30 text-right">
                <span>15k</span>
                <span>10k</span>
                <span>5k</span>
                <span>0</span>
              </div>
              
              {/* Grid lines */}
              <div className="absolute left-10 right-0 top-0 bottom-6 flex flex-col justify-between z-0 pointer-events-none">
                <div className="w-full h-px bg-[#bdcaba]/20"></div>
                <div className="w-full h-px bg-[#bdcaba]/20"></div>
                <div className="w-full h-px bg-[#bdcaba]/20"></div>
                <div className="w-full h-px bg-[#bdcaba]/20"></div>
              </div>
              
              {/* Bars */}
              <div className="ml-10 w-full h-full flex items-end justify-between z-10 pb-6 px-2">
                {[
                  { month: 'Jul', height: '20%', value: '3.2k', active: false },
                  { month: 'Aug', height: '25%', value: '4.1k', active: false },
                  { month: 'Sep', height: '35%', value: '5.5k', active: false },
                  { month: 'Oct', height: '30%', value: '4.8k', active: false },
                  { month: 'Nov', height: '45%', value: '7.2k', active: false },
                  { month: 'Dec', height: '40%', value: '6.4k', active: false },
                  { month: 'Jan', height: '55%', value: '8.8k', active: false },
                  { month: 'Feb', height: '50%', value: '8.0k', active: false },
                  { month: 'Mar', height: '65%', value: '10.4k', active: false },
                  { month: 'Apr', height: '75%', value: '12.0k', active: false },
                  { month: 'May', height: '85%', value: '13.6k', active: false },
                  { month: 'Jun', height: '95%', value: '12.5k', active: true },
                ].map((data, index) => (
                  <div key={index} 
                    className={`w-[8%] rounded-t-sm transition-colors relative group ${data.active ? 'bg-[#005320] shadow-[0_0_8px_rgba(0,107,44,0.4)]' : 'bg-[#006b2c]/60 hover:bg-[#006b2c]'}`} 
                    style={{ height: data.height }}>
                    
                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2d3133] text-white text-xs py-1 px-2 rounded ${data.active ? 'opacity-100 z-20' : 'opacity-0 group-hover:opacity-100'} transition-opacity pointer-events-none`}>
                      {data.value}
                    </div>
                    
                    <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs ${data.active ? 'font-semibold text-[#006b2c]' : 'text-[#6e7b6c]'}`}>
                      {data.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-xl border border-[#bdcaba] shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#bdcaba] flex justify-between items-center bg-[#f7f9fc]">
              <h3 className="text-base font-semibold text-[#191c1e]">Recent Activity</h3>
              <button className="text-[#006b2c] text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#bdcaba] bg-[#ffffff] text-xs text-[#6e7b6c] uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#bdcaba]/50">
                  <tr className="hover:bg-[#f2f4f7] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#006b2c]/10 text-[#006b2c] flex items-center justify-center font-bold text-xs">LB</div>
                        <span className="font-medium text-[#191c1e]">Lyes Boudiaf</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#3e4a3d]">Posted 50kg Plastic</td>
                    <td className="px-5 py-3"><span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Plastic</span></td>
                    <td className="px-5 py-3 text-[#6e7b6c] text-xs">2 mins ago</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center bg-[#F0FDF4] text-[#006b2c] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#006b2c]/20">Approved</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#f2f4f7] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#c2e8d4] text-[#476a5a] flex items-center justify-center font-bold text-xs">SR</div>
                        <span className="font-medium text-[#191c1e]">Soraya Rahmani</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#3e4a3d]">KYC Submission</td>
                    <td className="px-5 py-3"><span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Account</span></td>
                    <td className="px-5 py-3 text-[#6e7b6c] text-xs">15 mins ago</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center bg-amber-50 text-amber-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">Pending</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#f2f4f7] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#5a8000] text-[#faffe8] flex items-center justify-center font-bold text-xs">AB</div>
                        <span className="font-medium text-[#191c1e]">Amine Bouzidi</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#3e4a3d]">Pickup Request</td>
                    <td className="px-5 py-3"><span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-700"></span>Logistics</span></td>
                    <td className="px-5 py-3 text-[#6e7b6c] text-xs">1 hour ago</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center bg-[#F0FDF4] text-[#006b2c] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#006b2c]/20">Approved</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#f2f4f7] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#e0e3e6] text-[#3e4a3d] flex items-center justify-center font-bold text-xs">MC</div>
                        <span className="font-medium text-[#191c1e]">Mehdi Chafik</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#3e4a3d]">Withdrawal 500 DZD</td>
                    <td className="px-5 py-3"><span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Finance</span></td>
                    <td className="px-5 py-3 text-[#6e7b6c] text-xs">2 hours ago</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center bg-red-50 text-red-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-red-200">Rejected</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1fr) */}
        <div className="flex flex-col gap-6">
          
          {/* KYC Queue Widget */}
          <div className="bg-white rounded-xl border border-[#bdcaba] shadow-sm flex flex-col hover:-translate-y-0.5 transition-transform duration-300">
            <div className="p-4 border-b border-[#bdcaba] flex justify-between items-center bg-[#f7f9fc] rounded-t-xl">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#191c1e]">KYC Queue</h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">28</span>
              </div>
              <button className="text-[#6e7b6c] hover:text-[#006b2c] transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-2 flex flex-col gap-1">
              {[
                { name: 'Karim Benali', role: 'Collector', img: 3 },
                { name: 'Fatima Zohra', role: 'Household', img: 4 },
                { name: 'Youcef Mammeri', role: 'Business', img: 5 },
                { name: 'Amina Khelil', role: 'Household', img: 6, muted: true },
              ].map((user, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-lg hover:bg-[#f2f4f7] transition-colors group ${user.muted ? 'border-t border-[#bdcaba]/30 mt-1 pt-3' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-slate-200 overflow-hidden ${user.muted ? 'opacity-70' : ''}`}>
                      <img alt={user.name} className="w-full h-full object-cover" src={`http://googleusercontent.com/profile/picture/${user.img}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium text-[#191c1e] leading-tight ${user.muted ? 'opacity-70' : ''}`}>{user.name}</p>
                      <p className="text-xs text-[#6e7b6c]">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-7 h-7 rounded bg-green-50 text-[#006b2c] hover:bg-green-100 flex items-center justify-center border border-green-200 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="w-7 h-7 rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center border border-red-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[#bdcaba] bg-[#f7f9fc] rounded-b-xl text-center">
              <button className="text-sm font-medium text-[#006b2c] hover:underline">View All 28 Requests</button>
            </div>
          </div>

          {/* Waste by Category Donut */}
          <div className="bg-white rounded-xl border border-[#bdcaba] shadow-sm p-5 flex flex-col hover:-translate-y-0.5 transition-transform duration-300 min-h-[320px]">
            <h3 className="text-base font-semibold text-[#191c1e] mb-4">Waste by Category</h3>
            
            <div className="relative flex-1 flex items-center justify-center min-h-[160px] my-2">
              {/* CSS Donut approximation */}
              <div 
                className="w-32 h-32 rounded-full border-[12px] border-[#eceef1] relative" 
                style={{ background: "conic-gradient(#3b82f6 0% 38%, #10b981 38% 60%, #64748b 60% 78%, #f59e0b 78% 92%, #8b5cf6 92% 100%)" }}
              >
                <div className="absolute inset-0 bg-white rounded-full m-1 border-4 border-white shadow-inner flex flex-col items-center justify-center z-10">
                  <span className="text-lg font-bold text-[#191c1e] leading-none">12.5t</span>
                  <span className="text-[10px] text-[#6e7b6c]">Total</span>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500"></div><span className="text-[#3e4a3d] text-xs">Plastic</span></div>
                <span className="font-medium text-xs">38%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div><span className="text-[#3e4a3d] text-xs">Glass</span></div>
                <span className="font-medium text-xs">22%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-slate-500"></div><span className="text-[#3e4a3d] text-xs">Metal</span></div>
                <span className="font-medium text-xs">18%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-amber-500"></div><span className="text-[#3e4a3d] text-xs">Organic</span></div>
                <span className="font-medium text-xs">14%</span>
              </div>
              <div className="flex items-center justify-between col-span-2">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-purple-500"></div><span className="text-[#3e4a3d] text-xs">E-waste</span></div>
                <span className="font-medium text-xs">8%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}