import { useState, useEffect } from 'react';
import { AppConfigItem, fetchConfigsGrouped, batchUpdateConfigs } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function Settings() {
    const [groupedConfigs, setGroupedConfigs] = useState<Record<string, AppConfigItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('all');


    // Edited values state
    const [edits, setEdits] = useState<Record<string, string>>({});

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const data = await fetchConfigsGrouped();
            setGroupedConfigs(data);

            // Set default active tab to first category if 'all' is not desired
            const categories = Object.keys(data);
            if (categories.length > 0 && activeTab === 'all') {
                setActiveTab(categories[0]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error", {
                description: "Failed to load settings.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setEdits(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await batchUpdateConfigs(edits);
            toast.success("Success", {
                description: "Settings updated successfully.",
            });
            setEdits({}); // Clear edits on success
            loadConfigs(); // Reload to get fresh data
        } catch (error) {
            console.error(error);
            toast.error("Error", {
                description: "Failed to save settings.",
            });
        } finally {
            setSaving(false);
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage application configuration and defaults.
                </p>
            </div>

            <div className="flex space-x-2 border-b pb-2">
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={activeTab === cat ? "default" : "ghost"}
                        onClick={() => setActiveTab(cat)}
                        className="capitalize"
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            <div className="grid gap-6">
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
            </div>

            {Object.keys(edits).length > 0 && (
                <div className="fixed bottom-6 right-6">
                    <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
}
