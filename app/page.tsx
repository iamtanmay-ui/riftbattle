"use client";

import { Button } from "@/components/ui/button";
import { GamepadIcon, Shield, Users, Zap, Sparkles, Trophy, Wrench } from "lucide-react";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { HeroCarousel } from "@/components/ui/hero-carousel";
import { useRouter } from "next/navigation";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useAtom } from "jotai";
import { isLoginDialogOpenAtom } from "@/lib/atoms";
import { useAuthStore } from "@/lib/store";
import { useUser } from "@/lib/clerk-mock";

export default function Home() {
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useAtom(isLoginDialogOpenAtom);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  const userEmail = user?.email || null;
  const isAuthorizedSeller = isApprovedSeller(userEmail, isAuthenticated);

  const navigateToMarketplace = () => {
    router.push("/marketplace");
  };

  const openLoginDialog = () => {
    setIsLoginOpen(true);
  };

  const navigateToSignup = () => {
    router.push("/signup");
  };

  const heroSlides = [
    {
      image: "/images/Fortnite.jpg.webp",
      title: "Level Up Your Gaming Experience",
      description: "The ultimate destination for premium Fortnite accounts. Trade with confidence.",
      ctaText: "Start Trading",
      ctaAction: navigateToMarketplace,
    },
    {
      image: "/images/fneco-socialmotdblog-motd-1920x1080-1920x1080-2cd96552c7d6.jpg",
      title: "Join the Elite Gaming Community",
      description: "Connect with thousands of gamers and find the perfect account for your needs.",
      ctaText: "Explore Accounts",
      ctaAction: navigateToMarketplace,
    },
    {
      image: "/images/evergreen-ecosystem-1920x1080-4b4b8876d6a4.jpg",
      title: "Secure and Trusted Trading",
      description: "Our advanced escrow system ensures safe transactions every time.",
      ctaText: "Get Started Now",
      ctaAction: openLoginDialog,
    },
  ];

  return (
    <PageLayout>
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Carousel Section */}
        <HeroCarousel slides={heroSlides} />

        {/* Stats Section */}
        <div className="relative z-10 -mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
              {stats.map((stat) => (
                <div key={stat.name} className="text-center">
                  <p className="text-3xl font-bold text-blue-400">{stat.value}</p>
                  <p className="text-gray-400 mt-1">{stat.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="group bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                <feature.icon className="h-12 w-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div 
                  key={category.name}
                  className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-6 flex flex-col items-center text-center hover:bg-slate-800/80 transition-colors"
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-4 text-gray-300">
                    {/* Display the icon */}
                    {category.icon && <category.icon className="w-10 h-10" />}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                  <p className="text-gray-400">{category.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-8" />
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Join the Elite?</h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of traders in the largest Fortnite marketplace. Start trading today and become part of our growing community.
            </p>
            
          </div>
        </div>
      </main>
    </PageLayout>
  );
}

const stats = [
  { name: "Active Users", value: "50K+" },
  { name: "Trades Complete", value: "100K+" },
  { name: "Items Listed", value: "250K+" },
  { name: "Success Rate", value: "99.9%" },
];

const features = [
  {
    icon: Shield,
    title: "Secure Trading",
    description: "Every transaction is protected with our advanced escrow system and 24/7 support team."
  },
  {
    icon: Users,
    title: "Verified Sellers",
    description: "All sellers go through a strict verification process to ensure legitimate transactions."
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Get instant access to your purchased accounts with our automated delivery system."
  }
];

const categories = [
  { name: "Outfits", count: "1000+ Items", href: "/categories/outfits", icon: Users },
  { name: "Emotes", count: "500+ Items", href: "/categories/emotes", icon: GamepadIcon },
  { name: "Pickaxes", count: "300+ Items", href: "/categories/pickaxes", icon: Zap },
  { name: "Gliders", count: "200+ Items", href: "/categories/gliders", icon: Shield },
];

const isApprovedSeller = (userEmail: string | null, isAuthenticated: boolean) => {
  if (!isAuthenticated || !userEmail) return false;
  
  const approvedEmails = process.env.NEXT_PUBLIC_APPROVED_SELLER_EMAILS?.split(',') || [];
  
  return approvedEmails.some(email => email.trim().toLowerCase() === userEmail.toLowerCase());
};