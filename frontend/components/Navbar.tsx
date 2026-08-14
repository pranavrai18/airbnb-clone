"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useCategory } from "@/context/CategoryContext";
import { useSearch } from "@/context/SearchContext";
import { useTheme } from "@/context/ThemeContext";
import SearchBar from "@/components/SearchBar";
import { getListingDetail } from "@/lib/api";
import { ListingDetail } from "@/types";

const categoryTabs = [
  {
    label: "All",
    value: "",
    image:
      "https://a0.muscache.com/im/pictures/AirbnbPlatformAssets/AirbnbPlatformAssets-search-bar-icons/original/e2e1c806-2c65-4f0f-a85a-a7ae9a20d2e6.png?im_w=120",
  },
  {
    label: "Homes",
    value: "House,Villa,Treehouse,Apartment",
    image:
      "https://a0.muscache.com/im/pictures/AirbnbPlatformAssets/AirbnbPlatformAssets-search-bar-icons/original/3afe83ba-9aab-403b-a6f6-e4f557d74fc7.png?im_w=120",
  },
  {
    label: "Experiences",
    value: "Experiences",
    image:
      "https://a0.muscache.com/im/pictures/AirbnbPlatformAssets/AirbnbPlatformAssets-search-bar-icons/original/20e459e2-008c-42a1-a674-8b00fd841c2f.png?im_w=120",
  },
  {
    label: "Services",
    value: "Services",
    image:
      "https://a0.muscache.com/im/pictures/AirbnbPlatformAssets/AirbnbPlatformAssets-search-bar-icons/original/e048a726-9fe8-4d55-812f-173427f08588.png?im_w=120",
  },
];

export default function Navbar() {
  const { currentUser, allUsers, switchUser } = useUser();
  const { category, setCategory } = useCategory();
  const { searchFilter, setSearchFilter } = useSearch();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastGallery, setIsPastGallery] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [hostSearchQuery, setHostSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const initialNotifications = [
    {
      id: 1,
      title: "New Booking Request 📩",
      desc: "Sarah M. requested 4 nights at Beachfront Villa (Aug 20 - 24)",
      time: "10 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "5-Star Review Received ⭐",
      desc: "Alex left a rating: 'Outstanding host & amazing location!'",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payout Transferred 💰",
      desc: "$1,450 sent to your connected bank account",
      time: "Yesterday",
      unread: false,
    },
  ];

  const [notifications, setNotifications] = useState(initialNotifications);

  const isHome = pathname === "/";
  const isListingPage = pathname.startsWith("/listings/");

  const [listingDetail, setListingDetail] = useState<ListingDetail | null>(null);

  const markAllRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleUserSwitch = (targetUser: (typeof allUsers)[0]) => {
    if (!targetUser) return;
    switchUser(targetUser.id);
    setShowUserMenu(false);
    if (targetUser.role === "host") {
      router.push("/host");
    } else {
      if (pathname.startsWith("/host")) {
        router.push("/");
      }
    }
  };

  const handleBecomeHostClick = () => {
    if (currentUser?.role === "host") {
      router.push("/host");
    } else {
      const hostUser = allUsers.find((u) => u.role === "host");
      if (hostUser) {
        switchUser(hostUser.id);
      }
      router.push("/host");
    }
  };

  const handleHostSearch = (query: string) => {
    setHostSearchQuery(query);
    setSearchFilter({
      location: query,
      check_in: searchFilter.check_in || "",
      check_out: searchFilter.check_out || "",
      guests: searchFilter.guests || 1,
    });
    if (pathname !== "/host" && pathname !== "/") {
      router.push("/host");
    }
  };

  useEffect(() => {
    function handleScroll() {
      const currentY = window.scrollY;
      if (currentY > 90) {
        setIsScrolled(true);
      } else if (currentY < 20) {
        setIsScrolled(false);
      }
      if (currentY > 420) {
        setIsPastGallery(true);
      } else if (currentY < 380) {
        setIsPastGallery(false);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExpandSearch = () => {
    if (!isHome) {
      router.push("/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsScrolled(false);
  };

  useEffect(() => {
    if (isListingPage) {
      const parts = pathname.split("/");
      const id = Number(parts[parts.length - 1]);
      if (id) {
        getListingDetail(id).then(setListingDetail).catch(() => {});
      }
    } else {
      setListingDetail(null);
    }
  }, [pathname, isListingPage]);

  // Format compact search labels
  const locationLabel = searchFilter.location || "Anywhere";
  const dateLabel = searchFilter.check_in
    ? searchFilter.check_out
      ? `${searchFilter.check_in} – ${searchFilter.check_out}`
      : searchFilter.check_in
    : "Anytime";
  const guestLabel =
    searchFilter.guests > 0
      ? `${searchFilter.guests} guest${searchFilter.guests > 1 ? "s" : ""}`
      : "Add guests";

  if (isListingPage && isPastGallery) {
    return (
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-xs h-[80px] transition-all duration-300">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between h-full px-4 md:px-8">
          {/* Left: Photos, Amenities, Reviews, Location */}
          <div className="flex items-center gap-8 animate-in fade-in duration-200">
            {[
              { id: "photos", label: "Photos" },
              { id: "amenities", label: "Amenities" },
              { id: "reviews", label: "Reviews" },
              { id: "location", label: "Location" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  const el = document.getElementById(id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="group relative py-2 text-[14px] font-semibold text-[#222222] dark:text-white transition-colors hover:text-black dark:hover:text-slate-300 cursor-pointer"
              >
                <span>{label}</span>
                <span className="absolute bottom-[-26px] left-0 right-0 h-[2px] rounded-full bg-black dark:bg-white opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>

          {/* Right: Mini Price + Reserve Button */}
          <div className="flex items-center gap-4 animate-in fade-in duration-200">
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                {listingDetail && (
                  <span className="text-xs text-gray-400 line-through">
                    ₹{Math.round(listingDetail.price_per_night * 1.25).toLocaleString()}
                  </span>
                )}
                <span className="text-base font-bold text-[#222222] dark:text-white underline">
                  ₹{listingDetail ? listingDetail.price_per_night.toLocaleString() : "3,872"}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  {listingDetail?.property_type === "Experiences" ? "per person" : "for 2 nights"}
                </span>
              </div>
              <div className="flex items-center gap-1 justify-end text-xs text-[#222222] dark:text-slate-300 font-semibold mt-0.5">
                <span>★ {listingDetail?.avg_rating ? listingDetail.avg_rating : "New"}</span>
                {listingDetail?.review_count ? (
                  <span className="text-gray-500 dark:text-slate-400">({listingDetail.review_count})</span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("booking-card");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.scrollTo({ top: 500, behavior: "smooth" });
                }
              }}
              className="rounded-full bg-[#E00B41] px-6 py-2.5 text-[15px] font-semibold text-white transition hover:bg-[#d70466] shadow-xs cursor-pointer"
            >
              Reserve
            </button>
          </div>
        </div>
      </header>
    );
  }

  if (currentUser?.role === "host") {
    return (
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-xs h-[80px] transition-all duration-300">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between h-full px-4 md:px-8">
          {/* Left: Airbnb Logo + Host Portal Badge */}
          <Link href="/host" className="flex items-center gap-3 py-2 pr-1 transition-opacity hover:opacity-90">
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9"
              fill="#FF385C"
            >
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.088l-.196.2c-2.07 2.082-4.39 3.403-6.553 3.615l-.312.01C5.377 31 2.5 28.584 2.5 24.522l.005-.469c.043-.987.282-1.851.938-3.388l.168-.39c.996-2.296 5.146-10.99 7.098-14.825l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.008c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.838c-.427 1.079-.573 1.758-.603 2.553l-.002.457c0 2.864 1.92 4.242 4.348 4.242 1.327 0 3.009-.745 4.96-2.394l.5-.437.168-.138c.458-.345.9-.345 1.356 0l.165.135.504.44c1.927 1.623 3.593 2.394 4.96 2.394 2.428 0 4.348-1.378 4.348-4.242l-.006-.457c-.03-.795-.176-1.474-.603-2.553l-.345-.838c-.972-2.263-5.106-10.918-7.031-14.692l-.523-1.008C18.053 3.539 17.239 3 16 3z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[20px] font-extrabold tracking-[-0.05em] text-[#FF385C] leading-none">
                airbnb
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 dark:text-slate-400">
                Host Portal
              </span>
            </div>
          </Link>

          {/* Center: Host Quick Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <svg viewBox="0 0 32 32" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 fill-gray-400 pointer-events-none">
                <path d="M13 3a10 10 0 1 0 6.32 17.74l6.47 6.47 1.41-1.41-6.47-6.47A10 10 0 0 0 13 3zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16z" />
              </svg>
              <input
                type="text"
                value={hostSearchQuery}
                onChange={(e) => handleHostSearch(e.target.value)}
                placeholder="Search listings, guests, reservations..."
                className="w-full rounded-full border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 py-2 pl-10 pr-4 text-xs font-medium text-gray-800 dark:text-white outline-none transition focus:border-gray-800 focus:bg-white dark:focus:bg-slate-900"
              />
              {hostSearchQuery && (
                <button
                  type="button"
                  onClick={() => handleHostSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Host Actions (Notifications + User Menu) */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell with Dropdown Modal */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer"
                title="Host Notifications"
              >
                <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current">
                  <path d="M16 2a9 9 0 0 0-9 9v7l-2 3v1h22v-1l-2-3v-7a9 9 0 0 0-9-9zm0 28a4 4 0 0 0 4-4h-8a4 4 0 0 0 4 4z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#FF385C] text-[9px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 shadow-2xl z-50">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 px-4 pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Host Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-rose-100 dark:bg-rose-950 px-2 py-0.5 text-[10px] font-semibold text-[#FF385C]">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-xs font-semibold text-[#FF385C] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 transition hover:bg-gray-50 dark:hover:bg-slate-700 ${
                          item.unread ? "bg-rose-50/40 dark:bg-slate-800/80" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{item.title}</p>
                          <span className="text-[10px] text-gray-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 dark:text-slate-300 leading-snug">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 dark:border-slate-700 pt-2 px-4 text-center">
                    <Link
                      href="/host"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white"
                    >
                      View all host activities →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Host Hamburger User Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-3 hover:shadow-md transition cursor-pointer"
              >
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-gray-600 dark:fill-slate-300">
                  <path d="M4 7h24v3H4zm0 8h24v3H4zm0 8h24v3H4z" />
                </svg>
                <img
                  src={currentUser?.avatar_url || ""}
                  alt={currentUser?.name || "Host"}
                  className="h-7 w-7 rounded-full object-cover"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 shadow-xl z-50">
                  <div className="border-b border-gray-100 dark:border-slate-700 pb-1 pt-1">
                    <Link
                      href="/host"
                      onClick={() => setShowUserMenu(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      🏠 Host Dashboard
                    </Link>
                    <Link
                      href="/host/create"
                      onClick={() => setShowUserMenu(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      ➕ Create New Listing
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleTheme()}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <span>{theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}</span>
                    </button>
                  </div>

                  <div className="border-b border-gray-100 dark:border-slate-700 px-4 pb-1 pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">Switch User Account</p>
                  </div>
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSwitch(user)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer ${
                        currentUser?.id === user.id ? "bg-gray-50 dark:bg-slate-700 font-semibold" : ""
                      }`}
                    >
                      <img src={user.avatar_url || ""} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                      <div>
                        <p className="text-sm text-gray-800 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                      </div>
                      {currentUser?.id === user.id && <span className="ml-auto text-sm text-[#FF385C]">●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-[#f7f7f7] dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-xs transition-all duration-300 ease-in-out ${
        isHome && !isScrolled ? "h-[200px]" : "h-[80px]"
      }`}
    >
      <div className="mx-auto flex max-w-[1240px] flex-col justify-start h-full px-2 md:px-4">
        {/* Top Navbar Row */}
        <div className="flex h-[80px] w-full items-center justify-between">
          {/* Left: Airbnb Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 py-2 pr-1 transition-opacity hover:opacity-90">
            <svg
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="#FF385C"
            >
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.088l-.196.2c-2.07 2.082-4.39 3.403-6.553 3.615l-.312.01C5.377 31 2.5 28.584 2.5 24.522l.005-.469c.043-.987.282-1.851.938-3.388l.168-.39c.996-2.296 5.146-10.99 7.098-14.825l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.008c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.838c-.427 1.079-.573 1.758-.603 2.553l-.002.457c0 2.864 1.92 4.242 4.348 4.242 1.327 0 3.009-.745 4.96-2.394l.5-.437.168-.138c.458-.345.9-.345 1.356 0l.165.135.504.44c1.927 1.623 3.593 2.394 4.96 2.394 2.428 0 4.348-1.378 4.348-4.242l-.006-.457c-.03-.795-.176-1.474-.603-2.553l-.345-.838c-.972-2.263-5.106-10.918-7.031-14.692l-.523-1.008C18.053 3.539 17.239 3 16 3z" />
            </svg>
            <span
              className="hidden text-[24px] font-extrabold tracking-[-0.06em] text-[#FF385C] md:inline"
              style={{
                fontFamily:
                  '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
              }}
            >
              airbnb
            </span>
          </Link>

          {/* Center: Swappable Category Tabs / Compact Search Bar */}
          <div className="hidden flex-1 items-center justify-center lg:flex transition-all duration-300">
            {isListingPage || isScrolled ? (
              /* Compact Search Pill */
              <button
                type="button"
                onClick={handleExpandSearch}
                className="ml-10 md:ml-16 flex items-center gap-3 rounded-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-4 shadow-xs transition hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <img
                    src="https://a0.muscache.com/im/pictures/AirbnbPlatformAssets/AirbnbPlatformAssets-search-bar-icons/original/3afe83ba-9aab-403b-a6f6-e4f557d74fc7.png?im_w=120"
                    alt=""
                    className="h-7 w-7 object-contain opacity-100 transition-transform duration-200 group-hover:scale-115"
                  />
                  <span className="text-[14px] font-semibold text-[#222222] dark:text-white">
                    {locationLabel}
                  </span>
                </div>

                <div className="h-4 w-[1px] bg-gray-300 dark:bg-slate-700" />

                <span className="text-[14px] font-semibold text-[#222222] dark:text-white">
                  {dateLabel}
                </span>

                <div className="h-4 w-[1px] bg-gray-300 dark:bg-slate-700" />

                <span className="text-[14px] font-medium text-gray-500 dark:text-slate-400">
                  {guestLabel}
                </span>

                <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#E00B41] text-white">
                  <svg viewBox="0 0 32 32" className="h-3 w-3 stroke-white stroke-[3.5]" fill="none">
                    <circle cx="13" cy="13" r="7.5" />
                    <path d="M20 20l8 8" strokeLinecap="round" />
                  </svg>
                </div>
              </button>
            ) : (
              /* Extended Category Nav Tabs (Horizontal: icon left, label right with bold underline) */
              <div className="ml-6 md:ml-12 lg:ml-16 flex items-center gap-4 md:gap-6">
                {categoryTabs.map(({ label, value, image }) => {
                  const isActive = category === value;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setCategory(value)}
                      className={`group relative flex items-center gap-2.5 py-2 cursor-pointer transition-colors ${
                        isActive
                          ? "text-black dark:text-white font-semibold"
                          : "text-gray-500 dark:text-slate-400 font-medium hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <img
                        src={image}
                        alt={label}
                        aria-hidden="true"
                        className={`h-12 w-12 shrink-0 object-contain transition-all duration-200 group-hover:scale-110 ${
                          isActive ? "opacity-100" : "opacity-75 group-hover:opacity-100"
                        }`}
                      />
                      <span
                        className="text-[15px] leading-none"
                        style={{
                          fontFamily:
                            '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
                        }}
                      >
                        {label}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-[-1px] left-0 right-0 h-[3px] rounded-full bg-black dark:bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex shrink-0 items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleBecomeHostClick}
              className="hidden h-[40px] items-center rounded-full px-4 py-[11px] text-[14px] leading-[18px] font-semibold text-[#222222] dark:text-white transition-colors hover:bg-[#ebebeb] dark:hover:bg-slate-800 sm:inline-flex cursor-pointer"
              style={{
                fontFamily:
                  '"Airbnb Cereal VF", Circular, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
              }}
            >
              Become a host
            </button>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4e4e4] dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-white hover:bg-[#d8d8d8] dark:hover:bg-slate-700 transition cursor-pointer shadow-xs"
              aria-label="Language selector"
            >
              <svg viewBox="0 0 16 16" className="h-5 w-5 fill-current">
                <path d="M8 0a8 8 0 1 0 8 8A8.009 8.009 0 0 0 8 0zm5.93 7H11.7a14.2 14.2 0 0 0-1.4-5.32A6.52 6.52 0 0 1 13.93 7zM8 1.52A12.72 12.72 0 0 1 9.87 7H6.13A12.72 12.72 0 0 1 8 1.52zM2.07 7A6.52 6.52 0 0 1 5.7 1.68 14.2 14.2 0 0 0 4.3 7zM2.07 9h3.63a14.2 14.2 0 0 0 1.4 5.32A6.52 6.52 0 0 0 2.07 9zM8 14.48A12.72 12.72 0 0 1 6.13 9h3.74A12.72 12.72 0 0 1 8 14.48zm4.3-5.48a14.2 14.2 0 0 0 1.4-5.32A6.52 6.52 0 0 1 13.93 9z" />
              </svg>
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4e4e4] dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-white hover:bg-[#d8d8d8] dark:hover:bg-slate-700 transition cursor-pointer shadow-xs"
                aria-label="User menu"
              >
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-gray-800 dark:fill-slate-200">
                  <path d="M4 7h24v3H4zm0 8h24v3H4zm0 8h24v3H4z" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 shadow-xl z-50">
                  {/* Navigation links */}
                  <div className="border-b border-gray-100 dark:border-slate-700 pb-1">
                    <Link
                      href="/trips"
                      onClick={() => setShowUserMenu(false)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-slate-700 ${
                        pathname === "/trips" ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-slate-300"
                      }`}
                    >
                      🧳 My Trips
                    </Link>
                    {(currentUser?.role as string) === "host" && (
                      <Link
                        href="/host"
                        onClick={() => setShowUserMenu(false)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-slate-700 ${
                          pathname.startsWith("/host") ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-slate-300"
                        }`}
                      >
                        🏠 Host Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleTheme()}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <span>{theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}</span>
                    </button>
                  </div>

                  {/* User switcher */}
                  <div className="border-b border-gray-100 dark:border-slate-700 px-4 pb-2 pt-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-slate-400">Switch User</p>
                  </div>
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSwitch(user)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer ${
                        currentUser?.id === user.id ? "bg-gray-50 dark:bg-slate-700 font-semibold" : ""
                      }`}
                    >
                      <img src={user.avatar_url || ""} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                      </div>
                      {currentUser?.id === user.id && <span className="ml-auto text-sm text-[#FF385C]">●</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Expanded SearchBar Row (Integrated inside Header on Homepage with smooth CSS transition) */}
        {isHome && (
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              isScrolled
                ? "max-h-0 opacity-0 pointer-events-none mt-0 pb-0 pt-0 overflow-hidden"
                : "max-h-[160px] opacity-100 mt-2.5 pb-4 pt-0 overflow-visible"
            }`}
          >
            <SearchBar onSearch={(params) => setSearchFilter(params)} />
          </div>
        )}
      </div>
    </header>
  );
}
