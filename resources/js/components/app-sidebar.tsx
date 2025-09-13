import { NavFooter } from '@/components/nav-footer';
import { NavMainSections } from '@/components/nav-main-sections';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Building2, BarChart3, Briefcase, Shield, Key, Package, FileText, ClipboardList, MapPin, Wrench, Award, Bell } from 'lucide-react';
import AppLogo from './app-logo';

// Admin navigation items (global admin)
const adminNavItems: NavItem[] = [
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

// Tenant admin navigation items (tenant-specific admin)
const tenantAdminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/tenant/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Jobs',
        href: '/tenant/jobs',
        icon: Briefcase,
    },
    {
        title: 'Workers',
        href: '/tenant/workers',
        icon: Users,
    },
    {
        title: 'Assets',
        href: '/tenant/assets',
        icon: Package,
    },
    {
        title: 'Locations',
        href: '/tenant/locations',
        icon: MapPin,
    },
    {
        title: 'Forms',
        href: '/tenant/forms',
        icon: FileText,
    },
    {
        title: 'Form Responses',
        href: '/tenant/form-responses',
        icon: ClipboardList,
    },
    {
        title: 'Notifications',
        href: '/tenant/notifications',
        icon: Bell,
    },
    {
        title: 'Team Management',
        href: '/tenant/users',
        icon: Users,
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
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    
    // Get all user roles
    const userRoles = user.roles || [];
    
    // Create navigation sections for each role
    const navigationSections = [];
    
    // Determine primary dashboard based on highest priority role
    let primaryDashboard = '/dashboard';
    
    // Add sections for each role the user has
    userRoles.forEach(role => {
        if (role.slug === 'admin') {
            navigationSections.push({
                title: 'Global Admin',
                items: adminNavItems
            });
            primaryDashboard = '/admin/dashboard'; // Highest priority
        } else if (role.slug === 'tenant') {
            navigationSections.push({
                title: 'Tenant Manager',
                items: tenantAdminNavItems
            });
            if (primaryDashboard === '/dashboard') {
                primaryDashboard = '/tenant/dashboard';
            }
        } else if (role.slug === 'supervisor') {
            // Add supervisor navigation if needed
            navigationSections.push({
                title: 'Supervisor',
                items: [
                    {
                        title: 'My Dashboard',
                        href: '/supervisor/dashboard',
                        icon: LayoutGrid,
                    },
                    {
                        title: 'My Teams',
                        href: '/supervisor/teams',
                        icon: Users,
                    },
                    {
                        title: 'Team Jobs',
                        href: '/supervisor/jobs',
                        icon: Briefcase,
                    },
                    {
                        title: 'Notifications',
                        href: '/supervisor/notifications',
                        icon: Bell,
                    },
                ]
            });
            if (primaryDashboard === '/dashboard') {
                primaryDashboard = '/supervisor/dashboard';
            }
        } else if (role.slug === 'worker') {
            // Add worker navigation if needed
            navigationSections.push({
                title: 'Worker',
                items: [
                    {
                        title: 'My Dashboard',
                        href: '/worker/dashboard',
                        icon: LayoutGrid,
                    },
                    {
                        title: 'My Jobs',
                        href: '/worker/jobs',
                        icon: Briefcase,
                    },
                    {
                        title: 'My Notifications',
                        href: '/worker/notifications',
                        icon: Bell,
                    },
                ]
            });
            if (primaryDashboard === '/dashboard') {
                primaryDashboard = '/worker/dashboard';
            }
        } else if (role.slug === 'client') {
            // Add client navigation (read-only)
            navigationSections.push({
                title: 'Client',
                items: [
                    {
                        title: 'Project Dashboard',
                        href: '/client/dashboard',
                        icon: LayoutGrid,
                    },
                    {
                        title: 'Project Status',
                        href: '/client/projects',
                        icon: Briefcase,
                    },
                    {
                        title: 'Updates',
                        href: '/client/notifications',
                        icon: Bell,
                    },
                ]
            });
            if (primaryDashboard === '/dashboard') {
                primaryDashboard = '/client/dashboard';
            }
        }
    });

    // Fallback if no sections were created
    if (navigationSections.length === 0) {
        navigationSections.push({
            title: 'Default',
            items: tenantAdminNavItems
        });
        primaryDashboard = '/tenant/dashboard';
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={primaryDashboard} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMainSections sections={navigationSections} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}