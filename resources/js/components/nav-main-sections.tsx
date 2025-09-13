import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavSection {
    title: string;
    items: NavItem[];
}

export function NavMainSections({ sections = [] }: { sections: NavSection[] }) {
    const page = usePage();
    // Domyślnie rozwij pierwszą sekcję
    const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
    
    const toggleSection = (index: number) => {
        const newOpenSections = new Set(openSections);
        if (newOpenSections.has(index)) {
            newOpenSections.delete(index);
        } else {
            newOpenSections.add(index);
        }
        setOpenSections(newOpenSections);
    };
    
    return (
        <>
            {sections.map((section, index) => (
                <Collapsible key={index} open={openSections.has(index)} onOpenChange={() => toggleSection(index)}>
                    <SidebarGroup className="px-2 py-0">
                        <CollapsibleTrigger asChild>
                            <SidebarGroupLabel className="flex w-full items-center justify-between cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1 transition-colors">
                                <span>{section.title}</span>
                                {openSections.has(index) ? (
                                    <ChevronDown className="h-4 w-4 transition-transform" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 transition-transform" />
                                )}
                            </SidebarGroupLabel>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenu>
                                {section.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)}
                                            tooltip={{ children: item.title }}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </CollapsibleContent>
                    </SidebarGroup>
                </Collapsible>
            ))}
        </>
    );
}