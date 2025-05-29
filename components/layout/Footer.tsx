export function Footer() {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 relative z-10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SRM Institute of Science and Technology. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
