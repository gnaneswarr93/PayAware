import { Link } from 'react-router-dom';
import { Target, Users, Lightbulb, Award, Shield, Heart, ArrowRight, Rocket, Calendar } from "lucide-react";

const About = () => {
  return (
    <div className="py-16 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800 mb-6">
            <Heart className="h-4 w-4" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            About
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
              PayAware
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to revolutionize personal finance management
            through intelligent automation and AI-powered insights.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl w-fit mb-6">
              <Target className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              To empower individuals with intelligent financial tools that make
              expense tracking effortless, insightful, and actionable. We
              believe that everyone deserves to have clear visibility into their
              spending habits without the hassle of manual data entry.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              By leveraging cutting-edge AI and machine learning technologies,
              we're transforming how people interact with their finances, making
              smart financial decisions accessible to everyone.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-4">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Platform Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  2.5K+
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">Active Users</div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  95%
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">AI Accuracy Rate</div>
              </div>
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  150K+
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">Transactions Tracked</div>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  24/7
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">AI Monitoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 mb-16 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-xl w-fit mx-auto mb-6">
              <Lightbulb className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Our Story</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              The idea for <strong className="text-gray-800 dark:text-white">PayAware</strong> was born from a simple frustration: the tedious
              process of manually tracking every expense. Our team, like
              millions of others, struggled to maintain accurate financial
              records while juggling a busy lifestyle.
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              After missing yet another budget target due to poor expense
              tracking, the vision became clear: what if AI could automatically
              handle the mundane task of expense recording while providing
              intelligent insights about spending patterns?
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              We noticed that Indian users had a unique challenge — UPI payments, diverse bank SMS formats, 
              and mixed-language transaction descriptions made generic trackers unreliable. 
              PayAware was built ground-up to handle these nuances with a custom-trained ML model.
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Months of development, training data collection, and refinement later, PayAware was launched. 
              Today, we serve a growing community of users
              who have transformed their financial habits through our
              intelligent automation platform.
            </p>
          </div>
        </div>

        {/* Timeline / Milestones */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Our Journey</h2>
            <p className="text-gray-600 dark:text-gray-300">Key milestones in PayAware's development</p>
          </div>

          <div className="max-w-3xl mx-auto relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500"></div>

            {[
              {
                date: "2024 Q3",
                title: "The Idea",
                description: "Identified the gap in Indian expense tracking — SMS parsing, UPI, and AI categorization.",
                icon: <Lightbulb className="h-5 w-5" />,
                side: "left"
              },
              {
                date: "2024 Q4",
                title: "ML Model Training",
                description: "Trained our expense classification model with 17+ categories tailored for Indian transactions.",
                icon: <Rocket className="h-5 w-5" />,
                side: "right"
              },
              {
                date: "2025 Q1",
                title: "Beta Launch",
                description: "Released PayAware beta with core SMS detection and AI categorization features.",
                icon: <Calendar className="h-5 w-5" />,
                side: "left"
              },
              {
                date: "2025 Q2",
                title: "Growing Community",
                description: "Crossed 2,500+ active users with 95% AI categorization accuracy.",
                icon: <Users className="h-5 w-5" />,
                side: "right"
              }
            ].map((item, index) => (
              <div key={index} className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-4 border-blue-500 rounded-full transform -translate-x-1/2 z-10"></div>
                
                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto md:pr-8 md:text-right' : 'md:ml-auto md:pl-8'}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{item.date}</span>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-1 mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Meet the Team</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The passionate individuals behind PayAware, driven by the vision of making finance management effortless.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: "Risheendra",
                role: "Founder & Lead Developer",
                initials: "R",
                gradient: "from-blue-500 to-purple-500",
                bio: "Full-stack developer with a passion for AI/ML and personal finance tools."
              },
              {
                name: "AI/ML Team",
                role: "Model Development",
                initials: "AI",
                gradient: "from-purple-500 to-pink-500",
                bio: "Responsible for training and refining the expense classification model."
              },
              {
                name: "Community",
                role: "Beta Testers & Contributors",
                initials: "C",
                gradient: "from-green-500 to-teal-500",
                bio: "Our growing community of users who help shape PayAware with feedback."
              }
            ].map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all duration-300 group">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${member.gradient} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{member.name}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The principles that guide everything we do at PayAware.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "User-Centric Design",
                description:
                  "Every feature is built with our users' needs and experiences at the forefront. We listen, iterate, and improve.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Innovation Excellence",
                description:
                  "We constantly push the boundaries of what's possible in financial technology with cutting-edge AI.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Privacy First",
                description:
                  "Your financial data security and privacy are our highest priorities. Your data stays yours.",
                gradient: "from-green-500 to-teal-500",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group text-center border border-gray-100 dark:border-gray-700">
                <div
                  className={`bg-gradient-to-r ${value.gradient} text-white p-4 rounded-xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
              Be part of the growing community that's transforming personal finance management with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
