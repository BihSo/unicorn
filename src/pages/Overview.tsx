import { useEffect, useState } from 'react'
import { RevenueChart } from '../components/dashboard/RevenueChart'
import { UserGrowthChart } from '../components/dashboard/UserGrowthChart'
import { StartupDistributionChart } from '../components/dashboard/StartupDistributionChart'
import { Users, Rocket, DollarSign, Briefcase, Clock, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { fetchDashboardStats, DashboardStats } from '../lib/api'
import { formatNumber, formatCurrency } from '../lib/utils'
import { Alert, AlertDescription } from '../components/ui/alert'

export function Overview() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadStats() {
            try {
                setLoading(true)
                setError(null)
                const data = await fetchDashboardStats()
                setStats(data)
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err)
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }

        loadStats()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back! Here's what's happening with your platform today.
                    </p>
                </div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}. Using fallback data.
                    </AlertDescription>
                </Alert>
                {/* Fallback to mock data display */}
                <FallbackDashboard />
            </div>
        )
    }

    return (
        <div className="space-y-6">


            {/* KPI Cards */}
            {stats && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* Total Users */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                        <Users className="h-8 w-8 mb-3 opacity-80" />
                        <div className="text-3xl font-bold">{formatNumber(stats.totalUsers)}</div>
                        <div className="text-blue-100 text-sm">Total Users</div>
                        <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 opacity-70" />
                            <span className="text-sm">
                                <strong>+{stats.userGrowth}%</strong> growth this month
                            </span>
                        </div>
                    </div>

                    {/* Active Startups */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 p-5 text-white shadow-lg">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                        <Rocket className="h-8 w-8 mb-3 opacity-80" />
                        <div className="text-3xl font-bold">{formatNumber(stats.activeStartups)}</div>
                        <div className="text-purple-100 text-sm">Active Startups</div>
                        <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 opacity-70" />
                            <span className="text-sm">
                                <strong>+{stats.startupGrowth}%</strong> new this month
                            </span>
                        </div>
                    </div>

                    {/* MRR */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white shadow-lg">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                        <DollarSign className="h-8 w-8 mb-3 opacity-80" />
                        <div className="text-3xl font-bold">{formatCurrency(stats.mrr)}</div>
                        <div className="text-emerald-100 text-sm">Monthly Recurring Revenue</div>
                        <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 opacity-70" />
                            <span className="text-sm">
                                <strong>+{stats.mrrGrowth}%</strong> vs last month
                            </span>
                        </div>
                    </div>

                    {/* Active Investors */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-5 text-white shadow-lg">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                        <Briefcase className="h-8 w-8 mb-3 opacity-80" />
                        <div className="text-3xl font-bold">{formatNumber(stats.activeInvestors)}</div>
                        <div className="text-orange-100 text-sm">Active Investors</div>
                        <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 opacity-70" />
                            <span className="text-sm">
                                <strong>+{stats.investorGrowth}%</strong> new investors
                            </span>
                        </div>
                    </div>

                    {/* Pending Verifications */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 p-5 text-white shadow-lg">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                        <Clock className="h-8 w-8 mb-3 opacity-80" />
                        <div className="text-3xl font-bold">{formatNumber(stats.pendingVerifications)}</div>
                        <div className="text-yellow-100 text-sm">Pending Verifications</div>
                        <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 opacity-70" />
                            <span className="text-sm">Requires attention</span>
                        </div>
                    </div>

                    {/* Total Funding */}
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 p-5 text-white shadow-lg">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                        <TrendingUp className="h-8 w-8 mb-3 opacity-80" />
                        <div className="text-3xl font-bold">{formatCurrency(stats.totalFunding)}</div>
                        <div className="text-indigo-100 text-sm">Total Funding Raised</div>
                        <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                            <span className="text-sm">Across all startups</span>
                        </div>
                    </div>

                </div>
            )}

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-1 lg:col-span-2">
                    <RevenueChart />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <UserGrowthChart />
                <StartupDistributionChart />
            </div>
        </div>
    )
}

// Fallback dashboard with mock data
function FallbackDashboard() {
    const mockStats = {
        totalUsers: 12847,
        activeStartups: 342,
        mrr: 284500,
        activeInvestors: 156,
        pendingVerifications: 48,
        totalFunding: 12500000,
        userGrowth: 12.5,
        startupGrowth: 8.3,
        mrrGrowth: 15.7,
        investorGrowth: 5.2,
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* Total Users - Mock */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                    <Users className="h-8 w-8 mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{formatNumber(mockStats.totalUsers)}</div>
                    <div className="text-blue-100 text-sm">Total Users</div>
                    <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 opacity-70" />
                        <span className="text-sm">
                            <strong>+{mockStats.userGrowth}%</strong> growth this month
                        </span>
                    </div>
                </div>

                {/* Active Startups - Mock */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 p-5 text-white shadow-lg">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                    <Rocket className="h-8 w-8 mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{formatNumber(mockStats.activeStartups)}</div>
                    <div className="text-purple-100 text-sm">Active Startups</div>
                    <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 opacity-70" />
                        <span className="text-sm">
                            <strong>+{mockStats.startupGrowth}%</strong> new this month
                        </span>
                    </div>
                </div>

                {/* MRR - Mock */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white shadow-lg">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                    <DollarSign className="h-8 w-8 mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{formatCurrency(mockStats.mrr)}</div>
                    <div className="text-emerald-100 text-sm">Monthly Recurring Revenue</div>
                    <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 opacity-70" />
                        <span className="text-sm">
                            <strong>+{mockStats.mrrGrowth}%</strong> vs last month
                        </span>
                    </div>
                </div>

                {/* Active Investors - Mock */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-5 text-white shadow-lg">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                    <Briefcase className="h-8 w-8 mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{formatNumber(mockStats.activeInvestors)}</div>
                    <div className="text-orange-100 text-sm">Active Investors</div>
                    <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 opacity-70" />
                        <span className="text-sm">
                            <strong>+{mockStats.investorGrowth}%</strong> new investors
                        </span>
                    </div>
                </div>

                {/* Pending Verifications - Mock */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 p-5 text-white shadow-lg">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                    <Clock className="h-8 w-8 mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{formatNumber(mockStats.pendingVerifications)}</div>
                    <div className="text-yellow-100 text-sm">Pending Verifications</div>
                    <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 opacity-70" />
                        <span className="text-sm">Requires attention</span>
                    </div>
                </div>

                {/* Total Funding - Mock */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 p-5 text-white shadow-lg">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
                    <TrendingUp className="h-8 w-8 mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{formatCurrency(mockStats.totalFunding)}</div>
                    <div className="text-indigo-100 text-sm">Total Funding Raised</div>
                    <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
                        <span className="text-sm">Across all startups</span>
                    </div>
                </div>

            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-1 lg:col-span-2">
                    <RevenueChart />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <UserGrowthChart />
                <StartupDistributionChart />
            </div>
        </>
    )
}
