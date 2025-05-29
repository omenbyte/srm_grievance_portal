"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LogOut, Menu, User, Home, MessageSquare } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface HeaderProps {
  isLoggedIn: boolean
  onLogout: () => void
}

export function Header({ isLoggedIn, onLogout }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = isLoggedIn
    ? [
        { href: "/", label: "Dashboard", icon: Home },
        { href: "/profile", label: "My Profile", icon: User },
        { href: "/contact", label: "Contact Us", icon: MessageSquare },
      ]
    : [
        { href: "/", label: "Home", icon: Home },
        { href: "/contact", label: "Contact Us", icon: MessageSquare },
      ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
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

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isLoggedIn && (
              <Button variant="outline" size="sm" onClick={onLogout} className="hidden md:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}

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
      </div>
    </header>
  )
}
