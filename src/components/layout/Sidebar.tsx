import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  UserCheck, 
  Calendar, 
  MapPin, 
  Bed, 
  Plane, 
  User,
  Menu,
  Shield,
  Hospital,
  MessageSquare
} from 'lucide-react';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Treatments', url: '/treatments', icon: Stethoscope },
  { title: 'Consultations', url: '/consultations', icon: Calendar },
  { title: 'Hospitals', url: '/hospitals', icon: Hospital },
  { title: 'Tour Packages', url: '/tour-packages', icon: MapPin },
  { title: 'Accommodation', url: '/stays', icon: Bed },
  { title: 'Bookings', url: '/bookings', icon: Plane },
  { title: 'Chat', url: '/chat', icon: MessageSquare },
];

const adminItems = [
  { title: 'Admin Panel', url: '/admin', icon: Shield },
];

export function Sidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const collapsed = state === 'collapsed';
  
  const getNavClasses = (active: boolean) =>
    active 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <SidebarComponent className={`${collapsed ? "w-14" : "w-64"} bg-card`} collapsible="icon">
      <SidebarContent className="bg-card border-r h-full">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-lg">MedGlobal</h2>
                <p className="text-xs text-muted-foreground">Medical Tourism</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="py-4">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getNavClasses(isActive)}`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Admin Section */}
              {profile?.role === 'admin' && (
                <>
                  {!collapsed && (
                    <div className="px-3 py-2 mt-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Administration
                      </h3>
                    </div>
                  )}
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={({ isActive }) => 
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getNavClasses(isActive)}`
                          }
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {profile && !collapsed && (
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile.name || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </SidebarComponent>
  );
}