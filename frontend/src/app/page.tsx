import Link from 'next/link';
import { FiCalendar, FiShield, FiCreditCard, FiBarChart2, FiZap, FiBell, FiArrowRight } from 'react-icons/fi';

const features = [
  {
    icon: <FiCalendar className="h-6 w-6" />,
    title: 'Reservas en Tiempo Real',
    desc: 'Sistema de reservas con control de concurrencia transaccional. Sin dobles reservas.',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    icon: <FiCreditCard className="h-6 w-6" />,
    title: 'Pagos con Stripe',
    desc: 'Payment Intents con validación por webhook. Seguro y confiable.',
    color: 'from-emerald-500 to-teal-400'
  },
  {
    icon: <FiShield className="h-6 w-6" />,
    title: 'Autenticación Segura',
    desc: 'Tokens de acceso y refresh con rotación automática. Seguridad enterprise.',
    color: 'from-violet-500 to-purple-400'
  },
  {
    icon: <FiBell className="h-6 w-6" />,
    title: 'Notificaciones',
    desc: 'Correos automáticos al crear, confirmar o cancelar reservas.',
    color: 'from-amber-400 to-orange-400'
  },
  {
    icon: <FiBarChart2 className="h-6 w-6" />,
    title: 'Panel de Estadísticas',
    desc: 'Dashboard con métricas de ingresos, reservas y ocupación.',
    color: 'from-rose-400 to-pink-500'
  },
  {
    icon: <FiZap className="h-6 w-6" />,
    title: 'Arquitectura Escalable',
    desc: 'NestJS + Prisma + Next.js. Event-driven, SOLID, lista para producción.',
    color: 'from-indigo-500 to-blue-500'
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-blue-100 shadow-sm mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-blue-900">ReservasPro v2.0 ya disponible</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--foreground)] tracking-tight mb-8 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
            Gestión de reservas <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
              simplificada
            </span>
          </h1>
          
          <p className="mt-4 text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            La plataforma definitiva para administrar tus espacios, automatizar pagos y brindar una experiencia premium a tus clientes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-[var(--primary)] border border-transparent rounded-full hover:bg-[var(--primary-hover)] hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 w-full sm:w-auto"
            >
              Comenzar Gratis
              <FiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-[var(--foreground)] transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:shadow-md hover:-translate-y-1 w-full sm:w-auto"
            >
              Explorar Recursos
            </Link>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-1/4 left-10 md:left-20 w-64 h-64 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-10 md:right-20 w-72 h-72 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </section>

      {/* Glass Showcase Section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 z-20">
        <div className="glass rounded-3xl p-4 md:p-8 shadow-2xl shadow-blue-900/10 border border-white/60 bg-white/40 backdrop-blur-2xl transform transition-transform hover:scale-[1.01] duration-500">
           <div className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden relative group">
              {/* Abstract structural representation of UI */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <div className="flex flex-col gap-4 w-3/4 max-w-lg z-10 p-6 glass rounded-2xl shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500">
                <div className="h-8 w-3/4 bg-blue-100 rounded-lg"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="h-24 bg-white rounded-xl shadow-sm border border-gray-100"></div>
                  <div className="h-24 bg-white rounded-xl shadow-sm border border-gray-100"></div>
                </div>
                <div className="h-10 w-full bg-[var(--primary)] rounded-lg mt-2"></div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[var(--primary)] uppercase mb-3">Características</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-6">
              Todo lo que necesitas para tu negocio
            </h3>
            <p className="text-lg text-[var(--text-secondary)]">
              Hemos diseñado ReservasPro pensando en la eficiencia, brindándote herramientas poderosas en una interfaz elegante y fácil de usar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-6 shadow-md shadow-[var(--primary)]/20 transform group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold text-[var(--foreground)] mb-3 group-hover:text-[var(--primary)] transition-colors">{f.title}</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="mt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative rounded-3xl overflow-hidden bg-blue-900 border border-blue-800 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900"></div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-400 opacity-20 blur-3xl"></div>
          
          <div className="relative p-12 md:p-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para modernizar tus reservas?
              </h2>
              <p className="text-blue-100 text-lg">
                Únete hoy y transforma la manera en que gestionas tus espacios. Configuración rápida y sin complicaciones.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-blue-900 bg-white rounded-full hover:bg-blue-50 hover:shadow-lg transition-all hover:scale-105"
              >
                Crear Cuenta Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-gray-200 py-10 mt-auto bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center font-bold text-xs text-gray-400">R</div>
            <span className="font-semibold text-gray-500">ReservasPro</span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Creado con Stripe, Next.js y NestJS.
          </p>
        </div>
      </footer>
    </div>
  );
}
