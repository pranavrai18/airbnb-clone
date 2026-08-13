"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-slate-800 bg-[#F7F7F7] dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Upper Navigation Links Grid */}
      <div className="mx-auto max-w-[1240px] px-6 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Column 1: Support */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Help Center</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">AirCover</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Anti-discrimination</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Disability support</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Cancellation options</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Report neighborhood concern</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Hosting */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Hosting</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
              <li>
                <Link href="/host/create" className="hover:underline transition font-bold text-gray-900 dark:text-white">Airbnb your home</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">AirCover for Hosts</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Hosting resources</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Community forum</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Hosting responsibly</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Join a free Hosting class</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Airbnb */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Airbnb</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Newsroom</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">New features</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Careers</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Investors</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Gift cards</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Airbnb.org emergency stays</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar (Copyright, Language, Currency, Social) */}
      <div className="border-t border-gray-200 dark:border-slate-800 bg-[#F7F7F7] dark:bg-slate-950">
        <div className="mx-auto flex max-w-[1240px] flex-col-reverse items-center justify-between gap-4 px-6 py-6 text-sm text-gray-600 dark:text-slate-400 md:flex-row md:px-8">
          {/* Copyright & Legal Links */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-center md:text-left">
            <span>© 2026 Airbnb, Inc.</span>
            <span>·</span>
            <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Privacy</Link>
            <span>·</span>
            <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Terms</Link>
            <span>·</span>
            <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Sitemap</Link>
            <span>·</span>
            <Link href="#" className="hover:text-black dark:hover:text-white hover:underline transition">Company details</Link>
          </div>

          {/* Language, Currency & Social Links */}
          <div className="flex items-center gap-6 font-bold text-gray-900 dark:text-white">
            {/* Language */}
            <button type="button" className="flex items-center gap-2 transition hover:underline cursor-pointer">
              <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
                <path d="M8 0a8 8 0 1 0 8 8A8.009 8.009 0 0 0 8 0zm5.93 7H11.7a14.2 14.2 0 0 0-1.4-5.32A6.52 6.52 0 0 1 13.93 7zM8 1.52A12.72 12.72 0 0 1 9.87 7H6.13A12.72 12.72 0 0 1 8 1.52zM2.07 7A6.52 6.52 0 0 1 5.7 1.68 14.2 14.2 0 0 0 4.3 7zM2.07 9h3.63a14.2 14.2 0 0 0 1.4 5.32A6.52 6.52 0 0 0 2.07 9zM8 14.48A12.72 12.72 0 0 1 6.13 9h3.74A12.72 12.72 0 0 1 8 14.48zm4.3-5.48a14.2 14.2 0 0 0 1.4-5.32A6.52 6.52 0 0 1 13.93 9z" />
              </svg>
              <span>English (IN)</span>
            </button>

            {/* Currency */}
            <button type="button" className="transition hover:underline cursor-pointer">
              ₹ INR
            </button>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-gray-700 dark:text-slate-300">
              <a href="#" aria-label="Facebook" className="transition hover:text-black dark:hover:text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="transition hover:text-black dark:hover:text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="transition hover:text-black dark:hover:text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
