import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Startup } from '../../types'
import { formatDate } from '../../lib/utils'
import { StartupDetailsDialog } from './StartupDetailsDialog'
import { fetchAllStartups as fetchStartupsApi } from '../../lib/api'
import { toast } from 'sonner'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { MoreVertical, Eye, AlertTriangle, Shield, Trash2 } from 'lucide-react'
import { WarnStartupDialog, StartupStatusDialog, DeleteStartupDialog } from './StartupActionDialogs'
import { useAuth } from '../../contexts/AuthContext'

export function StartupsTable() {
    const [startups, setStartups] = useState<Startup[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [memberEmail, setMemberEmail] = useState('')

    // Action Dialog States
    const [actionStartup, setActionStartup] = useState<Startup | null>(null)
    const [warnDialogOpen, setWarnDialogOpen] = useState(false)
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

    const fetchAllStartups = async () => {
        setLoading(true)
        try {
            const data = await fetchStartupsApi(0, 100, { memberEmail })
            setStartups(data.content)
        } catch (error: any) {
            toast.error(error.message || 'Failed to load startups')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllStartups()
    }, [])

    const handleRowClick = (startup: Startup) => {
        setSelectedStartup(startup)
        setIsModalOpen(true)
    }



    const handleActionComplete = () => {
        // Refresh the list after moderation action
        fetchAllStartups()
    }

    // Action Handlers
    const handleWarn = (e: React.MouseEvent, startup: Startup) => {
        e.stopPropagation()
        setActionStartup(startup)
        setWarnDialogOpen(true)
    }

    const handleStatusChange = (e: React.MouseEvent, startup: Startup) => {
        e.stopPropagation()
        setActionStartup(startup)
        setStatusDialogOpen(true)
    }

    const handleDelete = (e: React.MouseEvent, startup: Startup) => {
        e.stopPropagation()
        setActionStartup(startup)
        setDeleteDialogOpen(true)
    }

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-500/10 text-green-500 border-green-500/30'
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
            case 'REJECTED': return 'bg-red-500/10 text-red-500 border-red-500/30'
            case 'SUSPENDED': return 'bg-orange-500/10 text-orange-500 border-orange-500/30'
            case 'BANNED': return 'bg-destructive/10 text-destructive border-destructive/30'
            case 'ARCHIVED': return 'bg-gray-500/10 text-gray-500 border-gray-500/30'
            default: return 'bg-slate-800 text-slate-400 border border-slate-700'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading startups...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Startups</CardTitle>
                            <CardDescription>
                                {startups.length} startup{startups.length !== 1 ? 's' : ''} registered
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Search by member email..."
                                value={memberEmail}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemberEmail(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && fetchAllStartups()}
                                className="w-64"
                            />
                            <Button
                                onClick={fetchAllStartups}
                            >
                                Search
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {startups.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No startups found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Startup Name</TableHead>
                                    <TableHead>Industry</TableHead>
                                    <TableHead>Funding Goal</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Date Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {startups.map((startup) => (
                                    <TableRow
                                        key={startup.id}
                                        onClick={() => handleRowClick(startup)}
                                        className="cursor-pointer hover:bg-slate-800/50 transition-colors"
                                    >
                                        <TableCell className="font-medium">{startup.name}</TableCell>
                                        <TableCell>{startup.industry || '—'}</TableCell>
                                        <TableCell>
                                            {startup.fundingGoal ? formatCurrency(startup.fundingGoal) : '—'}
                                        </TableCell>
                                        <TableCell>{startup.ownerEmail}</TableCell>
                                        <TableCell>{formatDate(startup.createdAt)}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusBadgeClass(startup.status)}`}>
                                                {startup.status}
                                            </span>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-slate-800"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRowClick(startup)
                                                        }}
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4 text-blue-400" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 p-0"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowClick(startup) }}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={(e) => handleStatusChange(e, startup)}>
                                                                <Shield className="mr-2 h-4 w-4 text-blue-500" />
                                                                Change Status
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => handleWarn(e, startup)}>
                                                                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                                                                Issue Warning
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={(e) => handleDelete(e, startup)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Permanently
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Details Modal */}

            <StartupDetailsDialog
                startup={selectedStartup}
                open={isModalOpen}
                onOpenChange={(open) => {
                    setIsModalOpen(open)
                    if (!open) setSelectedStartup(null)
                }}
                onActionComplete={handleActionComplete}
            />

            {/* Action Dialogs */}
            {actionStartup && (
                <>
                    <WarnStartupDialog
                        startup={actionStartup}
                        open={warnDialogOpen}
                        onOpenChange={setWarnDialogOpen}
                        onSuccess={handleActionComplete}
                    />
                    <StartupStatusDialog
                        startup={actionStartup}
                        open={statusDialogOpen}
                        onOpenChange={setStatusDialogOpen}
                        onSuccess={handleActionComplete}
                    />
                    <DeleteStartupDialog
                        startup={actionStartup}
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        onSuccess={handleActionComplete}
                    />
                </>
            )}
        </>
    )
}
