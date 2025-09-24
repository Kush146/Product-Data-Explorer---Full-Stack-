"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Header() {
  const r = useRouter();
  const [q, setQ] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    r.push(`/browse?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="border-b">
      {/* top bar */}
      <div className="container flex items-center gap-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-wob-green" />
          <span className="text-xl font-bold">World of Books</span>
        </Link>

        <form onSubmit={onSearch} className="ml-auto flex w-full max-w-2xl">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by title, author or ISBN"
            className="w-full rounded-l-md border px-4 py-2 outline-none focus:ring-2 focus:ring-wob-green"
          />
          <button className="btn-green rounded-l-none">Search</button>
        </form>

        <nav className="ml-4 hidden gap-6 md:flex text-[15px]">
          <Link href="/about" className="hover:underline">Help</Link>
          <Link href="/about" className="hover:underline">Account</Link>
          <Link href="/contact" className="hover:underline">Wishlist</Link>
          <Link href="/contact" className="hover:underline">Basket</Link>
        </nav>
      </div>

      {/* nav tabs */}
      <div className="border-t">
        <div className="container flex flex-wrap items-center gap-4 py-3 text-[15px] font-semibold">
          <Link className="hover:text-wob-green" href="/browse/fiction">Fiction Books</Link>
          <Link className="hover:text-wob-green" href="/browse/non-fiction">Non-Fiction Books</Link>
          <Link className="hover:text-wob-green" href="/browse/children">Children’s Books</Link>
          <Link className="hover:text-wob-green" href="/browse/rare">Rare Books</Link>
          <Link className="hover:text-wob-green" href="/browse/music">Music</Link>
          <Link className="hover:text-wob-green" href="/browse/dvd">DVD & Blu-Ray</Link>
          <Link className="hover:text-wob-green" href="/browse/games">Video Games</Link>
          <Link className="hover:text-wob-green" href="/sell">Sell Your Books</Link>
        </div>
      </div>
    </header>
  );
}
