import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Shield,
  Smartphone,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  DollarSign,
  PieChart,
  FileText
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Dashboard Analitik",
      description: "Visualisasi data keuangan yang komprehensif dengan grafik dan chart interaktif"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-success" />,
      title: "Manajemen Transaksi",
      description: "Catat, edit, dan kelola semua transaksi keuangan dengan mudah dan efisien"
    },
    {
      icon: <PieChart className="h-8 w-8 text-primary" />,
      title: "Laporan Keuangan",
      description: "Generate laporan keuangan detail dengan export ke Excel untuk analisis mendalam"
    },
    {
      icon: <Shield className="h-8 w-8 text-destructive" />,
      title: "Keamanan Tinggi",
      description: "Sistem autentikasi yang aman dengan enkripsi data tingkat enterprise"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: "Responsive Design",
      description: "Akses dari perangkat apapun dengan tampilan yang optimal di semua layar"
    },
    {
      icon: <Zap className="h-8 w-8 text-warning" />,
      title: "Performa Cepat",
      description: "Loading super cepat dengan teknologi modern untuk pengalaman pengguna terbaik"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart",
      content: "CashTracker mengubah cara kami mengelola keuangan. Dashboard yang intuitif dan laporan yang detail sangat membantu pengambilan keputusan bisnis.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Finance Manager",
      content: "Aplikasi terbaik untuk tracking keuangan! Fitur export Excel sangat memudahkan untuk presentasi ke stakeholder.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      role: "Small Business Owner",
      content: "Interface yang user-friendly dan fitur yang lengkap. Sangat recommended untuk UMKM yang ingin mengelola keuangan dengan profesional.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">
                CashTracker
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Fitur
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">
                Testimoni
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                Harga
              </a>
              <Link to="/login">
                <Button variant="outline" className="mr-2">
                  Masuk
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-primary hover:bg-primary/90">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
              🚀 Platform Manajemen Keuangan Terdepan
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Kelola Keuangan
              <span className="block text-primary">
                Lebih Cerdas
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Platform all-in-one untuk mengelola transaksi, menganalisis keuangan, dan membuat laporan profesional. 
              Tingkatkan efisiensi bisnis Anda dengan teknologi terdepan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
                  Mulai Gratis Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 cursor-pointer">
                Lihat Demo
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <div className="text-gray-600">Pengguna Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary">
              ✨ Fitur Unggulan
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Semua yang Anda Butuhkan
              <span className="block text-primary">dalam Satu Platform</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fitur lengkap dan canggih yang dirancang khusus untuk memenuhi kebutuhan manajemen keuangan modern
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-success/10 text-success">
              💬 Testimoni
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Dipercaya oleh
              <span className="block text-primary">Ribuan Pengguna</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Siap Mengoptimalkan
            <span className="block">Keuangan Anda?</span>
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan mengelola keuangan dengan CashTracker
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4">
                Mulai Sekarang - Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-primary text-lg px-8 py-4">
              Hubungi Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">CashTracker</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Platform manajemen keuangan terdepan yang membantu bisnis mengelola transaksi, 
                menganalisis data, dan membuat laporan profesional dengan mudah.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-400 hover:text-white">
                  Facebook
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-400 hover:text-white">
                  Twitter
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-400 hover:text-white">
                  LinkedIn
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produk</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Transaksi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Laporan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Dukungan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Dokumentasi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorial</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 CashTracker. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;