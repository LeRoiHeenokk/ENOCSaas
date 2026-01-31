import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Accueil</h1>
      <p>Bienvenue — placeholder</p>
      <nav>
        <Link href="/login">Connexion</Link> |{" "}
        <Link href="/onboarding">Onboarding</Link> |{" "}
        <Link href="/dashboard">Tableau de bord</Link>
      </nav>
    </main>
  );
}
