import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import {
    Filter, ChevronDown, ChevronUp, RotateCcw,
    Ban, User, Mail, Globe, Shield, Calendar, Briefcase
} from 'lucide-react'
import { cn } from '../../lib/utils'

export interface FilterState {
    // Text filters
    email?: string
    emailNegate?: boolean
    username?: string
    usernameNegate?: boolean
    firstName?: string
    firstNameNegate?: boolean
    lastName?: string
    lastNameNegate?: boolean
    country?: string
    countryNegate?: boolean

    // Select filters
    role?: string
    roleNegate?: boolean
    status?: string
    statusNegate?: boolean
    authProvider?: string
    authProviderNegate?: boolean

    // Date filters
    createdAtFrom?: string
    createdAtTo?: string
    createdAtNegate?: boolean
    lastLoginFrom?: string
    lastLoginTo?: string
    lastLoginNegate?: boolean

    // Boolean filters
    hasInvestorProfile?: boolean
    hasInvestorProfileNegate?: boolean
    hasStartups?: boolean
    hasStartupsNegate?: boolean
    isSuspended?: boolean
    isSuspendedNegate?: boolean

    // New additions
    minWarningCount?: number
    minWarningCountNegate?: boolean
    hasActiveSession?: boolean
    hasActiveSessionNegate?: boolean

    isMemberOfStartups?: boolean
    isMemberOfStartupsNegate?: boolean

    // New API Filters
    id?: string
    idNegate?: boolean
    updatedAtFrom?: string
    updatedAtTo?: string
    updatedAtNegate?: boolean
    isVerifiedInvestor?: boolean
    isVerifiedInvestorNegate?: boolean
}

interface UserFiltersProps {
    filters: FilterState
    onFiltersChange: (filters: FilterState) => void
    onApply: () => void
    onClear: () => void
}

const ROLES = ['ADMIN', 'INVESTOR', 'STARTUP_OWNER'] as const
const STATUSES = ['ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED', 'PENDING_VERIFICATION'] as const
const AUTH_PROVIDERS = ['LOCAL', 'GOOGLE'] as const

// Helper component for filter row with negate toggle
const FilterRow = ({
    label,
    icon: Icon,
    children,
    negateValue,
    onNegateChange,
    hasValue
}: {
    label: string
    icon: React.ElementType
    children: React.ReactNode
    negateValue?: boolean
    onNegateChange: (checked: boolean) => void
    hasValue?: boolean
}) => (
    <div className={cn(
        "group space-y-2 p-3 rounded-xl border transition-all duration-200",
        // Default state
        !hasValue && "border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10",
        // Active state (Green border)
        hasValue && !negateValue && "bg-slate-50/80 dark:bg-slate-900/50 border-emerald-500/50 shadow-sm shadow-emerald-500/10",
        // Negated state (Red border)
        hasValue && negateValue && "bg-slate-50/80 dark:bg-slate-900/50 border-red-500/50 shadow-sm shadow-red-500/10"
    )}>
        <div className="flex items-center justify-between">
            <Label className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                hasValue && !negateValue ? "text-emerald-700 dark:text-emerald-400" :
                    hasValue && negateValue ? "text-red-700 dark:text-red-400" :
                        "text-slate-700 dark:text-slate-300"
            )}>
                <div className={cn(
                    "p-1.5 rounded-lg transition-colors big-icon-wrapper",
                    hasValue && !negateValue ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20" :
                        hasValue && negateValue ? "bg-red-100 text-red-600 dark:bg-red-500/20" :
                            "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                    <Icon className="h-4 w-4" />
                </div>
                {label}
            </Label>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={cn(
                    "text-[10px] uppercase font-bold tracking-wider",
                    negateValue ? "text-red-500" : "text-muted-foreground"
                )}>Exclude</span>
                <Switch
                    checked={negateValue || false}
                    onCheckedChange={onNegateChange}
                    className="scale-75 data-[state=checked]:bg-red-500"
                />
            </div>
        </div>
        <div className="transition-all duration-200 relative">
            {children}
        </div>
    </div>
)

export function UserFilters({ filters, onFiltersChange, onApply, onClear }: UserFiltersProps) {
    const [expanded, setExpanded] = useState(false)

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        onFiltersChange({ ...filters, [key]: value })
    }

    const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
        if (key.endsWith('Negate')) return false
        return value !== undefined && value !== '' && value !== null
    }).length

    return (
        <Card className="mb-6 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div
                className={cn(
                    "py-4 px-6 cursor-pointer transition-all duration-300 flex items-center justify-between select-none relative overflow-hidden",
                    expanded
                        ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white"
                        : "bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900"
                )}
                onClick={() => setExpanded(!expanded)}
            >
                {/* Background Pattern for expanded state */}
                {expanded && (
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 to-cyan-400 pointer-events-none" />
                )}

                <div className="flex items-center gap-3 relative z-10">
                    <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                        expanded
                            ? "bg-white/10 text-white backdrop-blur-sm"
                            : "bg-primary/10 text-primary"
                    )}>
                        <Filter className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className={cn("text-base font-bold tracking-tight", expanded ? "text-white" : "text-foreground")}>
                            Advanced Filtering
                        </h3>
                        <p className={cn("text-xs font-medium", expanded ? "text-white/70" : "text-muted-foreground")}>
                            {activeFilterCount === 0
                                ? "Refine your user search"
                                : `${activeFilterCount} active filters applied`
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    {activeFilterCount > 0 && (
                        <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold shadow-sm border",
                            expanded
                                ? "bg-white/20 text-white border-white/10 backdrop-blur-md"
                                : "bg-primary/10 text-primary border-primary/20"
                        )}>
                            {activeFilterCount} Active
                        </span>
                    )}
                    <div className={cn(
                        "p-2 rounded-lg transition-colors duration-200",
                        expanded ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                    )}>
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="animate-in slide-in-from-top-4 duration-300 ease-out">
                    <CardContent className="p-6 bg-slate-50/50 dark:bg-slate-900/50 space-y-8">
                        {/* Text Filters Section */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 pl-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                User Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <FilterRow
                                    label="User ID (UUID)"
                                    icon={Shield}
                                    negateValue={filters.idNegate}
                                    onNegateChange={(checked) => updateFilter('idNegate', checked)}
                                    hasValue={!!filters.id}
                                >
                                    <Input
                                        placeholder="Search by UUID..."
                                        value={filters.id || ''}
                                        onChange={(e) => updateFilter('id', e.target.value || undefined)}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors font-mono text-xs"
                                    />
                                </FilterRow>
                                <FilterRow
                                    label="Email"
                                    icon={Mail}
                                    negateValue={filters.emailNegate}
                                    onNegateChange={(checked) => updateFilter('emailNegate', checked)}
                                    hasValue={!!filters.email}
                                >
                                    <Input
                                        placeholder="Search email..."
                                        value={filters.email || ''}
                                        onChange={(e) => updateFilter('email', e.target.value || undefined)}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
                                    />
                                </FilterRow>

                                <FilterRow
                                    label="Username"
                                    icon={User}
                                    negateValue={filters.usernameNegate}
                                    onNegateChange={(checked) => updateFilter('usernameNegate', checked)}
                                    hasValue={!!filters.username}
                                >
                                    <Input
                                        placeholder="Search username..."
                                        value={filters.username || ''}
                                        onChange={(e) => updateFilter('username', e.target.value || undefined)}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
                                    />
                                </FilterRow>

                                <FilterRow
                                    label="First Name"
                                    icon={User}
                                    negateValue={filters.firstNameNegate}
                                    onNegateChange={(checked) => updateFilter('firstNameNegate', checked)}
                                    hasValue={!!filters.firstName}
                                >
                                    <Input
                                        placeholder="Search first name..."
                                        value={filters.firstName || ''}
                                        onChange={(e) => updateFilter('firstName', e.target.value || undefined)}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
                                    />
                                </FilterRow>

                                <FilterRow
                                    label="Last Name"
                                    icon={User}
                                    negateValue={filters.lastNameNegate}
                                    onNegateChange={(checked) => updateFilter('lastNameNegate', checked)}
                                    hasValue={!!filters.lastName}
                                >
                                    <Input
                                        placeholder="Search last name..."
                                        value={filters.lastName || ''}
                                        onChange={(e) => updateFilter('lastName', e.target.value || undefined)}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
                                    />
                                </FilterRow>

                                <FilterRow
                                    label="Country"
                                    icon={Globe}
                                    negateValue={filters.countryNegate}
                                    onNegateChange={(checked) => updateFilter('countryNegate', checked)}
                                    hasValue={!!filters.country}
                                >
                                    <Input
                                        placeholder="Search country..."
                                        value={filters.country || ''}
                                        onChange={(e) => updateFilter('country', e.target.value || undefined)}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-colors"
                                    />
                                </FilterRow>
                            </div>
                        </div>

                        {/* Select Filters Section */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 pl-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                Account Status & Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <FilterRow
                                    label="Role"
                                    icon={Shield}
                                    negateValue={filters.roleNegate}
                                    onNegateChange={(checked) => updateFilter('roleNegate', checked)}
                                    hasValue={!!filters.role}
                                >
                                    <Select
                                        value={filters.role || '__ALL__'}
                                        onValueChange={(value) => updateFilter('role', value === '__ALL__' ? undefined : value)}
                                    >
                                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="All roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__ALL__">All roles</SelectItem>
                                            {ROLES.map(role => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FilterRow>

                                <FilterRow
                                    label="Status"
                                    icon={Ban}
                                    negateValue={filters.statusNegate}
                                    onNegateChange={(checked) => updateFilter('statusNegate', checked)}
                                    hasValue={!!filters.status}
                                >
                                    <Select
                                        value={filters.status || '__ALL__'}
                                        onValueChange={(value) => updateFilter('status', value === '__ALL__' ? undefined : value)}
                                    >
                                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__ALL__">All statuses</SelectItem>
                                            {STATUSES.map(status => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FilterRow>

                                <FilterRow
                                    label="Auth Provider"
                                    icon={Shield}
                                    negateValue={filters.authProviderNegate}
                                    onNegateChange={(checked) => updateFilter('authProviderNegate', checked)}
                                    hasValue={!!filters.authProvider}
                                >
                                    <Select
                                        value={filters.authProvider || '__ALL__'}
                                        onValueChange={(value) => updateFilter('authProvider', value === '__ALL__' ? undefined : value)}
                                    >
                                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="All providers" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__ALL__">All providers</SelectItem>
                                            {AUTH_PROVIDERS.map(provider => (
                                                <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FilterRow>
                            </div>
                        </div>

                        {/* Date Filters Section */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 pl-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Timeline
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <FilterRow
                                    label="Created At"
                                    icon={Calendar}
                                    negateValue={filters.createdAtNegate}
                                    onNegateChange={(checked) => updateFilter('createdAtNegate', checked)}
                                    hasValue={!!(filters.createdAtFrom || filters.createdAtTo)}
                                >
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            placeholder="From"
                                            value={filters.createdAtFrom || ''}
                                            onChange={(e) => updateFilter('createdAtFrom', e.target.value || undefined)}
                                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-white dark:[color-scheme:dark]"
                                        />
                                        <div className="flex items-center text-muted-foreground">-</div>
                                        <Input
                                            type="date"
                                            placeholder="To"
                                            value={filters.createdAtTo || ''}
                                            onChange={(e) => updateFilter('createdAtTo', e.target.value || undefined)}
                                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-white dark:[color-scheme:dark]"
                                        />
                                    </div>
                                </FilterRow>

                                <FilterRow
                                    label="Last Login"
                                    icon={Calendar}
                                    negateValue={filters.lastLoginNegate}
                                    onNegateChange={(checked) => updateFilter('lastLoginNegate', checked)}
                                    hasValue={!!(filters.lastLoginFrom || filters.lastLoginTo)}
                                >
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            placeholder="From"
                                            value={filters.lastLoginFrom || ''}
                                            onChange={(e) => updateFilter('lastLoginFrom', e.target.value || undefined)}
                                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-white dark:[color-scheme:dark]"
                                        />
                                        <div className="flex items-center text-muted-foreground">-</div>
                                        <Input
                                            type="date"
                                            placeholder="To"
                                            value={filters.lastLoginTo || ''}
                                            onChange={(e) => updateFilter('lastLoginTo', e.target.value || undefined)}
                                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-white dark:[color-scheme:dark]"
                                        />
                                    </div>
                                </FilterRow>


                                <FilterRow
                                    label="Last Updated"
                                    icon={Calendar}
                                    negateValue={filters.updatedAtNegate}
                                    onNegateChange={(checked) => updateFilter('updatedAtNegate', checked)}
                                    hasValue={!!(filters.updatedAtFrom || filters.updatedAtTo)}
                                >
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            placeholder="From"
                                            value={filters.updatedAtFrom || ''}
                                            onChange={(e) => updateFilter('updatedAtFrom', e.target.value || undefined)}
                                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-white dark:[color-scheme:dark]"
                                        />
                                        <div className="flex items-center text-muted-foreground">-</div>
                                        <Input
                                            type="date"
                                            placeholder="To"
                                            value={filters.updatedAtTo || ''}
                                            onChange={(e) => updateFilter('updatedAtTo', e.target.value || undefined)}
                                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-white dark:[color-scheme:dark]"
                                        />
                                    </div>
                                </FilterRow>
                            </div>
                        </div>

                        {/* Boolean Filters Section */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 pl-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Properties & Metrics
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <FilterRow
                                    label="Has Investor Profile"
                                    icon={User}
                                    negateValue={filters.hasInvestorProfileNegate}
                                    onNegateChange={(checked) => updateFilter('hasInvestorProfileNegate', checked)}
                                    hasValue={filters.hasInvestorProfile !== undefined}
                                >
                                    <Select
                                        value={filters.hasInvestorProfile === undefined ? '__ANY__' : String(filters.hasInvestorProfile)}
                                        onValueChange={(value) => updateFilter('hasInvestorProfile', value === '__ANY__' ? undefined : value === 'true')}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Any" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__ANY__">Any</SelectItem>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterRow>

                                <FilterRow
                                    label="Verified Investor"
                                    icon={Shield}
                                    negateValue={filters.isVerifiedInvestorNegate}
                                    onNegateChange={(checked) => updateFilter('isVerifiedInvestorNegate', checked)}
                                    hasValue={filters.isVerifiedInvestor !== undefined}
                                >
                                    <Select
                                        value={filters.isVerifiedInvestor === undefined ? '__ANY__' : String(filters.isVerifiedInvestor)}
                                        onValueChange={(value) => updateFilter('isVerifiedInvestor', value === '__ANY__' ? undefined : value === 'true')}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Any" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__ANY__">Any</SelectItem>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterRow>

                                <FilterRow
                                    label="Has Startups"
                                    icon={Briefcase}
                                    negateValue={filters.hasStartupsNegate}
                                    onNegateChange={(checked) => updateFilter('hasStartupsNegate', checked)}
                                    hasValue={filters.hasStartups !== undefined}
                                >
                                    <Select
                                        value={filters.hasStartups === undefined ? '__ANY__' : String(filters.hasStartups)}
                                        onValueChange={(value) => updateFilter('hasStartups', value === '__ANY__' ? undefined : value === 'true')}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Any" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__ANY__">Any</SelectItem>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterRow>

                                <FilterRow
                                    label="Joined Startups"
                                    icon={Briefcase}
                                    negateValue={filters.isMemberOfStartupsNegate}
                                    onNegateChange={(checked) => updateFilter('isMemberOfStartupsNegate', checked)}
                                    hasValue={filters.isMemberOfStartups !== undefined}
                                >
                                    <Select
                                        value={filters.isMemberOfStartups === undefined ? '__ANY__' : String(filters.isMemberOfStartups)}
                                        onValueChange={(value) => updateFilter('isMemberOfStartups', value === '__ANY__' ? undefined : value === 'true')}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Any" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__ANY__">Any</SelectItem>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterRow>

                                <FilterRow
                                    label="Is Suspended"
                                    icon={Ban}
                                    negateValue={filters.isSuspendedNegate}
                                    onNegateChange={(checked) => updateFilter('isSuspendedNegate', checked)}
                                    hasValue={filters.isSuspended !== undefined}
                                >
                                    <Select
                                        value={filters.isSuspended === undefined ? '__ANY__' : String(filters.isSuspended)}
                                        onValueChange={(value) => updateFilter('isSuspended', value === '__ANY__' ? undefined : value === 'true')}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Any" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__ANY__">Any</SelectItem>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterRow>

                                <FilterRow
                                    label="Active Session"
                                    icon={Shield}
                                    negateValue={filters.hasActiveSessionNegate}
                                    onNegateChange={(checked) => updateFilter('hasActiveSessionNegate', checked)}
                                    hasValue={filters.hasActiveSession !== undefined}
                                >
                                    <Select
                                        value={filters.hasActiveSession === undefined ? '__ANY__' : String(filters.hasActiveSession)}
                                        onValueChange={(value) => updateFilter('hasActiveSession', value === '__ANY__' ? undefined : value === 'true')}
                                    >
                                        <SelectTrigger className="h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                            <SelectValue placeholder="Any" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__ANY__">Any</SelectItem>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FilterRow>

                                <FilterRow
                                    label="Min Warnings"
                                    icon={Shield}
                                    negateValue={filters.minWarningCountNegate}
                                    onNegateChange={(checked) => updateFilter('minWarningCountNegate', checked)}
                                    hasValue={filters.minWarningCount !== undefined}
                                >
                                    <Input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={filters.minWarningCount || ''}
                                        onChange={(e) => updateFilter('minWarningCount', e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="h-8 text-xs bg-slate-50 dark:bg-slate-900"
                                    />
                                </FilterRow>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <Button
                                variant="outline"
                                onClick={onClear}
                                className="group gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            >
                                <RotateCcw className="h-4 w-4 group-hover:-rotate-180 transition-transform duration-500" />
                                Clear All
                            </Button>
                            <Button
                                onClick={onApply}
                                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                            >
                                <Filter className="h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent >
                </div >
            )
            }
        </Card >
    )
}
