import { useState } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import { Loader2 } from 'lucide-react'
import { reportUser, reportStartup } from '../../lib/api'

const REPORT_REASONS = [
    { value: 'SPAM', label: 'Spam or promotional content' },
    { value: 'HARASSMENT', label: 'Harassment or abusive behavior' },
    { value: 'INAPPROPRIATE_CONTENT', label: 'Offensive or inappropriate content' },
    { value: 'FRAUD', label: 'Fraudulent or misleading information' },
    { value: 'DUPLICATE', label: 'Duplicate account or content' },
    { value: 'COPYRIGHT', label: 'Copyright infringement' },
    { value: 'IMPERSONATION', label: 'Impersonation or identity theft' },
    { value: 'ADULT_CONTENT', label: 'Adult or sexual content' },
    { value: 'VIOLENCE', label: 'Violence or threats' },
    { value: 'HATE_SPEECH', label: 'Hate speech or discrimination' },
    { value: 'MISINFORMATION', label: 'Misinformation or false claims' },
    { value: 'OTHER', label: 'Other reason' },
]

interface ReportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    entityType: 'USER' | 'STARTUP'
    entityId: string
    entityName: string
}

export function ReportDialog({ open, onOpenChange, entityType, entityId, entityName }: ReportDialogProps) {
    const [reason, setReason] = useState('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!reason) {
            toast.error('Please select a reason for reporting')
            return
        }

        if (!description || description.length < 20) {
            toast.error('Please provide a detailed description (at least 20 characters)')
            return
        }

        setIsSubmitting(true)
        try {
            const data = { reason, description }

            if (entityType === 'USER') {
                await reportUser(entityId, data)
            } else {
                await reportStartup(entityId, data)
            }

            toast.success('Report submitted successfully. Our team will review it shortly.')
            onOpenChange(false)

            // Reset form
            setReason('')
            setDescription('')
        } catch (error: any) {
            console.error('Failed to submit report:', error)

            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error('Failed to submit report. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Report {entityType === 'USER' ? 'User' : 'Startup'}</DialogTitle>
                    <DialogDescription>
                        Report violations or inappropriate content from{' '}
                        <span className="font-semibold text-foreground">{entityName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for reporting *</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger id="reason">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_REASONS.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Please provide detailed information about this violation..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            {description.length}/2000 characters (minimum 20 required)
                        </p>
                    </div>

                    <div className="rounded-lg bg-muted p-3 text-sm">
                        <p className="font-medium mb-1">⚠️ Important:</p>
                        <ul className="text-muted-foreground space-y-1 text-xs">
                            <li>• False reports may result in warnings or restrictions</li>
                            <li>• All reports are reviewed by our team</li>
                            <li>• You may be notified of the outcome</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !reason || description.length < 20}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
