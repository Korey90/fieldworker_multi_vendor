import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Tenant } from '@/types';
import { ArrowLeftIcon } from 'lucide-react';

interface CertificationCreateProps {
    tenants: Tenant[];
    authorities: string[];
}

export default function CertificationCreate({ tenants, authorities }: CertificationCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        authority: '',
        validity_period_months: 12,
        tenant_id: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.certifications.store'));
    };

    const formatValidityPreview = (months: number) => {
        if (months < 12) {
            return `${months} month${months !== 1 ? 's' : ''}`;
        }
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) {
            return `${years} year${years !== 1 ? 's' : ''}`;
        }
        return `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    };

    return (
        <AppLayout>
            <Head title="Admin - Create Certification" />
            
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href={route('admin.certifications.index')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back to Certifications
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold">Create New Certification</h1>
                    <p className="text-gray-600">Add a new certification to the system</p>
                </div>

                {/* Form */}
                <div className="max-w-2xl">
                    <Card className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <Label htmlFor="name">Certification Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                    placeholder="e.g., First Aid, OSHA Safety, ISO 9001"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                    className={errors.description ? 'border-red-500' : ''}
                                    placeholder="Describe the certification requirements and purpose..."
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            {/* Authority */}
                            <div>
                                <Label htmlFor="authority">Issuing Authority *</Label>
                                <div className="flex gap-2">
                                    <select
                                        id="authority"
                                        value={data.authority}
                                        onChange={(e) => setData('authority', e.target.value)}
                                        className={`flex-1 border rounded px-3 py-2 ${errors.authority ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Select or type new authority</option>
                                        {authorities.map((authority) => (
                                            <option key={authority} value={authority}>
                                                {authority}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    type="text"
                                    value={data.authority}
                                    onChange={(e) => setData('authority', e.target.value)}
                                    className={`mt-2 ${errors.authority ? 'border-red-500' : ''}`}
                                    placeholder="Or type a new authority"
                                />
                                {errors.authority && (
                                    <p className="text-red-500 text-sm mt-1">{errors.authority}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Examples: OSHA, Red Cross, ISO, Local Government
                                </p>
                            </div>

                            {/* Validity Period */}
                            <div>
                                <Label htmlFor="validity_period_months">Validity Period *</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="validity_period_months"
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={data.validity_period_months}
                                        onChange={(e) => setData('validity_period_months', parseInt(e.target.value) || 12)}
                                        className={`w-24 ${errors.validity_period_months ? 'border-red-500' : ''}`}
                                    />
                                    <span className="text-sm text-gray-600">
                                        months ({formatValidityPreview(data.validity_period_months)})
                                    </span>
                                </div>
                                {errors.validity_period_months && (
                                    <p className="text-red-500 text-sm mt-1">{errors.validity_period_months}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    How long is this certification valid before renewal is required?
                                </p>
                            </div>

                            {/* Tenant */}
                            <div>
                                <Label htmlFor="tenant_id">Tenant *</Label>
                                <select
                                    id="tenant_id"
                                    value={data.tenant_id}
                                    onChange={(e) => setData('tenant_id', e.target.value)}
                                    className={`w-full border rounded px-3 py-2 ${errors.tenant_id ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select tenant</option>
                                    {tenants.map((tenant) => (
                                        <option key={tenant.id} value={tenant.id.toString()}>
                                            {tenant.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.tenant_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.tenant_id}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Which tenant organization is this certification for?
                                </p>
                            </div>

                            {/* Status */}
                            <div>
                                <Label htmlFor="is_active">Status</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="is_active" className="text-sm">
                                        Active (certification can be assigned to workers)
                                    </label>
                                </div>
                                {errors.is_active && (
                                    <p className="text-red-500 text-sm mt-1">{errors.is_active}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t">
                                <Link href={route('admin.certifications.index')}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Certification'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Guidelines */}
                <Card className="p-6 mt-6 max-w-2xl">
                    <h3 className="font-semibold mb-3">📋 Certification Creation Guidelines</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div>• <strong>Name:</strong> Use official certification names that workers will recognize</div>
                        <div>• <strong>Authority:</strong> Specify the organization that issues this certification</div>
                        <div>• <strong>Validity Period:</strong> Set appropriate renewal periods (common: 12, 24, 36 months)</div>
                        <div>• <strong>Description:</strong> Include requirements, training needed, or certification levels</div>
                        <div>• <strong>Tenant:</strong> Assign to the appropriate organization/tenant</div>
                        <div>• <strong>Status:</strong> Only active certifications can be assigned to workers</div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}