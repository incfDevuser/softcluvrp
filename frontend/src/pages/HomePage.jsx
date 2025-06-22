import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen font-display">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <section className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Optimización Inteligente de Rutas
            <span className="block text-indigo-600 mt-2">SoftCluVRP</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Plataforma interactiva para resolver el problema de ruteo de
            vehículos con clusters suaves.
          </p>
          <Link
            to="/test"
            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition-colors text-lg"
          >
            🗺️ Probar Sistema
            <svg
              className="ml-3 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
          {[
            [
              "🎯",
              "Clusters Inteligentes",
              "Agrupa puntos de entrega en clusters geográficos para mejorar la eficiencia del recorrido.",
            ],
            [
              "📍",
              "Mapa Interactivo",
              "Agrega y edita puntos directamente en el mapa con visualización instantánea.",
            ],
            [
              "⚡",
              "Optimización en Tiempo Real",
              "Calcula rutas óptimas al instante, respetando la lógica de clusters y capacidades.",
            ],
            [
              "📊",
              "Métricas Detalladas",
              "Visualiza distancia total, penalizaciones y desempeño de cada vehículo.",
            ],
            [
              "💾",
              "Persistencia de Datos",
              "Guarda configuraciones y resultados para usarlos nuevamente.",
            ],
            [
              "🔧",
              "Configuración Flexible",
              "Ajusta parámetros de vehículos, demandas, penalizaciones y más.",
            ],
          ].map(([icon, title, desc], i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {title}
              </h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-xl shadow-md p-10 mb-20">
          <h3 className="text-2xl font-bold text-center mb-8">
            ¿Qué es SoftCluVRP?
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-gray-700">
            <div>
              <h4 className="text-lg font-semibold mb-2">Problema de Ruteo</h4>
              <p className="mb-4">
                El VRP busca las rutas más eficientes para vehículos que deben
                visitar clientes, minimizando la distancia total recorrida.
              </p>
              <h4 className="text-lg font-semibold mb-2">Clusters Suaves</h4>
              <p>
                Permiten romper grupos de clientes si es necesario, aplicando
                penalizaciones controladas por heurísticas inteligentes.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">
                Algoritmo Heurístico
              </h4>
              <p className="mb-4">
                El sistema utiliza un enfoque greedy adaptado, con
                penalizaciones por violación de cluster, permitiendo
                flexibilidad optimizada.
              </p>
              <h4 className="text-lg font-semibold mb-2">Penalizaciones</h4>
              <p>
                Si un cluster no se recorre de forma consecutiva o completa, se
                penaliza, empujando la solución a mantener coherencia
                estructural.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center bg-indigo-600 text-white rounded-xl p-12 shadow-md">
          <h3 className="text-3xl font-bold mb-4">¿Listo para Optimizar?</h3>
          <p className="text-lg mb-8 text-indigo-100">
            Experimenta con tus propios puntos y parámetros. Calcula rutas
            óptimas con solo unos clics.
          </p>
          <Link
            to="/test"
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow hover:bg-gray-50 transition-colors duration-200 text-lg"
          >
            🚀 Comenzar Ahora
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
