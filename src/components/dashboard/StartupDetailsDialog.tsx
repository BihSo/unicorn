
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import {
    Facebook, Instagram, Twitter, Globe, UserCog,
    FileText, FileSpreadsheet, FilePieChart,
    Building2, Calendar, User, Layers, Clock, TrendingUp, Target, Users
} from "lucide-react"
import { formatDate } from "../../lib/utils"
import { Startup } from "../../types"
import { useAuth } from "../../contexts/AuthContext"
import { LogOut, Trash2, MoreVertical, BadgeCheck } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { removeStartupMember, unsignStartupMember, leaveStartup, unsignStartup } from "../../lib/api"
import { toast } from "sonner"
import { useState, MouseEvent } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog"

interface StartupDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    startup: Startup | null
    onTransfer?: (startup: Startup) => void
    onActionComplete?: () => void
}

export function StartupDetailsDialog({
    open,
    onOpenChange,
    startup,
    onTransfer,
    onActionComplete
}: StartupDetailsDialogProps) {
    if (!startup) return null

    const { user } = useAuth()

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        title: string
        description: string
        action: () => Promise<void>
        variant?: "default" | "destructive"
    }>({
        open: false,
        title: "",
        description: "",
        action: async () => { },
        variant: "default"
    })

    // Check membership status
    const currentMember = startup?.members?.find(m => m.userId === user?.id)
    const isMember = !!currentMember
    const isActiveMember = currentMember?.isActive

    const handleLeaveTeam = () => {
        if (!startup) return
        setConfirmDialog({
            open: true,
            title: "Leave Team",
            description: "Are you sure you want to leave this team? You will be marked as a past member.",
            variant: "destructive",
            action: async () => {
                try {
                    await leaveStartup(startup.id)
                    toast.success("You have left the team.")
                    onActionComplete?.()
                    onOpenChange(false)
                } catch (error) {
                    toast.error("Failed to leave team")
                    console.error(error)
                }
            }
        })
    }

    const handleUnsign = () => {
        if (!startup) return
        setConfirmDialog({
            open: true,
            title: "Unsign from Startup",
            description: "Are you sure you want to unsign? This will completely remove your membership record.",
            variant: "destructive",
            action: async () => {
                try {
                    await unsignStartup(startup.id)
                    toast.success("You have unsigned from the startup.")
                    onActionComplete?.()
                    onOpenChange(false)
                } catch (error) {
                    toast.error("Failed to unsign")
                    console.error(error)
                }
            }
        })
    }

    const handleRemoveMember = (memberId: string, memberName: string) => {
        if (!startup) return
        setConfirmDialog({
            open: true,
            title: "Remove Member",
            description: `Are you sure you want to remove ${memberName}? They will be marked as a past member.`,
            variant: "destructive",
            action: async () => {
                try {
                    await removeStartupMember(startup.id, memberId)
                    toast.success(`${memberName} removed from team.`)
                    onActionComplete?.()
                } catch (error) {
                    toast.error("Failed to remove member")
                    console.error(error)
                }
            }
        })
    }

    const handleUnsignMember = (memberId: string, memberName: string) => {
        if (!startup) return
        setConfirmDialog({
            open: true,
            title: "Delete Member",
            description: `Are you sure you want to delete ${memberName} from the team history? This cannot be undone.`,
            variant: "destructive",
            action: async () => {
                try {
                    await unsignStartupMember(startup.id, memberId)
                    toast.success(`${memberName} deleted from team history.`)
                    onActionComplete?.()
                } catch (error) {
                    toast.error("Failed to delete member")
                    console.error(error)
                }
            }
        })
    }

    const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || (startup?.ownerId === user?.id)

    const formatCurrency = (amount?: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount || 0)
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
            APPROVED: 'bg-green-500/10 text-green-600 border-green-200',
            REJECTED: 'bg-red-500/10 text-red-600 border-red-200',
        }
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        )
    }

    const getStageBadge = (stage: string) => {
        return (
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${['IDEA', 'MVP'].includes(stage) ? 'bg-blue-500' :
                    ['SEED', 'SERIES_A'].includes(stage) ? 'bg-purple-500' :
                        'bg-orange-500'
                    }`} />
                <span className="font-medium">{stage.replace(/_/g, ' ')}</span>
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
                <div className="relative h-48 w-full bg-muted">
                    {startup.coverUrl ? (
                        <img
                            src={startup.coverUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/5" />
                    )}
                    <div className="absolute -bottom-10 left-8">
                        {startup.logoUrl ? (
                            <img
                                src={startup.logoUrl}
                                alt="Logo"
                                className="h-24 w-24 rounded-xl object-cover border-4 border-background shadow-lg bg-white"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-xl bg-background border-4 border-background shadow-lg flex items-center justify-center">
                                <div className="h-full w-full bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Building2 className="h-10 w-10 text-primary" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8 pt-12 pb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {startup.name}
                                {startup.status && getStatusBadge(startup.status)}
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                {startup.tagline}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1 mr-2 border-r pr-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                    onClick={() => window.open(startup.facebookUrl, '_blank')}
                                    disabled={!startup.facebookUrl}
                                    title={startup.facebookUrl ? "Facebook" : "Facebook (Not Provided)"}
                                >
                                    <Facebook className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-pink-600 hover:text-pink-700 hover:bg-pink-100"
                                    onClick={() => window.open(startup.instagramUrl, '_blank')}
                                    disabled={!startup.instagramUrl}
                                    title={startup.instagramUrl ? "Instagram" : "Instagram (Not Provided)"}
                                >
                                    <Instagram className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-sky-500 hover:text-sky-600 hover:bg-sky-100"
                                    onClick={() => window.open(startup.twitterUrl, '_blank')}
                                    disabled={!startup.twitterUrl}
                                    title={startup.twitterUrl ? "X (Twitter)" : "X (Twitter) (Not Provided)"}
                                >
                                    <Twitter className="h-4 w-4" />
                                </Button>
                            </div>
                            {startup.websiteUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(startup.websiteUrl, '_blank')}
                                >
                                    <Globe className="h-4 w-4 mr-2" />
                                    Website
                                </Button>
                            )}
                            {onTransfer && (
                                <Button
                                    size="sm"
                                    onClick={() => onTransfer(startup)}
                                >
                                    <UserCog className="h-4 w-4 mr-2" />
                                    Transfer
                                </Button>
                            )}

                            {/* Member Actions */}
                            {isActiveMember && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleLeaveTeam}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Leave Team
                                </Button>
                            )}
                            {(isMember) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={handleUnsign}
                                    title="Completely remove yourself from this startup"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Unsign
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-muted/50 border relative overflow-hidden group">
                                <p className="text-xs font-medium text-muted-foreground uppercase z-10 relative">Funding Goal</p>
                                <p className="text-xl font-bold mt-1 z-10 relative">{formatCurrency(startup.fundingGoal)}</p>
                                <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Target className="h-8 w-8" />
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-xs font-medium text-emerald-600 uppercase">Raised</p>
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                </div>
                                <p className="text-xl font-bold text-emerald-700">{formatCurrency(startup.raisedAmount)}</p>
                                {/* Progress Bar */}
                                <div className="w-full bg-emerald-200/50 h-1.5 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((startup.raisedAmount || 0) / (startup.fundingGoal || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-emerald-600/80 mt-1 font-medium text-right">
                                    {Math.round(((startup.raisedAmount || 0) / (startup.fundingGoal || 1)) * 100)}% Funded
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50 border">
                                <p className="text-xs font-medium text-muted-foreground uppercase">Stage</p>
                                <div className="mt-1">{getStageBadge(startup.stage)}</div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 rounded-xl border bg-card text-card-foreground shadow-sm flex items-start gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 mt-0.5">
                                    <Layers className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Industry</p>
                                    <p className="font-semibold mt-0.5">{startup.industry}</p>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl border bg-card text-card-foreground shadow-sm flex items-start gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 mt-0.5">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground">Owner</p>
                                    <p className="font-semibold mt-0.5 truncate text-sm" title={startup.ownerEmail}>
                                        {startup.ownerEmail}
                                    </p>
                                    {startup.ownerRole && (
                                        <div className="mt-1.5">
                                            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                                                {startup.ownerRole.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-3 rounded-xl border bg-card text-card-foreground shadow-sm flex items-start gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600 mt-0.5">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Created</p>
                                    <p className="font-semibold mt-0.5">{formatDate(startup.createdAt)}</p>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl border bg-card text-card-foreground shadow-sm flex items-start gap-3">
                                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-600 mt-0.5">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                                    <p className="font-semibold mt-0.5">{startup.updatedAt ? formatDate(startup.updatedAt) : 'Same as created'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Team Members */}
                        {startup.members && startup.members.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Team Members
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {startup.members.map((member) => (
                                        <div key={member.id} className="group relative flex items-start gap-3 p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                                            {/* Avatar */}
                                            {member.userAvatarUrl ? (
                                                <img src={member.userAvatarUrl} alt={member.userName} className="h-12 w-12 rounded-full object-cover border" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                    <span className="font-bold text-primary text-sm">
                                                        {member.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-sm truncate">{member.userName}</p>
                                                    {member.userId === startup.ownerId && (
                                                        <span title="Owner">
                                                            <BadgeCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10" />
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-medium text-primary mt-0.5">{member.role.replace(/_/g, " ")}</p>

                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${member.isActive ? 'bg-green-500/10 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {member.isActive ? 'Active' : 'Past Member'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Joined {formatDate(member.joinedAt)}
                                                    </span>
                                                    {!member.isActive && member.leftAt && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            • Left {formatDate(member.leftAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions Menu (Admin/Owner only) */}
                                            {isAdminOrOwner && member.userId !== user?.id && (
                                                <div className="">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground hover:text-foreground">
                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {member.isActive && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleRemoveMember(member.userId, member.userName)}
                                                                    className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                                                                >
                                                                    <LogOut className="mr-2 h-3.5 w-3.5" />
                                                                    Mark as Left
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleUnsignMember(member.userId, member.userName)}
                                                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            >
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                                Remove from Team
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                About Request
                            </h4>
                            <div className="p-4 rounded-lg bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap">
                                {startup.fullDescription}
                            </div>
                        </div>

                        {/* Documents Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Button
                                variant="secondary"
                                className="w-full justify-start"
                                onClick={() => window.open(startup.pitchDeckUrl, '_blank')}
                                disabled={!startup.pitchDeckUrl}
                            >
                                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                View Pitch Deck
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full justify-start"
                                onClick={() => window.open(startup.financialDocumentsUrl, '_blank')}
                                disabled={!startup.financialDocumentsUrl}
                            >
                                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-500" />
                                Financial Documents
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full justify-start"
                                onClick={() => window.open(startup.businessPlanUrl, '_blank')}
                                disabled={!startup.businessPlanUrl}
                            >
                                <FileText className="h-4 w-4 mr-2 text-amber-500" />
                                Business Plan
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full justify-start"
                                onClick={() => window.open(startup.businessModelUrl, '_blank')}
                                disabled={!startup.businessModelUrl}
                            >
                                <FilePieChart className="h-4 w-4 mr-2 text-purple-500" />
                                Business Model
                            </Button>
                        </div>
                    </div>
                </div>

                <AlertDialog open={confirmDialog.open} onOpenChange={(open: boolean) => setConfirmDialog(prev => ({ ...prev, open }))}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {confirmDialog.description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async (e: MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault()
                                    await confirmDialog.action()
                                    setConfirmDialog(prev => ({ ...prev, open: false }))
                                }}
                                className={confirmDialog.variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                            >
                                Confirm
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
        </Dialog >
    )
}
