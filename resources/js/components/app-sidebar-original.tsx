import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Building2, BarChart3, Briefcase, Shield, Key, Package, FileText, ClipboardList, MapPin, Wrench, Award, Bell } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Jobs',
        href: '/admin/jobs',
        icon: Briefcase,
    },
    {
        title: 'Workers',
        href: '/admin/workers',
        icon: Users,
    },
    {
        title: 'Assets',
        href: '/admin/assets',
        icon: Package,
    },
    {
        title: 'Locations',
        href: '/admin/locations',
        icon: MapPin,
    },
    {
        title: 'Skills',
        href: '/admin/skills',
        icon: Wrench,
    },
    {
        title: 'Certifications',
        href: '/admin/certifications',
        icon: Award,
    },
    {
        title: 'Sectors',
        href: '/admin/sectors',
        icon: Building2,
    },
    {
        title: 'Forms',
        href: '/admin/forms',
        icon: FileText,
    },
    {
        title: 'Form Responses',
        href: '/admin/form-responses',
        icon: ClipboardList,
    },
    {
        title: 'Notifications',
        href: '/admin/notifications',
        icon: Bell,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Roles',
        href: '/admin/roles',
        icon: Shield,
    },
    {
        title: 'Permissions',
        href: '/admin/permissions',
        icon: Key,
    },
    {
        title: 'Tenants',
        href: '/admin/tenants',
        icon: Building2,
    },
    {
        title: 'Quota Management',
        href: '/admin/quotas',
        icon: BarChart3,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
