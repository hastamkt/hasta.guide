import { Providers } from "./providers";

export const metadata = { title: "IA para Leigos" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "Archivo, system-ui, sans-serif", background: "#f4f1f8", color: "#1a0b22" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
