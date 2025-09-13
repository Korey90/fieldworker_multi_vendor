import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    phone?: string;
    is_active: boolean;
    data?: Record<string, any>;
    created_at: string;
    updated_at: string;
    tenant_id?: number;
    skills?: Skill[];
    certifications?: Certification[];
    roles?: Role[];
    permissions?: Permission[];
    worker?: {
        id: string;
        user_id: number;
    };
    [key: string]: unknown; // This allows for additional properties...
}

export interface Role {
    id: number;
    tenant_id?: number;
    name: string;
    description?: string;
    slug: string;
    permissions?: Permission[];
    users?: User[];
    created_at?: string;
    updated_at?: string;
}

export interface Permission {
    id: number;
    name: string;
    key?: string;
    permission_key: string;
    permission_group: string;
    slug: string;
    description?: string;
    is_active: boolean;
    roles?: Role[];
    created_at?: string;
    updated_at?: string;
}

export interface Tenant {
    id: number;
    name: string;
    domain: string;
    status: 'active' | 'suspended' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface Location {
    id: number;
    tenant_id: number;
    sector_id?: number;
    name: string;
    address: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
    location_type: string;
    is_active: boolean;
    latitude?: number | string | null;
    longitude?: number | string | null;
    data?: any;
    created_at: string;
    updated_at: string;
    tenant?: Tenant;
    sector?: Sector;
    workers?: Worker[];
    assets?: Asset[];
    jobs?: Job[];
}

export interface Asset {
    id: string;
    tenant_id: number;
    location_id?: number;
    name: string;
    description?: string;
    asset_type: string;
    serial_number?: string;
    purchase_date?: string;
    purchase_cost?: number;
    current_value?: number;
    status: 'active' | 'inactive' | 'maintenance' | 'retired';
    assigned_to?: string;
    data?: Record<string, any>;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    
    // Relations
    tenant?: Tenant;
    location?: Location;
    current_assignment?: {
        id: string;
        user: User;
    };
    audit_logs?: AuditLog[];
}

export interface Sector {
    id: number;
    code: string;
    name: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    
    // Computed fields
    locations_count?: number;
    tenants_count?: number;
    
    // Relations
    locations?: Location[];
    tenants?: Tenant[];
}

export interface Worker {
    id: string;
    user_id: number;
    tenant_id: number;
    created_at: string;
    updated_at: string;
    
    // Relations
    user: User;
}

export interface AuditLog {
    id: number;
    entity_type: string;
    entity_id: string;
    action: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    user_id?: number;
    created_at: string;
    
    // Relations
    user?: User;
}

export interface Job {
    id: string;
    tenant_id: number;
    title: string;
    description: string;
    location_id: number;
    assigned_user_id?: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    scheduled_at?: string;
    completed_at?: string;
    data?: Record<string, any>;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    
    // Relations
    tenant?: Tenant;
    location?: Location;
    assignments?: JobAssignment[];
    formResponses?: FormResponse[];
}

export interface JobAssignment {
    id: number;
    job_id: string;
    worker_id: string;
    role: string;
    assigned_at: string;
    status: 'assigned' | 'started' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    
    // Relations
    worker?: {
        id: string;
        user: User;
    };
    job?: Job;
}

export interface Skill {
    id: number;
    name: string;
    description?: string;
    category: string;
    skill_type: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    workers_count?: number;
}

export interface Certification {
    id: number;
    name: string;
    description?: string;
    authority: string;
    validity_period_months: number;
    is_active: boolean;
    tenant_id: number;
    tenant?: Tenant;
    created_at: string;
    updated_at: string;
    workers_count?: number;
}

export interface Form {
    id: string;
    tenant_id: string;
    name: string;
    type: string;
    schema: FormSchema;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    
    // Relations
    tenant?: Tenant;
    responses?: FormResponse[];
    
    // Computed fields
    responses_count?: number;
    fields_count?: number;
    recent_responses_count?: number;
}

export interface FormSchema {
    sections: FormSection[];
    settings?: Record<string, any>;
}

export interface FormSection {
    title: string;
    fields: FormField[];
}

export interface FormField {
    name: string;
    type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'datetime-local' | 'select' | 'checkbox' | 'radio' | 'file' | 'signature';
    label: string;
    required: boolean;
    options?: string[];
    validation?: Record<string, any>;
    placeholder?: string;
    description?: string;
}

export interface FormResponse {
    id: string;
    form_id: string;
    tenant_id: string;
    user_id: string;
    job_id?: string;
    response_data: Record<string, any>;
    is_submitted: boolean;
    submitted_at?: string;
    created_at: string;
    updated_at: string;
    
    // Relations
    form?: Form;
    tenant?: Tenant;
    user?: User;
    job?: Job;
    
    // Computed fields
    fields_count?: number;
    completion_percentage?: number;
    time_to_submit?: string;
}

export interface PaginatedData<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
