import AuthGuard from "@/components/Auth";
import Navbar from "@/components/Navbar";

export default async function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <AuthGuard>
        <main className="">
          <Navbar />
          {children}
        </main>
      </AuthGuard>
    );
  }