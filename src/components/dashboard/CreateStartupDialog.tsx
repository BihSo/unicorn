import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"


import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import { createStartup, searchUsers, searchStartups, addStartupMember } from "../../lib/api"
import { StartupRole, StartupStage, User, Startup } from "../../types"
import { User as UserIcon, Loader2, Upload, Building2, TrendingUp, DollarSign, Globe, FileText, Image, Briefcase, Link, Facebook, Instagram, Twitter, ShieldCheck, Users, PlusCircle, Search } from "lucide-react"


const INDUSTRY_OPTIONS = [
    "Fintech",
    "Health Tech",
    "Ed Tech",
    "E-commerce",
    "SaaS",
    "AI & ML",
    "Blockchain",
    "Clean Tech",
    "Agri Tech",
    "Real Estate",
    "Entertainment",
    "Logistics",
    "Manufacturing",
    "Bio Tech",
    "Cybersecurity",
    "Other"
];

const startupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    tagline: z.string().optional(),
    fullDescription: z.string().optional(),
    industry: z.string().min(2, "Industry is required"),
    stage: z.string().min(1, "Stage is required"),
    fundingGoal: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Funding goal must be a positive number",
    }),
    websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    coverUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    facebookUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    instagramUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    twitterUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    pitchDeckUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    financialDocumentsUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    businessPlanUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    businessModelUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    ownerId: z.string().optional(),
    ownerRole: z.string().min(1, "Owner Role is required"),
})

type StartupFormValues = z.infer<typeof startupSchema>

interface CreateStartupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function CreateStartupDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateStartupDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<StartupFormValues>({
        resolver: zodResolver(startupSchema),
        defaultValues: {
            name: "",
            tagline: "",
            fullDescription: "",
            industry: "",
            stage: "SEED",
            fundingGoal: "",
            websiteUrl: "",
            logoUrl: "",
            coverUrl: "",
            facebookUrl: "",
            instagramUrl: "",
            twitterUrl: "",
            pitchDeckUrl: "",
            financialDocumentsUrl: "",
            businessPlanUrl: "",
            businessModelUrl: "",
            ownerId: "",
            ownerRole: "FOUNDER",
        },
    })

    // Mode Toggle
    const [mode, setMode] = useState<'CREATE' | 'ADD_MEMBER'>('CREATE')

    // Member Form State
    const [memberStartup, setMemberStartup] = useState<Startup | null>(null)
    const [memberUser, setMemberUser] = useState<User | null>(null)
    const [memberRole, setMemberRole] = useState<StartupRole>('OTHER')
    const [memberJoinedAt, setMemberJoinedAt] = useState<string>(new Date().toISOString().split('T')[0])
    const [memberIsActive, setMemberIsActive] = useState(true)
    const [memberLeftAt, setMemberLeftAt] = useState<string>('')

    // Member Search State
    const [startupSearchQuery, setStartupSearchQuery] = useState("")
    const [startupSearchResults, setStartupSearchResults] = useState<Startup[]>([])
    const [isSearchingStartups, setIsSearchingStartups] = useState(false)

    const handleSearchStartups = async (query: string) => {
        setStartupSearchQuery(query)
        if (query.length < 2) {
            setStartupSearchResults([])
            return
        }
        try {
            setIsSearchingStartups(true)
            const data = await searchStartups(query)
            setStartupSearchResults(data.content || [])
        } catch (error) {
            console.error(error)
        } finally {
            setIsSearchingStartups(false)
        }
    }

    const selectStartup = (startup: Startup) => {
        setMemberStartup(startup)
        setStartupSearchQuery("")
        setStartupSearchResults([])
    }

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!memberStartup || !memberUser) {
            toast.error("Please select both a startup and a user")
            return
        }
        try {
            setIsLoading(true)
            // If the selected date is today, use the current time
            // Otherwise default to start of day (or end of day for leftAt?)
            // Actually, backend now expects LocalDateTime.
            // Let's assume if user picks today, they mean "now".
            // If they pick a past date, we can default to noon or something, or just use the date string + T00:00:00.
            // But to fix the "static 2:00 AM" issue, specifically for "today", we should send current time.

            const today = new Date().toISOString().split('T')[0]

            let joinedAtISO = memberJoinedAt
            if (memberJoinedAt === today) {
                joinedAtISO = new Date().toISOString()
            } else {
                joinedAtISO = new Date(memberJoinedAt).toISOString()
            }

            let leftAtISO: string | null = null
            if (!memberIsActive && memberLeftAt) {
                if (memberLeftAt === today) {
                    leftAtISO = new Date().toISOString()
                } else {
                    leftAtISO = new Date(memberLeftAt).toISOString()
                }
            }

            await addStartupMember(
                memberStartup.id,
                memberUser.id,
                memberRole,
                joinedAtISO,
                leftAtISO
            )
            toast.success("Member added successfully")
            onSuccess()
            onOpenChange(false)
            // Reset
            setMemberStartup(null)
            setMemberUser(null)
            setMemberRole('OTHER')
            setMemberIsActive(true)
            setMemberLeftAt('')
        } catch (error) {
            toast.error("Failed to add member")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    // User Search State
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedOwner, setSelectedOwner] = useState<User | null>(null)

    const handleSearchUsers = async (query: string) => {
        setSearchQuery(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        try {
            setIsSearching(true)
            const data = await searchUsers(query, 'STARTUP_OWNER')
            setSearchResults(data.content)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSearching(false)
        }
    }

    const selectOwner = (user: User) => {
        setSelectedOwner(user)
        form.setValue("ownerId", user.id)
        setSearchResults([])
        setSearchQuery("")
    }

    const clearOwner = () => {
        setSelectedOwner(null)
        form.setValue("ownerId", undefined)
    }

    const onSubmit = async (data: StartupFormValues) => {
        try {
            setIsLoading(true)
            await createStartup({
                ...data,
                fundingGoal: Number(data.fundingGoal),
                raisedAmount: 0,
                stage: data.stage as StartupStage,
                ownerRole: data.ownerRole as StartupRole,
                status: 'APPROVED', // Admins create approved startups directly
            })
            toast.success("Startup created successfully")
            onSuccess()
            onOpenChange(false)
            form.reset()
        } catch (error) {
            toast.error("Failed to create startup")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === 'CREATE' ? 'Create New Startup' : 'Add Team Member'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'CREATE'
                            ? 'Add a new startup to the platform. You will be the initial owner.'
                            : 'Add an existing user to a startup team with a specific role.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Mode Toggle */}
                <div className="grid grid-cols-2 bg-muted p-1 rounded-lg mb-6 mt-2">
                    <button
                        onClick={() => setMode('CREATE')}
                        className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'CREATE' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
                    >
                        <PlusCircle className="h-4 w-4" />
                        Create New Startup
                    </button>
                    <button
                        onClick={() => setMode('ADD_MEMBER')}
                        className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'ADD_MEMBER' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
                    >
                        <Users className="h-4 w-4" />
                        Add Team Member
                    </button>
                </div>

                {mode === 'CREATE' ? (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    Startup Name *
                                </Label>
                                <Input id="name" {...form.register("name")} placeholder="Acme Inc." />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="industry" className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    Industry *
                                </Label>
                                <Select
                                    onValueChange={(value) => form.setValue("industry", value)}
                                    defaultValue={form.getValues("industry")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDUSTRY_OPTIONS.map((industry) => (
                                            <SelectItem key={industry} value={industry}>
                                                {industry}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.industry && (
                                    <p className="text-sm text-destructive">{form.formState.errors.industry.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tagline" className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                Tagline
                            </Label>
                            <Input id="tagline" {...form.register("tagline")} placeholder="Innovating the future..." />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Full Description
                            </Label>
                            <Textarea id="description" {...form.register("fullDescription")} className="min-h-[100px]" placeholder="Tell us about your unicorn..." />
                        </div>

                        {/* Owner & Role */}
                        <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/20">
                            <div className="space-y-2 relative">
                                <Label className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    Startup Owner (Optional)
                                </Label>
                                {selectedOwner ? (
                                    <div className="flex items-center justify-between p-2 border rounded-md bg-background">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserIcon className="h-3 w-3 text-primary" />
                                            </div>
                                            <span className="text-sm truncate">{selectedOwner.email}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={clearOwner} className="h-6 w-6 p-0">
                                            &times;
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <Input
                                            placeholder="Search user by email..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearchUsers(e.target.value)}
                                        />
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[200px] overflow-auto">
                                                {searchResults.map(user => (
                                                    <div
                                                        key={user.id}
                                                        className="p-2 hover:bg-accent cursor-pointer text-sm flex items-center justify-between"
                                                        onClick={() => selectOwner(user)}
                                                    >
                                                        <span>{user.email}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {isSearching && (
                                            <div className="absolute right-2 top-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                        <p className="text-[10px] text-muted-foreground mt-1">Leave empty to assign to yourself</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role" className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                    Owner Role *
                                </Label>
                                <Select
                                    onValueChange={(value) => form.setValue("ownerRole", value)}
                                    defaultValue={form.getValues("ownerRole")}
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
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.ownerRole && (
                                    <p className="text-sm text-destructive">{form.formState.errors.ownerRole.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stage" className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    Stage *
                                </Label>
                                <Select
                                    onValueChange={(value) => form.setValue("stage", value)}
                                    defaultValue={form.getValues("stage")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IDEA">Idea</SelectItem>
                                        <SelectItem value="MVP">MVP</SelectItem>
                                        <SelectItem value="SEED">Seed</SelectItem>
                                        <SelectItem value="SERIES_A">Series A</SelectItem>
                                        <SelectItem value="SERIES_B">Series B</SelectItem>
                                        <SelectItem value="GROWTH">Growth</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fundingGoal" className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    Funding Goal ($) *
                                </Label>
                                <Input id="fundingGoal" type="number" {...form.register("fundingGoal")} placeholder="1000000" />
                                {form.formState.errors.fundingGoal && (
                                    <p className="text-sm text-destructive">{form.formState.errors.fundingGoal.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Media & Links */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Image className="h-4 w-4" /> Media & Links
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="website" className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" /> Website URL
                                    </Label>
                                    <Input id="website" {...form.register("websiteUrl")} placeholder="https://Example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="logo">Logo URL</Label>
                                    <div className="flex gap-2">
                                        <Input id="logo" {...form.register("logoUrl")} placeholder="https://..." />
                                        <Button type="button" variant="outline" size="icon" title="Upload Logo (Coming Soon)">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="cover">Cover Image URL</Label>
                                    <div className="flex gap-2">
                                        <Input id="cover" {...form.register("coverUrl")} placeholder="https://..." />
                                        <Button type="button" variant="outline" size="icon" title="Upload Cover (Coming Soon)">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Link className="h-4 w-4" /> Social Media
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="facebook" className="flex items-center gap-2">
                                        <Facebook className="h-4 w-4 text-muted-foreground" /> Facebook
                                    </Label>
                                    <Input id="facebook" {...form.register("facebookUrl")} placeholder="https://facebook.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instagram" className="flex items-center gap-2">
                                        <Instagram className="h-4 w-4 text-muted-foreground" /> Instagram
                                    </Label>
                                    <Input id="instagram" {...form.register("instagramUrl")} placeholder="https://instagram.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="twitter" className="flex items-center gap-2">
                                        <Twitter className="h-4 w-4 text-muted-foreground" /> X (Twitter)
                                    </Label>
                                    <Input id="twitter" {...form.register("twitterUrl")} placeholder="https://x.com/..." />
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Documents
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pitchDeck">Pitch Deck URL</Label>
                                    <div className="flex gap-2">
                                        <Input id="pitchDeck" {...form.register("pitchDeckUrl")} placeholder="https://..." />
                                        <Button type="button" variant="outline" size="icon" title="Upload Pitch Deck (Coming Soon)">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="financials">Financial Documents URL</Label>
                                    <div className="flex gap-2">
                                        <Input id="financials" {...form.register("financialDocumentsUrl")} placeholder="https://..." />
                                        <Button type="button" variant="outline" size="icon" title="Upload Financials (Coming Soon)">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessPlan">Business Plan URL</Label>
                                    <div className="flex gap-2">
                                        <Input id="businessPlan" {...form.register("businessPlanUrl")} placeholder="https://..." />
                                        <Button type="button" variant="outline" size="icon" title="Upload Business Plan (Coming Soon)">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessModel">Business Model URL</Label>
                                    <div className="flex gap-2">
                                        <Input id="businessModel" {...form.register("businessModelUrl")} placeholder="https://..." />
                                        <Button type="button" variant="outline" size="icon" title="Upload Business Model (Coming Soon)">
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Startup
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="space-y-6 py-4">
                        {/* Add Member Form */}
                        <div className="grid gap-6">
                            {/* Startup Selection */}
                            <div className="space-y-2 relative">
                                <Label className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    Select Startup
                                </Label>
                                {memberStartup ? (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                {memberStartup.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{memberStartup.name}</p>
                                                <p className="text-xs text-muted-foreground">{memberStartup.industry}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setMemberStartup(null)}>Change</Button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search startup..."
                                            className="pl-9"
                                            value={startupSearchQuery}
                                            onChange={(e) => handleSearchStartups(e.target.value)}
                                        />
                                        {isSearchingStartups && (
                                            <div className="absolute right-2 top-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                        {startupSearchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[200px] overflow-auto">
                                                {startupSearchResults.map(s => (
                                                    <div
                                                        key={s.id}
                                                        className="p-3 hover:bg-accent cursor-pointer flex items-center justify-between"
                                                        onClick={() => selectStartup(s)}
                                                    >
                                                        <span className="font-medium text-sm">{s.name}</span>
                                                        <span className="text-xs text-muted-foreground">{s.industry}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* User Selection */}
                            <div className="space-y-2 relative">
                                <Label className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                    Select User
                                </Label>
                                {memberUser ? (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserIcon className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{memberUser.email}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setMemberUser(null)}>Change</Button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search user email..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => handleSearchUsers(e.target.value)}
                                        />
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[200px] overflow-auto">
                                                {searchResults.map(u => (
                                                    <div
                                                        key={u.id}
                                                        className="p-3 hover:bg-accent cursor-pointer text-sm"
                                                        onClick={() => {
                                                            setMemberUser(u)
                                                            setSearchQuery("")
                                                            setSearchResults([])
                                                        }}
                                                    >
                                                        {u.email}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select
                                        value={memberRole}
                                        onValueChange={(val) => setMemberRole(val as StartupRole)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
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
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Joined At</Label>
                                    <Input
                                        type="date"
                                        value={memberJoinedAt}
                                        onChange={(e) => setMemberJoinedAt(e.target.value)}
                                        className="block dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={memberIsActive}
                                        onChange={(e) => {
                                            setMemberIsActive(e.target.checked)
                                            if (e.target.checked) setMemberLeftAt('')
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="isActive">Currently Active Member</Label>
                                </div>

                                {!memberIsActive && (
                                    <div className="space-y-2">
                                        <Label>Left At</Label>
                                        <Input
                                            type="date"
                                            value={memberLeftAt}
                                            onChange={(e) => setMemberLeftAt(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="block dark:[color-scheme:dark]"
                                        />
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddMember} disabled={isLoading || !memberStartup || !memberUser}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Member
                                </Button>
                            </DialogFooter>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
