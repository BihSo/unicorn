import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import { searchUsers, addStartupMember } from "../../lib/api"
import { User } from "../../types"
import { User as UserIcon, Loader2, Calendar, ShieldCheck } from "lucide-react"

const addMemberSchema = z.object({
    role: z.string().min(1, "Role is required"),
    joinedAt: z.string().min(1, "Joined Date is required"),
})

type AddMemberFormValues = z.infer<typeof addMemberSchema>

interface AddMemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    startupId: string
    existingMemberIds: string[]
    onSuccess: () => void
}

export function AddMemberDialog({
    open,
    onOpenChange,
    startupId,
    existingMemberIds,
    onSuccess,
}: AddMemberDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    const form = useForm<AddMemberFormValues>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: {
            role: "DEVELOPER",
            joinedAt: new Date().toISOString().split('T')[0],
        },
    })

    // Search users with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                performSearch(searchQuery)
            } else {
                setSearchResults([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const performSearch = async (query: string) => {
        setIsSearching(true)
        try {
            // Filter by STARTUP_OWNER role as requested (User referred to "Business Owner")
            const response = await searchUsers(query, "STARTUP_OWNER")
            // Filter out existing members
            const filteredUsers = response.content.filter(user => !existingMemberIds.includes(user.id))
            setSearchResults(filteredUsers)
        } catch (error) {
            console.error("Failed to search users", error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleSelectUser = (user: User) => {
        setSelectedUser(user)
        setSearchQuery("")
        setSearchResults([])
    }

    const clearSelectedUser = () => {
        setSelectedUser(null)
    }

    const onSubmit = async (values: AddMemberFormValues) => {
        if (!selectedUser) {
            toast.error("Please select a user")
            return
        }

        setIsLoading(true)
        try {
            // Logic to handle "today" as "now"
            const today = new Date().toISOString().split('T')[0]
            let joinedAtISO = values.joinedAt

            if (values.joinedAt === today) {
                joinedAtISO = new Date().toISOString()
            } else {
                // If picking a past date, simplistic approach: use T00:00:00 or similar
                // But generally new Date(dateString) defaults to UTC midnight or local depending on parsing
                // To be safe and consistent with previous logic:
                joinedAtISO = new Date(values.joinedAt).toISOString()
            }

            await addStartupMember(
                startupId,
                selectedUser.id,
                values.role,
                joinedAtISO,
                null // leftAt is null for new active members
            )

            toast.success("Member added successfully")
            onSuccess()
            onOpenChange(false)

            // Reset form/state
            form.reset()
            setSelectedUser(null)
            setSearchQuery("")

        } catch (error) {
            console.error("Failed to add member", error)
            toast.error("Failed to add member")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Search for a user and assign them a role in the startup.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* User Selection */}
                    <div className="space-y-2 relative">
                        <Label className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            Select User *
                        </Label>

                        {selectedUser ? (
                            <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {selectedUser.avatarUrl ? (
                                        <img src={selectedUser.avatarUrl} alt={selectedUser.email} className="h-8 w-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-xs font-bold text-primary">
                                                {(selectedUser.firstName && selectedUser.lastName)
                                                    ? `${selectedUser.firstName[0]}${selectedUser.lastName[0]}`
                                                    : selectedUser.email.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {selectedUser.firstName ? `${selectedUser.firstName} ${selectedUser.lastName}` : selectedUser.email.split('@')[0]}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={clearSelectedUser} className="h-8 w-8 p-0">
                                    &times;
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[200px] overflow-auto">
                                        {searchResults.map(user => (
                                            <div
                                                key={user.id}
                                                className="p-3 hover:bg-accent cursor-pointer text-sm flex items-center gap-3 border-b last:border-0"
                                                onClick={() => handleSelectUser(user)}
                                            >
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">
                                                        {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {isSearching && (
                                    <div className="absolute right-3 top-9">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role" className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                Role *
                            </Label>
                            <Select
                                onValueChange={(value) => form.setValue("role", value)}
                                defaultValue={form.getValues("role")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FOUNDER">Founder</SelectItem>
                                    <SelectItem value="CO_FOUNDER">Co-Founder</SelectItem>
                                    <SelectItem value="CEO">CEO</SelectItem>
                                    <SelectItem value="CTO">CTO</SelectItem>
                                    <SelectItem value="COO">COO</SelectItem>
                                    <SelectItem value="CFO">CFO</SelectItem>
                                    <SelectItem value="CMO">CMO</SelectItem>
                                    <SelectItem value="CHIEF_PRODUCT_OFFICER">CPO</SelectItem>
                                    <SelectItem value="DEVELOPER">Developer</SelectItem>
                                    <SelectItem value="DESIGNER">Designer</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.role && (
                                <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="joinedAt" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Joined Date *
                            </Label>
                            <Input
                                id="joinedAt"
                                type="date"
                                {...form.register("joinedAt")}
                            />
                            {form.formState.errors.joinedAt && (
                                <p className="text-sm text-destructive">{form.formState.errors.joinedAt.message}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !selectedUser}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Member
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
