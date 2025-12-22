import { UsersTable } from '../components/dashboard/UsersTable'
import { KPICard } from '../components/dashboard/KPICard'
import { Users, Briefcase, Building2, UserCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../lib/axios'
import { formatNumber } from '../lib/utils'

interface UserStats {
    total: { value: number; newThisMonth: number }
    investors: { value: number; verifiedCount: number }
    startups: { value: number; totalRaised: number }
    active: { value: number; onlineNow: number }
}

export function UserManagement() {
    const [stats, setStats] = useState<UserStats>({
        total: { value: 0, newThisMonth: 0 },
        investors: { value: 0, verifiedCount: 0 },
        startups: { value: 0, totalRaised: 0 },
        active: { value: 0, onlineNow: 0 }
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/users/stats')
                setStats(response.data)
            } catch (error) {
                console.error('Failed to fetch user stats', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <div className="space-y-6">


            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Users"
                    value={isLoading ? "..." : formatNumber(stats.total.value)}
                    icon={Users}
                    iconColor="text-blue-500"
                    details={
                        <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">+{stats.total.newThisMonth}</span> new this month
                        </div>
                    }
                />
                <KPICard
                    title="Investors"
                    value={isLoading ? "..." : formatNumber(stats.investors.value)}
                    icon={Briefcase}
                    iconColor="text-emerald-500"
                    details={
                        <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">{stats.investors.verifiedCount}</span> verified
                        </div>
                    }
                />
                <KPICard
                    title="Startups"
                    value={isLoading ? "..." : formatNumber(stats.startups.value)}
                    icon={Building2}
                    iconColor="text-purple-500"
                    details={
                        <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">${formatNumber(stats.startups.totalRaised)}</span> raised total
                        </div>
                    }
                />
                <KPICard
                    title="Active Users"
                    value={isLoading ? "..." : formatNumber(stats.active.value)}
                    icon={UserCheck}
                    iconColor="text-orange-500"
                    details={
                        <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-green-500">● {stats.active.onlineNow}</span> active sessions
                        </div>
                    }
                />
            </div>

            {/* Users Table */}
            <UsersTable />
        </div>
    )
}
