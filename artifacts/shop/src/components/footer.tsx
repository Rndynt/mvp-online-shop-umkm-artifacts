interface FooterProps {
  storeName?: string;
}

export function Footer({ storeName = 'RukoLite' }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 mt-16 py-8 text-center text-sm text-slate-400">
      <p>© 2025 {storeName} — Belanja mudah, aman, dan terpercaya</p>
    </footer>
  );
}
