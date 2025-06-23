import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Target,
  Zap,
  BarChart3,
  Save,
  Settings,
  Truck,
  ArrowRight,
  Rocket,
  Route,
  Users,
  Brain,
  AlertTriangle,
} from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen font-display">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <section className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Optimización Inteligente de Rutas
            <span className="block text-blue-600 mt-2">SoftCluVRP</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Plataforma interactiva para resolver el problema de ruteo de
            vehículos con clusters suaves.
          </p>{" "}
          <Link
            to="/test"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-colors text-lg"
          >
            <MapPin className="mr-3 w-5 h-5" />
            Probar Sistema
            <ArrowRight className="ml-3 w-5 h-5" />
          </Link>
        </section>{" "}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
          {[
            [
              <Target className="w-10 h-10 text-indigo-600" />,
              "Clusters Inteligentes",
              "Agrupa puntos de entrega en clusters geográficos para mejorar la eficiencia del recorrido.",
            ],
            [
              <MapPin className="w-10 h-10 text-blue-600" />,
              "Mapa Interactivo",
              "Agrega y edita puntos directamente en el mapa con visualización instantánea.",
            ],
            [
              <Zap className="w-10 h-10 text-yellow-600" />,
              "Optimización en Tiempo Real",
              "Calcula rutas óptimas al instante, respetando la lógica de clusters y capacidades.",
            ],
            [
              <BarChart3 className="w-10 h-10 text-green-600" />,
              "Métricas Detalladas",
              "Visualiza distancia total, penalizaciones y desempeño de cada vehículo.",
            ],
            [
              <Save className="w-10 h-10 text-purple-600" />,
              "Persistencia de Datos",
              "Guarda configuraciones y resultados para usarlos nuevamente.",
            ],
            [
              <Settings className="w-10 h-10 text-gray-600" />,
              "Configuración Flexible",
              "Ajusta parámetros de vehículos, demandas, penalizaciones y más.",
            ],
          ].map(([icon, title, desc], i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="mb-4 flex justify-center">{icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                {title}
              </h3>
              <p className="text-gray-600 text-center">{desc}</p>
            </div>
          ))}
        </section>{" "}
        <section className="bg-white rounded-xl shadow-md p-10 mb-20">
          <div className="flex items-center justify-center mb-8">
            <Brain className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-center">
              ¿Qué es SoftCluVRP?
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8 text-gray-700">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Route className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    Problema de Ruteo
                  </h4>
                  <p>
                    El VRP busca las rutas más eficientes para vehículos que
                    deben visitar clientes, minimizando la distancia total
                    recorrida.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    Clusters Suaves
                  </h4>
                  <p>
                    Permiten romper grupos de clientes si es necesario,
                    aplicando penalizaciones controladas por heurísticas
                    inteligentes.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Brain className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold mb-2">
                    Algoritmo Heurístico
                  </h4>
                  <p>
                    El sistema utiliza un enfoque greedy adaptado, con
                    penalizaciones por violación de cluster, permitiendo
                    flexibilidad optimizada.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold mb-2">Penalizaciones</h4>
                  <p>
                    Si un cluster no se recorre de forma consecutiva o completa,
                    se penaliza, empujando la solución a mantener coherencia
                    estructural.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
