import { useState, useEffect } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import api from '@/lib/axios'

interface UserStatusDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userId: string | null
    currentStatus?: string
    onSuccess: () => void
}

export function UserStatusDialog({
    open,
    onOpenChange,
    userId,
    currentStatus = 'ACTIVE',
    onSuccess,
}: UserStatusDialogProps) {
    const [status, setStatus] = useState<string>(currentStatus)
    const [reason, setReason] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Sync state with prop when dialog opens
    useEffect(() => {
        if (open) {
            setStatus(currentStatus)
            setReason('')
        }
    }, [open, currentStatus])

    const handleConfirm = async () => {
        if (!userId) return

        try {
            setIsLoading(true)
            await api.put(`/admin/users/${userId}/status`, {
                status,
                reason: reason || 'Manual status change by admin',
            })
            toast.success('User status updated successfully')
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Failed to update status:', error)
            toast.error('Failed to update status')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Change User Status</AlertDialogTitle>
                    <AlertDialogDescription>
                        Manually update the status for this user. This will override existing states.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>New Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                <SelectItem value="PENDING_VERIFICATION">PENDING_VERIFICATION</SelectItem>
                                <SelectItem value="BANNED">BANNED</SelectItem>
                                <SelectItem value="DELETED">DELETED</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Reason (Optional)</Label>
                        <Input
                            placeholder="Why are you changing this?"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isLoading ? 'Updating...' : 'Update Status'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
