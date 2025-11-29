import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Download,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Schedule from "@/pages/schedule";
import Admin from "@/pages/admin";
import Export from "@/pages/export";

function NavLink({ 
  href, 
  icon: Icon, 
  children 
}: { 
  href: string; 
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <Button 
        variant={isActive ? "secondary" : "ghost"} 
        className={cn(
          "gap-2 justify-start",
          isActive && "bg-primary/10 text-primary"
        )}
        data-testid={`nav-${href.slice(1) || 'dashboard'}`}
      >
        <Icon className="w-4 h-4" />
        {children}
      </Button>
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-14 items-center justify-between px-4 gap-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 font-semibold cursor-pointer hover-elevate rounded-md px-2 py-1">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline-block">Class Scheduler</span>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="flex items-center gap-1">
            <NavLink href="/" icon={LayoutDashboard}>
              Dashboard
            </NavLink>
            <NavLink href="/schedule" icon={Calendar}>
              Schedule
            </NavLink>
            <NavLink href="/admin" icon={Settings}>
              Admin
            </NavLink>
            <NavLink href="/export" icon={Download}>
              Export
            </NavLink>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/admin" component={Admin} />
      <Route path="/export" component={Export} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="scheduler-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
