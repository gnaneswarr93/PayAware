import { Link } from 'react-router-dom';
import { Brain, Bell, BarChart3, Smartphone, PieChart, Shield, ArrowRight, Wallet, Sparkles, TrendingUp } from 'lucide-react';

const Features = () => {
  const coreFeatures = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Deep AI Categorization",
      description: "Our advanced AI doesn't just guess 'Food'. It understands 'Swiggy' is 'Food > Delivery' and 'Rent' is 'Housing > Bills'.",
      gradient: "from-blue-600 to-indigo-600",
      tag: "Core"
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Zero-Click Logging",
      description: "Just type 'Paid rent' and hit save. The AI auto-fills the Amount, Category, and Sub-Category instantly.",
      gradient: "from-emerald-500 to-teal-500",
      tag: "Core"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Smart Daily Check-ins",
      description: "Missed a transaction? PayAware intelligently nudges you at 9 PM only if you haven't recorded any activity for the day.",
      gradient: "from-amber-500 to-orange-500",
      tag: "Core"
    }
  ];

  const advancedFeatures = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Dedicated Loan Manager",
      description: "Track money you lend, borrow, or pay back. Smartly distinguishes between 'Loan EMI' (Expense) and 'Friend Loan' (Asset).",
      gradient: "from-purple-600 to-pink-600",
      tag: "Advanced"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Granular Analytics",
      description: "Drill down into specific sub-categories. See exactly how much you spent on 'Uber' vs 'Fuel' vs 'Metro'.",
      gradient: "from-cyan-500 to-blue-500",
      tag: "Advanced"
    },
    {
      icon: <PieChart className="h-8 w-8" />,
      title: "Income vs Expense",
      description: "Clear visual breakdown of your cash flow. Track Salary, Freelance, and Passive income separately from expenses.",
      gradient: "from-rose-500 to-red-500",
      tag: "Advanced"
    }
  ];

  return (
    <div className="py-16 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800 mb-6">
            <Sparkles className="h-4 w-4" />
            Everything you need
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
              Smart Tracking
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover how PayAware's AI-powered expense tracker revolutionizes personal finance management 
            with intelligent automation and insightful analytics.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
              Core Features
            </div>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-gray-100 dark:border-gray-700 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${feature.gradient} opacity-5 rounded-bl-full`}></div>
                <div className={`bg-gradient-to-r ${feature.gradient} text-white p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Features */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
              Advanced Features
            </div>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-gray-100 dark:border-gray-700 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${feature.gradient} opacity-5 rounded-bl-full`}></div>
                <div className={`bg-gradient-to-r ${feature.gradient} text-white p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 mb-16 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              See It In Action
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Here's how PayAware works in real-time to simplify your finances
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connecting arrows for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-green-300 dark:from-blue-700 dark:via-purple-700 dark:to-green-700"></div>

            {[
              {
                icon: <Smartphone className="h-10 w-10" />,
                gradient: "from-blue-500 to-cyan-500",
                step: "1",
                title: "SMS Detection",
                description: "Transaction SMS automatically parsed and amount, type extracted"
              },
              {
                icon: <Bell className="h-10 w-10" />,
                gradient: "from-purple-500 to-pink-500",
                step: "2",
                title: "Smart Prompt",
                description: "Popup asks for purpose and location details for context"
              },
              {
                icon: <Brain className="h-10 w-10" />,
                gradient: "from-amber-500 to-orange-500",
                step: "3",
                title: "AI Categorization",
                description: "AI classifies into precise category and sub-category instantly"
              },
              {
                icon: <TrendingUp className="h-10 w-10" />,
                gradient: "from-green-500 to-teal-500",
                step: "4",
                title: "Dashboard Update",
                description: "Your analytics and budgets update in real-time automatically"
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative z-10">
                <div className={`bg-gradient-to-r ${item.gradient} text-white p-5 rounded-xl mb-4 mx-auto w-fit shadow-lg`}>
                  {item.icon}
                </div>
                <div className="absolute -top-2 left-1/2 ml-8 bg-white dark:bg-gray-800 text-gray-800 dark:text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 mb-16 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Coming Soon
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">More Features on the Way</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              We're working hard to bring you budget alerts, receipt scanning, multi-currency support, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Budget Alerts", "Receipt Scanner", "Multi-Currency", "Investment Tracking", "Family Sharing"].map((item) => (
                <span key={item} className="bg-white dark:bg-gray-700 px-4 py-2 rounded-full text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">Ready to Take Control?</h2>
            <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
              Start using PayAware today and never lose track of your expenses again.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg group"
            >
              Start Using PayAware Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;