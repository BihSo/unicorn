import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
} from "../ui/dialog"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import {
    Loader2,
    User,
    Building2,
    Flag,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    Shield,
    AlertCircle,
    Copy,
    Calendar,
    MessageSquare,
    ExternalLink,
    AlertTriangle,

    ArrowRight,
    Trash2,
} from 'lucide-react'
import { getReportDetails, Report } from '../../lib/api'
import { formatDate } from '../../lib/utils'
import { toast } from 'sonner'
import { Card, CardContent } from '../ui/card'
import { UserDetailsModal } from './UserDetailsModal'
import { StartupDetailsDialog } from './StartupDetailsDialog'
import { Button } from '../ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { WarnStartupDialog, StartupStatusDialog, DeleteStartupDialog } from "./StartupActionDialogs"
import { Startup } from '../../types'

const REPORT_REASON_LABELS: Record<string, string> = {
    SPAM: 'Spam',
    HARASSMENT: 'Harassment',
    INAPPROPRIATE_CONTENT: 'Inappropriate Content',
    FRAUD: 'Fraud',
    DUPLICATE: 'Duplicate',
    COPYRIGHT: 'Copyright Infringement',
    IMPERSONATION: 'Impersonation',
    ADULT_CONTENT: 'Adult Content',
    VIOLENCE: 'Violence or Threats',
    HATE_SPEECH: 'Hate Speech',
    MISINFORMATION: 'Misinformation',
    OTHER: 'Other',
}

interface ReportDetailsDialogProps {
    reportId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onReportUpdated?: () => void
}

export function ReportDetailsDialog({ reportId, open, onOpenChange, onReportUpdated: _ }: ReportDetailsDialogProps) {
    const [report, setReport] = useState<Report | null>(null)
    const [loading, setLoading] = useState(false)
    const [viewUserId, setViewUserId] = useState<string | null>(null)
    const [viewStartupId, setViewStartupId] = useState<string | null>(null)

    // Action Dialog States for Startup
    const [warnStartupOpen, setWarnStartupOpen] = useState(false)
    const [statusStartupOpen, setStatusStartupOpen] = useState(false)
    const [deleteStartupOpen, setDeleteStartupOpen] = useState(false)

    useEffect(() => {
        if (open && reportId) {
            loadReport()
        }
    }, [open, reportId])

    const loadReport = async () => {
        if (!reportId) return

        setLoading(true)
        try {
            const data = await getReportDetails(reportId)
            setReport(data)
        } catch (error: any) {
            console.error('Failed to load report:', error)
            toast.error('Failed to load report details')
        } finally {
            setLoading(false)
        }
    }

    const handleViewReported = () => {
        if (!report) return
        if (report.reportedEntityType === 'USER') {
            setViewUserId(report.reportedEntityId)
        } else if (report.reportedEntityType === 'STARTUP') {
            setViewStartupId(report.reportedEntityId)
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING': return {
                bg: "bg-amber-100 dark:bg-amber-900/30",
                text: "text-amber-700 dark:text-amber-400",
                border: "border-amber-200 dark:border-amber-800/50",
                icon: Clock,
                label: "Pending Review"
            }
            case 'UNDER_REVIEW': return {
                bg: "bg-blue-100 dark:bg-blue-900/30",
                text: "text-blue-700 dark:text-blue-400",
                border: "border-blue-200 dark:border-blue-800/50",
                icon: Eye,
                label: "Under Investigation"
            }
            case 'RESOLVED': return {
                bg: "bg-emerald-100 dark:bg-emerald-900/30",
                text: "text-emerald-700 dark:text-emerald-400",
                border: "border-emerald-200 dark:border-emerald-800/50",
                icon: CheckCircle2,
                label: "Resolved"
            }
            case 'REJECTED': return {
                bg: "bg-rose-100 dark:bg-rose-900/30",
                text: "text-rose-700 dark:text-rose-400",
                border: "border-rose-200 dark:border-rose-800/50",
                icon: XCircle,
                label: "Rejected"
            }
            default: return {
                bg: "bg-slate-100 dark:bg-slate-800",
                text: "text-slate-700 dark:text-slate-400",
                border: "border-slate-200 dark:border-slate-700",
                icon: AlertCircle,
                label: status
            }
        }
    }

    const CopyButton = ({ value }: { value: string }) => (
        <button
            onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(value)
                toast.success('ID copied!')
            }}
            className="p-1 hover:bg-muted rounded transition-all text-muted-foreground hover:text-foreground"
        >
            <Copy className="h-3 w-3" />
        </button>
    )

    if (!report && !loading) return null

    const statusConfig = report ? getStatusConfig(report.status) : null

    // Helper to create a temporary startup object for actions
    const tempStartup = report && report.reportedEntityType === 'STARTUP' ? {
        id: report.reportedEntityId,
        name: report.reportedEntityName || 'Startup',
        status: report.reportedEntityStatus || 'PENDING', // Default if missing
        // Other fields invalid but not needed for these specific dialogs
    } as Startup : null


    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden bg-background border-border sm:rounded-2xl max-h-[95vh] flex flex-col">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
                            </div>
                            <p className="text-muted-foreground font-medium animate-pulse">Retrieving report details...</p>
                        </div>
                    ) : report && statusConfig ? (
                        <>
                            {/* Header Section */}
                            <div className="bg-muted/30 border-b border-border p-6 pr-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold tracking-tight text-foreground">Report #{report.id.substring(0, 8)}</h2>
                                        <Badge variant="outline" className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} gap-1.5 py-1 pr-3`}>
                                            <statusConfig.icon className="h-3.5 w-3.5" />
                                            {statusConfig.label}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(report.createdAt)}
                                        </span>
                                        <Separator orientation="vertical" className="h-3 bg-border sm:block hidden" />
                                        <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => { navigator.clipboard.writeText(report.id); toast.success('Full ID Copied') }}>
                                            <span className="font-mono text-xs opacity-70">ID: {report.id}</span>
                                            <Copy className="h-3 w-3 transition-opacity" />
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats / Severity Indicator could go here */}
                                <div className="flex items-center gap-2">
                                    <div className="bg-background border border-border px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                                        <Flag className="h-4 w-4 text-orange-500" />
                                        <span className="text-sm font-semibold">{REPORT_REASON_LABELS[report.reason] || report.reason}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="p-6 space-y-8">

                                    {/* ENTITIES ROW - SIDE BY SIDE */}
                                    <div className="grid md:grid-cols-2 gap-6">

                                        {/* REPORTER (LEFT) - Often context starts here */}
                                        <Card className="group relative overflow-hidden bg-card/50 hover:bg-card transition-all border-border shadow-sm">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors" />
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                        Reporter
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={() => setViewUserId(report.reporterId)}>
                                                        View Profile <ArrowRight className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 ring-4 ring-background overflow-hidden">
                                                        {report.reporterImage ? (
                                                            <img src={report.reporterImage} alt="Reporter" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User className="h-6 w-6" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-foreground text-lg truncate">{report.reporterName || 'Platform User'}</p>
                                                        <div className="flex items-center gap-1.5 group/id">
                                                            <code className="text-xs text-muted-foreground font-mono bg-muted px-1.5 rounded">{report.reporterId}</code>
                                                            <CopyButton value={report.reporterId} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* TARGET (RIGHT) - The focus */}
                                        <Card className="group relative overflow-hidden bg-card/50 hover:bg-card transition-all border-border shadow-sm">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/50 group-hover:bg-orange-500 transition-colors" />
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                                                        <AlertTriangle className="h-3.5 w-3.5" />
                                                        Reported Entity
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={handleViewReported}>
                                                            View Details <ExternalLink className="h-3 w-3" />
                                                        </Button>
                                                        {report.reportedEntityType === 'STARTUP' && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                        <MoreVertical className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => setViewStartupId(report.reportedEntityId)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Manage Startup
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => setWarnStartupOpen(true)}>
                                                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                                                        Issue Warning
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setStatusStartupOpen(true)}>
                                                                        <Shield className="mr-2 h-4 w-4" />
                                                                        Change Status
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setDeleteStartupOpen(true)} className="text-red-600">
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete Startup
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 ring-4 ring-background overflow-hidden">
                                                        {report.reportedEntityImage ? (
                                                            <img src={report.reportedEntityImage} alt="Entity" className="h-full w-full object-cover" />
                                                        ) : (
                                                            report.reportedEntityType === 'USER' ? <User className="h-6 w-6" /> : <Building2 className="h-6 w-6" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-foreground text-lg capitalize truncate">{report.reportedEntityName || `${report.reportedEntityType.toLowerCase()} Account`}</p>
                                                        <div className="flex items-center gap-1.5 group/id">
                                                            <code className="text-xs text-muted-foreground font-mono bg-muted px-1.5 rounded">{report.reportedEntityId}</code>
                                                            <CopyButton value={report.reportedEntityId} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Separator className="bg-border/60" />

                                    {/* REPORT DETAILS CONTENT */}
                                    <div className="grid lg:grid-cols-3 gap-8">

                                        {/* MAIN CONTENT (Description) */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <div>
                                                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                                    <span className="bg-primary/10 text-primary p-1 rounded-md"><MessageSquare className="h-4 w-4" /></span>
                                                    Report Description
                                                </h3>
                                                <div className="bg-muted/30 p-5 rounded-xl border border-border/50 text-sm leading-relaxed text-foreground/90 shadow-sm min-h-[120px]">
                                                    {report.description}
                                                </div>
                                            </div>

                                            {/* RESOLUTION SECTION (Conditional) */}
                                            {(report.status === 'RESOLVED' || report.status === 'REJECTED') && (
                                                <div className="space-y-3 pt-2">
                                                    <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                                        <span className="bg-emerald-500/10 text-emerald-600 p-1 rounded-md"><Shield className="h-4 w-4" /></span>
                                                        Resolution Outcome
                                                    </h3>
                                                    <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
                                                        <div className="p-4 grid sm:grid-cols-2 gap-4 bg-muted/20">
                                                            <div>
                                                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Action Taken</span>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <Badge variant="secondary" className="bg-background font-mono">{report.adminAction || 'None'}</Badge>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Resolved On</span>
                                                                <div className="mt-1 text-sm font-medium">
                                                                    {report.resolvedAt ? formatDate(report.resolvedAt) : 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {(report.adminNotes || report.actionDetails) && (
                                                            <div className="p-4 border-t border-border space-y-3">
                                                                {report.actionDetails && (
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground block mb-1">System Action Details</span>
                                                                        <p className="bg-muted/50 p-2 rounded text-foreground/80 font-mono text-xs">{report.actionDetails}</p>
                                                                    </div>
                                                                )}
                                                                {report.adminNotes && (
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground block mb-1">Admin Notes</span>
                                                                        <p className="text-sm italic text-foreground/80 pl-2 border-l-2 border-primary/20">{report.adminNotes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="bg-muted/40 px-4 py-2 border-t border-border flex items-center gap-2 text-xs">
                                                            {report.notifyReporter ? (
                                                                <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Reporter was notified</span>
                                                            ) : (
                                                                <span className="flex items-center gap-1.5 text-muted-foreground"><XCircle className="h-3 w-3" /> Reporter was not notified</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* SIDEBAR METADATA */}
                                        <div className="space-y-6">
                                            <div className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Metadata</h4>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground">Type</span>
                                                        <Badge variant="outline" className="bg-background">{report.reportedEntityType}</Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground">Reason</span>
                                                        <span className="font-medium">{REPORT_REASON_LABELS[report.reason] || report.reason}</span>
                                                    </div>
                                                    <Separator className="bg-border/60" />
                                                    <div className="space-y-1">
                                                        <span className="text-xs text-muted-foreground">Submission Date</span>
                                                        <div className="flex items-center gap-2 text-sm font-medium">
                                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {formatDate(report.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs text-muted-foreground">Last Update</span>
                                                        <div className="flex items-center gap-2 text-sm font-medium">
                                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {formatDate(report.updatedAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog >

            <UserDetailsModal
                open={!!viewUserId}
                onOpenChange={(open) => !open && setViewUserId(null)}
                userId={viewUserId}
            />

            <StartupDetailsDialog
                open={!!viewStartupId}
                onOpenChange={(open) => !open && setViewStartupId(null)}
                startupId={viewStartupId}
                onActionComplete={() => {
                    // Refresh report if needed, though mostly unrelated unless status changed
                    if (reportId) loadReport()
                }}
            />

            {/* Startup Action Dialogs */}
            {
                tempStartup && (
                    <>
                        <WarnStartupDialog
                            open={warnStartupOpen}
                            onOpenChange={setWarnStartupOpen}
                            startup={tempStartup!}
                            onSuccess={() => { if (reportId) loadReport() }}
                        />
                        <StartupStatusDialog
                            open={statusStartupOpen}
                            onOpenChange={setStatusStartupOpen}
                            startup={tempStartup!}
                            onSuccess={() => { if (reportId) loadReport() }}
                        />
                        <DeleteStartupDialog
                            open={deleteStartupOpen}
                            onOpenChange={setDeleteStartupOpen}
                            startup={tempStartup!}
                            onSuccess={() => {
                                onOpenChange(false) // Close report dialog if entity deleted? Maybe just refresh
                                if (reportId) loadReport()
                            }}
                        />
                    </>
                )
            }
        </>
    )
}