"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";

export default function Header({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-center py-4">
        {/* Left: Menu Burger + Search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-gray-800"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Center: Logo */}
        <Link href="/" className="flex-shrink-0">
          <img
            src="/logo.svg" // Remplacez par votre logo
            alt="Site Logo"
            width={100}
            height={100}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation Bar */}
      <nav className="hidden lg:flex justify-center p-4 bg-gray-100 shadow-sm">
        <ul className="flex gap-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/${category.slug}`}
                className="text-gray-700 hover:text-black relative pb-2"
              >
                {category.name}
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black scale-x-0 hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-md">
          <nav className="flex flex-col gap-2 p-4">
            {categories.map((category) => (
              <Link
                key={`category-${category.slug}`}
                href={`/${category.slug}`}
                className="text-gray-700 hover:text-black"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
