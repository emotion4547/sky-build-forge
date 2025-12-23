export function Footer() {
  return (
    <footer className="py-8 border-t border-border bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary" />
            <span className="font-semibold text-foreground">СКБ УРАЛ56</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 СКБ УРАЛ56. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
