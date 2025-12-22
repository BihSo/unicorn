import { useState, useEffect } from 'react';
import { AppConfigItem, fetchConfigsGrouped, batchUpdateConfigs, updatePreferredCurrency, syncExchangeRates } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CURRENCIES = ['USD', 'SAR', 'AED', 'EGP', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'MAD'];

export function Settings() {
    const { user, updateUser } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const [groupedConfigs, setGroupedConfigs] = useState<Record<string, AppConfigItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('preferences');

    // Edited values state for Admin Configs
    const [edits, setEdits] = useState<Record<string, string>>({});

    // User Preferences State
    const [currency, setCurrency] = useState(user?.preferredCurrency || 'USD');

    useEffect(() => {
        if (isAdmin) {
            loadConfigs();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    // Update local currency state if user object updates
    useEffect(() => {
        if (user?.preferredCurrency) {
            setCurrency(user.preferredCurrency);
        }
    }, [user?.preferredCurrency]);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const data = await fetchConfigsGrouped();
            setGroupedConfigs(data);
        } catch (error) {
            console.error(error);
            toast.error("Error", {
                description: "Failed to load system settings.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setEdits(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveConfigs = async () => {
        try {
            setSaving(true);
            await batchUpdateConfigs(edits);
            toast.success("Success", {
                description: "System settings updated successfully.",
            });
            setEdits({});
            loadConfigs();
        } catch (error) {
            console.error(error);
            toast.error("Error", {
                description: "Failed to save system settings.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        try {
            setSaving(true);
            await updatePreferredCurrency(currency);
            updateUser({ preferredCurrency: currency });
            toast.success("Success", {
                description: "Preferences updated successfully.",
            });
        } catch (error) {
            console.error(error);
            toast.error("Error", {
                description: "Failed to update preferences.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSyncRates = async () => {
        try {
            setSyncing(true);
            const rates = await syncExchangeRates();
            toast.success("Rates Synced", {
                description: `Updated ${Object.keys(rates).length} exchange rates.`,
            });
            // Reload configs to show new values
            loadConfigs();
        } catch (error) {
            console.error(error);
            toast.error("Sync Failed", {
                description: "Could not fetch live rates.",
            });
        } finally {
            setSyncing(false);
        }
    };

    const categories = Object.keys(groupedConfigs);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">


            <div className="flex space-x-2 border-b pb-2 overflow-x-auto">
                <Button
                    variant={activeTab === "preferences" ? "default" : "ghost"}
                    onClick={() => setActiveTab("preferences")}
                >
                    Preferences
                </Button>
                {isAdmin && categories.map(cat => (
                    <Button
                        key={cat}
                        variant={activeTab === cat ? "default" : "ghost"}
                        onClick={() => setActiveTab(cat)}
                        className="capitalize"
                    >
                        {cat.replace("_", " ")}
                    </Button>
                ))}
            </div>

            <div className="grid gap-6">
                {activeTab === "preferences" ? (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-medium">Display Preferences</CardTitle>
                            <CardDescription>Customize how you view the application.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4">
                                <Label htmlFor="currency" className="w-1/4">
                                    Preferred Currency
                                </Label>
                                <div className="flex-1 max-w-sm">
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger id="currency">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map(c => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        All prices are stored in USD but will be displayed in this currency (approximate conversion).
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button onClick={handleSavePreferences} disabled={saving || currency === user?.preferredCurrency}>
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Preferences
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {activeTab === 'exchange_rates' && (
                            <div className="flex justify-end">
                                <Button variant="outline" onClick={handleSyncRates} disabled={syncing}>
                                    <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                                    Sync Live Rates (Open API)
                                </Button>
                            </div>
                        )}
                        {groupedConfigs[activeTab]?.map((config) => (
                            <Card key={config.key}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-medium">{config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</CardTitle>
                                    <CardDescription>{config.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-4">
                                        <Label htmlFor={config.key} className="w-1/4">
                                            Value ({config.valueType})
                                        </Label>
                                        <div className="flex-1">
                                            {config.valueType === 'BOOLEAN' ? (
                                                <Switch
                                                    id={config.key}
                                                    checked={edits[config.key] !== undefined ? edits[config.key] === 'true' : config.value === 'true'}
                                                    onCheckedChange={(checked) => handleInputChange(config.key, String(checked))}
                                                />
                                            ) : (
                                                <Input
                                                    id={config.key}
                                                    type={config.valueType === 'NUMBER' ? 'number' : 'text'}
                                                    value={edits[config.key] !== undefined ? edits[config.key] : config.value}
                                                    onChange={(e) => handleInputChange(config.key, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </>
                )}
            </div>

            {activeTab !== "preferences" && Object.keys(edits).length > 0 && (
                <div className="fixed bottom-6 right-6">
                    <Button onClick={handleSaveConfigs} disabled={saving} size="lg" className="shadow-lg">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
}
