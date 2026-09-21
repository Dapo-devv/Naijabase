import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Briefcase,
  Target,
  MapPin,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Users,
  Receipt,
  Globe,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function Landing() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, tag")
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setPosts(data);
      });
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 transition-colors duration-300">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-primary-900 dark:via-gray-900 dark:to-black px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6"
          >
            <Globe className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-xs font-medium text-white">
              Available Worldwide · 24 Currencies Supported
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5"
          >
            Take Full Control of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-secondary">
              Every Amount
            </span>{" "}
            You Earn
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-base sm:text-lg text-primary-100/90 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Track daily expenses, manage your business finances, plan your
            income, and watch your savings grow — all in one beautifully simple
            app designed for people all over the world.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              to="/register"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-primary-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-50 transition-all text-sm sm:text-base"
            >
              Get Started — It's Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-sm sm:text-base"
            >
              Sign In
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-primary-100/80"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-300" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-300" /> Free forever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-300" /> Any currency
            </span>
          </motion.div>
        </div>

        {/* Floating preview — NGN mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="relative max-w-md mx-auto mt-14"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-3 shadow-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Welcome back
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    TrackCash
                  </p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl px-2.5 py-1.5 text-right">
                  <p className="text-[8px] text-gray-500 uppercase">
                    Plan Remaining
                  </p>
                  <p className="text-sm font-bold text-green-600">₦42,500</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5">
                  <p className="text-[9px] text-red-600 font-semibold uppercase">
                    Spend
                  </p>
                  <p className="text-sm font-bold text-red-600">₦57,500</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5">
                  <p className="text-[9px] text-green-600 font-semibold uppercase">
                    Revenue
                  </p>
                  <p className="text-sm font-bold text-green-600">₦120,000</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Budget Used
                  </p>
                  <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                    57%
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 w-[57%]" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-primary-50 dark:bg-gray-800/50 border-y border-primary-100 dark:border-gray-700 py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { label: "Expense Tracking", value: "1-Tap Logging" },
            { label: "Business Tool", value: "All-in-One" },
            { label: "Currencies", value: "24 Supported" },
            { label: "Data Security", value: "Encrypted" },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp}>
              <p className="text-lg sm:text-xl font-extrabold text-primary dark:text-primary-400">
                {item.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {item.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <p className="text-xs font-bold text-primary dark:text-primary-400 uppercase tracking-widest mb-2">
              Why TrackCash
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              Everything You Need in One App
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              From your morning coffee run to running a full business —
              TrackCash has the tools to keep your money organized. In any
              currency, anywhere in the world.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              {
                icon: ShoppingCart,
                title: "Daily Expense Tracking",
                desc: "Log everything you buy in seconds. Track prices, see daily totals, and understand exactly where your money goes.",
                color:
                  "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
              },
              {
                icon: Briefcase,
                title: "Business Finance Hub",
                desc: "Separate your business from personal. Track sales, expenses, staff salaries, and savings — all in dedicated tabs.",
                color:
                  "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
              },
              {
                icon: Target,
                title: "Spending Plans",
                desc: "Plan your income before you spend it. Allocate every amount to Rent, Groceries, Travel, or Savings — with live balance updates.",
                color:
                  "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
              },
              {
                icon: MapPin,
                title: "Trip Budget Planner",
                desc: "Plan your next trip by category. Budget for transport, food, accommodation, and activities — with emergency funds built in.",
                color:
                  "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
              },
              {
                icon: BarChart3,
                title: "Visual Insights",
                desc: "Beautiful charts show your spending trends over time. Spot patterns, cut waste, and make smarter decisions.",
                color:
                  "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
              },
              {
                icon: Globe,
                title: "24 Currencies",
                desc: "Choose from NGN, USD, EUR, GBP, INR, JPY, and many more. Every transaction is recorded in your chosen currency.",
                color:
                  "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* EXPENSES DEEP DIVE */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="inline-block text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              Daily Tracking
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
              Know Exactly Where Your Money Goes
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              No more guessing at the end of the month. Log every expense in
              seconds — whether it's groceries, coffee, or a taxi fare.
              TrackCash shows you daily totals, weekly trends, and monthly
              summaries, so nothing slips through the cracks.
            </p>
            <ul className="space-y-3">
              {[
                "Quick-log with pre-loaded common items",
                "Automatic daily and monthly totals",
                "Beautiful charts showing your spending trends",
                "Top 3 highest-price items ranked automatically",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" /> Today's Spend
                </p>
                <p className="text-xs text-gray-400">Aug 2026</p>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: "Rice (5kg)", price: "₦4,500" },
                  { name: "Tomatoes", price: "₦1,200" },
                  { name: "Cooking Oil", price: "₦2,800" },
                  { name: "Transport", price: "₦1,500" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.price}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t-2 border-primary-100 dark:border-primary-900">
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    Total
                  </span>
                  <span className="text-lg font-extrabold text-primary dark:text-primary-400">
                    ₦10,000
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BUSINESS DEEP DIVE */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" /> Business Hub
                </p>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  This Month
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                {[
                  {
                    label: "Revenue",
                    value: "₦320,000",
                    color: "text-green-600",
                  },
                  {
                    label: "Expenses",
                    value: "₦85,000",
                    color: "text-red-500",
                  },
                  {
                    label: "Staff",
                    value: "₦60,000",
                    color: "text-blue-600",
                  },
                  {
                    label: "Balance",
                    value: "₦175,000",
                    color: "text-primary",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3"
                  >
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className={`text-base font-bold ${item.color}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                <p className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wider mb-1">
                  Recent Sale
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Consulting Session — Client
                </p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  + ₦15,000
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="order-1 lg:order-2"
          >
            <span className="inline-block text-xs font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              Business Tools
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
              Run Your Business Like a Pro
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Whether you're a freelancer, shop owner, hairstylist, food vendor,
              or consultant — TrackCash gives you dedicated tabs for tracking
              sales, expenses, staff salaries, and business savings. See exactly
              how much profit you're making in real time.
            </p>
            <ul className="space-y-3">
              {[
                "Dedicated tabs for Sales, Expenses, Staff & Savings",
                "Filter transactions by type and date range",
                "Archive view for any past month",
                "All-time revenue breakdown by month",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* PLAN DEEP DIVE */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="inline-block text-xs font-bold text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              Smart Budgeting
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
              Plan Every Amount Before You Spend It
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Got ₦100,000 coming in this month? Decide exactly where every
              Naira goes before it disappears. Allocate to Rent, Groceries,
              Travel, Savings, and more — then watch your remaining balance in
              real time as you plan.
            </p>
            <ul className="space-y-3">
              {[
                "Create a plan in under 2 minutes",
                "Pre-loaded with practical categories",
                "Real-time remaining balance indicator",
                "Save and review all your past plans",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5">
              <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-purple-500" /> Monthly Plan
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 mb-3">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Income
                </p>
                <p className="text-xl font-extrabold text-green-600">
                  ₦100,000
                </p>
              </div>
              <div className="space-y-2">
                {[
                  { cat: "Rent", amt: "₦30,000" },
                  { cat: "Groceries", amt: "₦25,000" },
                  { cat: "Travel", amt: "₦15,000" },
                  { cat: "Savings", amt: "₦20,000" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.cat}
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {item.amt}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t-2 border-purple-100 dark:border-purple-900 mt-3">
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                  Remaining
                </span>
                <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
                  ₦10,000
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BLOG */}
      {posts.length > 0 && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-3"
            >
              <div>
                <p className="text-xs font-bold text-primary dark:text-primary-400 uppercase tracking-widest mb-2">
                  From the Blog
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  Money Tips & Guides
                </h2>
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {posts.map((post) => (
                <motion.article key={post.id} variants={fadeUp}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full"
                  >
                    <div className="p-5 flex flex-col h-full">
                      <span className="inline-block text-xs font-semibold text-primary bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 px-2.5 py-1 rounded-full w-fit mb-3">
                        {post.tag}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-primary-900 dark:via-gray-900 dark:to-black">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-secondary/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <Users className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-xs font-medium text-white">
              Join smart savers worldwide
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-base sm:text-lg text-primary-100/90 mb-8 max-w-xl mx-auto">
            Start tracking your money the right way — free, forever. Any
            currency, anywhere in the world. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/register"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-50 transition-all text-sm sm:text-base"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-sm sm:text-base"
            >
              I Already Have an Account
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
