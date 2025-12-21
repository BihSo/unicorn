import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Loader2, RotateCcw, ShieldCheck } from 'lucide-react'
import api from '../../lib/axios'
import { toast } from 'sonner'

interface RestoreUserDialogProps {
    userId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function RestoreUserDialog({ userId, open, onOpenChange, onSuccess }: RestoreUserDialogProps) {
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit() {
        if (!userId) return

        setSubmitting(true)
        try {
            await api.post(`/admin/users/${userId}/restore`)
            toast.success('User restored successfully')
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            console.error('Failed to restore user:', error)
            toast.error(error.message || 'Failed to restore user')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-600">
                        <RotateCcw className="h-5 w-5" />
                        Restore User
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to restore this user?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm">
                        <p className="font-semibold flex items-center gap-2 mb-2">
                            <ShieldCheck className="h-4 w-4" />
                            Effect of this action:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>The user's status will be set back to <strong>ACTIVE</strong>.</li>
                            <li>They will regain access to their account immediately.</li>
                            <li>All previous data and associations will be preserved.</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RotateCcw className="h-4 w-4 mr-2" />
                        )}
                        Confirm Restore
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
