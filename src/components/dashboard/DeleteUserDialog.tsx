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
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Loader2, AlertTriangle, Skull, Trash2 } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import api from '../../lib/axios'
import { toast } from 'sonner'

interface DeleteUserDialogProps {
    userId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeleteUserDialog({ userId, open, onOpenChange, onSuccess }: DeleteUserDialogProps) {
    const [deleteType, setDeleteType] = useState<'SOFT' | 'HARD'>('SOFT')
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [confirmText, setConfirmText] = useState('')

    async function handleSubmit() {
        if (!userId) return

        if (deleteType === 'HARD' && confirmText !== 'DELETE') {
            toast.error('Please type DELETE to confirm')
            return
        }

        if (deleteType === 'SOFT' && !reason.trim()) {
            toast.error('Please provide a reason for soft deletion')
            return
        }

        setSubmitting(true)
        try {
            const isHardDelete = deleteType === 'HARD'
            await api.delete(`/admin/users/${userId}?hardDelete=${isHardDelete}`, {
                data: deleteType === 'SOFT' ? { reason: reason.trim() } : undefined
            })

            toast.success(deleteType === 'HARD' ? 'User permanently deleted' : 'User soft deleted successfully')
            onOpenChange(false)
            onSuccess?.()

            // Reset form
            setReason('')
            setConfirmText('')
            setDeleteType('SOFT')
        } catch (error) {
            console.error('Failed to delete user:', error)
            toast.error('Failed to delete user')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 ${deleteType === 'HARD' ? 'text-red-500' : 'text-orange-500'}`}>
                        {deleteType === 'HARD' ? <Skull className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
                        {deleteType === 'HARD' ? 'Permanently Delete User' : 'Delete User'}
                    </DialogTitle>
                    <DialogDescription>
                        Select the type of deletion you want to perform.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Delete Type Selection */}
                    <RadioGroup
                        value={deleteType}
                        onValueChange={(v) => setDeleteType(v as 'SOFT' | 'HARD')}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div>
                            <RadioGroupItem value="SOFT" id="soft-delete" className="peer sr-only" />
                            <Label
                                htmlFor="soft-delete"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                            >
                                <Trash2 className="mb-3 h-6 w-6 text-orange-500" />
                                <div className="text-sm font-semibold text-center">Soft Delete</div>
                                <div className="text-xs text-center text-muted-foreground mt-1">Mark as deleted, keep data</div>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="HARD" id="hard-delete" className="peer sr-only" />
                            <Label
                                htmlFor="hard-delete"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 [&:has([data-state=checked])]:border-red-500"
                            >
                                <Skull className="mb-3 h-6 w-6 text-red-500" />
                                <div className="text-sm font-semibold text-center">Hard Delete</div>
                                <div className="text-xs text-center text-muted-foreground mt-1">Permanent removal</div>
                            </Label>
                        </div>
                    </RadioGroup>

                    {/* Dynamic Content based on Type */}
                    {deleteType === 'SOFT' ? (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="delete-reason" className="text-orange-500 font-medium">Reason for Deletion (Required)</Label>
                            <Textarea
                                id="delete-reason"
                                placeholder="e.g. User requested deletion, Policy violation..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className="focus-visible:ring-orange-500"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
                                <p className="font-bold flex items-center gap-2 mb-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Warning: Irreversible Action
                                </p>
                                <p>This will completely remove the user and all related data from the database. This cannot be undone.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-delete">
                                    Type <span className="font-bold text-red-600">DELETE</span> to confirm
                                </Label>
                                <input
                                    id="confirm-delete"
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                    placeholder="DELETE"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant={deleteType === 'HARD' ? "destructive" : "default"}
                        onClick={handleSubmit}
                        disabled={submitting || (deleteType === 'HARD' && confirmText !== 'DELETE') || (deleteType === 'SOFT' && !reason.trim())}
                        className={deleteType === 'SOFT' ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : deleteType === 'HARD' ? (
                            <Skull className="h-4 w-4 mr-2" />
                        ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        {deleteType === 'HARD' ? 'Permanently Delete' : 'Soft Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
