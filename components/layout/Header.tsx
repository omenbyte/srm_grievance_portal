"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LogOut, Menu, User, Home, MessageSquare, CircleHelp } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import SRMLogo from "@/public/logo_srm.png"
interface HeaderProps {
  isLoggedIn: boolean
  onLogout: () => void
  isAdmin?: boolean
}

export function Header({ isLoggedIn, onLogout, isAdmin = false }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = isLoggedIn
    ? [
        { href: "/", label: "Dashboard", icon: Home },
        { href: "/profile", label: "My Profile", icon: User },
        { href: "/contact", label: "Contact Us", icon: MessageSquare },
        { href: "/faq", label: "FAQ", icon: CircleHelp },
      ]
    : [
        { href: "/", label: "Home", icon: Home },
        { href: "/contact", label: "Contact Us", icon: MessageSquare },
        { href: "/faq", label: "FAQ", icon: CircleHelp },
      ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src={SRMLogo}alt="SRM IST Logo" width={16} height={16} />
            <span className="font-bold gradient-text">SRM Grievance</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {isLoggedIn && (
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <span className="text-sm text-muted-foreground">Admin Dashboard</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="rounded-xl"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
          <ThemeToggle />

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 text-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                {isLoggedIn && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onLogout()
                      setIsOpen(false)
                    }}
                    className="justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
