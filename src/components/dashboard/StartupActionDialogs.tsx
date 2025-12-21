import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "../../lib/api"
import { Startup } from "../../types"

interface ActionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    startup: Startup
    onSuccess: () => void
}

const WARN_TEMPLATES = [
    "Violation of terms of service",
    "Suspicious activity detected",
    "Inappropriate content reported",
    "Please update your startup information",
]

export function WarnStartupDialog({ open, onOpenChange, startup, onSuccess }: ActionDialogProps) {
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.error("Please enter a warning message")
            return
        }

        try {
            setLoading(true)
            await api.post(`/admin/startups/${startup.id}/warn`, { message })
            toast.success("Warning sent successfully")
            onSuccess()
            onOpenChange(false)
            setMessage("")
        } catch (error) {
            toast.error("Failed to send warning")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Issue Warning to {startup.name}</DialogTitle>
                    <DialogDescription>
                        Send a formal warning to the startup owner. This will be sent via email.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Quick Templates</Label>
                        <Select onValueChange={setMessage}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent>
                                {WARN_TEMPLATES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your warning message here..."
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Warning
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function StartupStatusDialog({ open, onOpenChange, startup, onSuccess }: ActionDialogProps) {
    const [status, setStatus] = useState<string>(startup.status)
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setStatus(startup.status)
            setReason("")
        }
    }, [open, startup.status])

    const handleSubmit = async () => {
        try {
            setLoading(true)
            await api.put(`/admin/startups/${startup.id}/status`, {
                status,
                reason: reason.trim() || undefined
            })
            toast.success(`Startup status updated to ${status}`)
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to update status")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Status for {startup.name}</DialogTitle>
                    <DialogDescription>
                        Update the operational status of this startup.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                <SelectItem value="BANNED">Banned</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(status === 'SUSPENDED' || status === 'BANNED' || status === 'REJECTED') && (
                        <div className="space-y-2">
                            <Label>Reason (Required for negative actions)</Label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please provide a reason..."
                                required
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || ((status === 'SUSPENDED' || status === 'BANNED' || status === 'REJECTED') && !reason.trim())}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Status
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function DeleteStartupDialog({ open, onOpenChange, startup, onSuccess }: ActionDialogProps) {
    const [loading, setLoading] = useState(false)
    const [confirmName, setConfirmName] = useState("")

    const handleDelete = async () => {
        if (confirmName !== startup.name) return

        try {
            setLoading(true)
            await api.delete(`/admin/startups/${startup.id}`)
            toast.success("Startup deleted permanently")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to delete startup")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Startup Permanently
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete
                        <span className="font-bold text-foreground mx-1">{startup.name}</span>
                        and remove all associated data, including team members and potential investments.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Type the startup name to confirm</Label>
                        <div className="relative">
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={confirmName}
                                onChange={(e) => setConfirmName(e.target.value)}
                                placeholder={startup.name}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading || confirmName !== startup.name}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Permanently
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
