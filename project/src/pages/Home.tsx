import { Link } from 'react-router-dom';
import { Brain, BarChart3, Smartphone, Star, Shield, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import HeroChart from '../components/HeroChart';

const Home = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="space-y-8 z-10 text-center lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 shadow-sm animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                AI-Powered 2.0 is live
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Master your money with <span className="text-indigo-600 dark:text-indigo-500">Intelligent AI</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Stop tracking manually. PayAware connects to your financial life, categorizes every expense instantly, and gives you clarity in seconds.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 flex items-center justify-center group"
              >
                Start for Free
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/features"
                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all duration-300 flex items-center justify-center shadow-lg shadow-slate-200/50 dark:shadow-none"
              >
                Explore Features
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-sm font-medium text-slate-500 dark:text-slate-400 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {['No credit card required', '14-day free trial', 'Bank-level security'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="relative bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] p-4 shadow-2xl border border-white/50 dark:border-slate-700 transform md:rotate-[-2deg] hover:rotate-0 transition-transform duration-700 ease-out">
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-inner border border-slate-100 dark:border-slate-700">
                <HeroChart />
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 md:-right-12 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none border border-white/20 dark:border-slate-700 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-xl">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Daily Savings</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">+ ₹450.00</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-4 md:-left-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl shadow-purple-100 dark:shadow-none border border-white/20 dark:border-slate-700 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Smart Insight</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Spending Limit Alert</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">Trusted by 2,500+ Early Adopters</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="text-xl font-bold font-mono">FINTECH<span className="text-indigo-600">.IO</span></div>
             <div className="text-xl font-bold font-serif italic">MoneyMatters</div>
             <div className="text-xl font-extrabold tracking-tighter">BUDGET<span className="font-light">AI</span></div>
             <div className="text-xl font-bold font-sans">Spend<span className="text-emerald-500">Wise</span></div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-white dark:bg-slate-950 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Everything you need to grow wealth</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">PayAware replaces your spreadsheet, expense apps, and budgeting notebook with one intelligent platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "SMS Automations",
                desc: "We parse transaction texts from major banks instantly. No manual entry needed.",
                icon: <Smartphone className="h-6 w-6 text-white" />,
                color: "bg-blue-600"
              },
              {
                title: "AI Categorization",
                desc: "Our neural engine learns your spending habits and categorizes with 99% accuracy.",
                icon: <Brain className="h-6 w-6 text-white" />,
                color: "bg-purple-600"
              },
              {
                title: "Visual Forecasting",
                desc: "See where your money is going before it's gone with predictive analytics.",
                icon: <BarChart3 className="h-6 w-6 text-white" />,
                color: "bg-emerald-600"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-none transition-all duration-300">
                <div className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Swipeable on Mobile */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
               <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Don't just take our word for it</h2>
               <p className="text-lg text-slate-600 dark:text-slate-400">Join a community of smart spenders who are mastering their financial future.</p>
            </div>
            <div className="flex gap-2">
               {/* Decorative Controls (Visual only for now) */}
               <button className="p-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><ChevronRight className="h-5 w-5 rotate-180" /></button>
               <button className="p-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>

          {/* Horizontal Scroll Snap Container */}
          <div className="flex overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 gap-6 snap-x snap-mandatory scrollbar-none">
            {[
              {
                name: "Rahul Sharma",
                role: "Product Designer",
                content: "I used to hate end-of-month expensing. PayAware actually makes it fun. The AI is alarmingly good at guessing my categories.",
                stars: 5,
                image: "R"
              },
              {
                 name: "Priya Patel", 
                 role: "Startup Founder",
                 content: "The insights I got in the first week helped me cut my subscription costs by 20%. It literally pays for itself.",
                 stars: 5,
                 image: "P"
              },
              {
                 name: "Amit Kumar",
                 role: "Developer",
                 content: "Finally an app that works with Indian bank SMS formats properly. The UI is slicker than Cred.",
                 stars: 5,
                 image: "A"
              },
               {
                 name: "Sneha Reddy",
                 role: "Marketing Head",
                 content: "Love the dark mode and the privacy focus. It feels secure and fast. Highly recommended.",
                 stars: 4,
                 image: "S"
              }
            ].map((review, i) => (
              <div key={i} className="min-w-[300px] md:min-w-[350px] snap-center bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex gap-1 mb-6">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-lg mb-8 leading-relaxed">"{review.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                    {review.image}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{review.name}</h4>
                    <p className="text-sm text-slate-500">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 container mx-auto px-4">
        <div className="bg-indigo-600 rounded-[3rem] p-8 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
              </svg>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Ready to master your cashflow?</h2>
            <p className="text-indigo-100 text-lg md:text-xl">Join the financial revolution today. No credit card required.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
               <Link to="/signup" className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">Get Started Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-900">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-white">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Shield className="h-5 w-5"/></div>
              PayAware
           </div>
           <p className="text-slate-500 text-sm">© 2024 PayAware Inc. All rights reserved.</p>
           <div className="flex gap-6 text-slate-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;